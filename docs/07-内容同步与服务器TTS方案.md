# 07 · 内容同步与服务器 TTS 生成方案（实施规格书）

> 🔴 **本文档取代 docs/05 的导入方案**（docs/05 已废弃留档，其「数据来源映射表」仍然有效，实施时照读）。
> 读者：接手实施的 AI 工具。开工前先读根目录 `AGENTS.md`（宪法：任务前 `git pull --rebase`，任务后 commit + push）。
> 状态：**用户已拍板（2026-10-09），按此实施，不要重新讨论**。

---

## 一、需求拍板（用户原意，不可更改）

| # | 决策 | 含义 |
|---|---|---|
| 1 | **网站不放视频** | 只需要封面 + 教学内容；`Episode.videoKeyDouyin / videoKeyBili` 字段保留但恒为 null，不实现视频上传 |
| 2 | **音频在服务器生成** | 本地**不生成、不上传任何 mp3**；由服务器 TTS Worker 生成后直写 MinIO |
| 3 | **本地一键只同步数据** | 一条命令把 `content JSON + 封面 + 背景图` 推到服务器管理 API；通道走 **HTTPS + token**，不走 SSH 隧道 |

---

## 二、总体链路

```
本地 Mac（真源）
  content/CKxxx.json（框架·例句·20 词）
  产物/语块英语/CKxxx-*/{抖音,视频号,B站}/cover.png
  assets/chunk/bg/*.png（例句背景图）
        │  sync_episode.py --ep CK001（一键）
        ▼  HTTPS multipart POST（X-Admin-Token）
1Panel Nginx（chunk.rubyc.cn）→ Next.js app（管理 API）
        │  ① 校验 → Episode/EpisodeItem/EpisodeWord upsert（幂等）
        │  ② 建 24 条 TtsJob（textHash 去重复用）
        │  ③ 封面/bg 图直传 MinIO
        ▼
PostgreSQL（tts_jobs 表 = 任务队列，无需 Redis）
        │  轮询领取（FOR UPDATE SKIP LOCKED）
        ▼
chunk-tts Worker（独立 Python 容器，edge-tts）
        │  生成 mp3 → 直写 MinIO（audio/ckxxx/…）
        │  回写 objectKey → EpisodeItem.audioEnKey/audioZhKey、
        │                    EpisodeWord.audioKey、Episode.frameworkAudioKey
        ▼
集子状态机：draft → generating → ready → published（后台手动发布）
```

**为什么走 HTTPS 管理 API 而不是 SSH 隧道**：音频生成在服务器侧，隧道只为写 PG/传图，价值低；API 有鉴权、可观测、后台可复用同一套接口，且不依赖本地能 SSH 到服务器。

---

## 三、音频清单与音色规格（每集 24 段）

**对象 Key 与视频项目文件名完全一致**（`audio/{ep_lower}/{segKey}.mp3`，如 `audio/ck001/ext_w07.mp3`），沿用 docs/05 的 Key 规范。

| segKey 模式 | 段 | 文本来源（content JSON） | voice | rate | 去处（回写字段） |
|---|---|---|---|---|---|
| `00_teach` | 听框架 | `framework.say` | `en-US-EmmaMultilingualNeural` | — | `Episode.frameworkAudioKey`（**新增字段**） |
| `{01..03}_en` | 例句英文 ×3 | `items[i].en` | 同上 | — | `EpisodeItem.audioEnKey` |
| `{01..03}_zh` | 例句中文 ×3 | `items[i].zh` | `zh-CN-XiaoxiaoNeural` | — | `EpisodeItem.audioZhKey` |
| `ext_w{00..19}` | 换词表逐词 ×20 | `extend.words[i].en` | `en-US-EmmaMultilingualNeural` | **`+8%`** | `EpisodeWord.audioKey` |

- ❌ **不生成** `98_extend`（整表连读，视频专用）和 `00_hook`（视频钩子）——网站不需要。
- 🔴 音色铁律（继承视频项目）：只准 `en-US-*`，**禁 en-GB**；此表就是唯一真源，Worker 不允许另行配置。
- edge-tts 输出默认 mp3（24kHz/48kbps/mono）即可满足网页点读，无需转码。

---

## 四、数据模型变更（Prisma）

基于现有 `prisma/schema.prisma`（M0 已建好）：

**1. `Episode` 新增一列**：

```
frameworkAudioKey String? @map("framework_audio_key")   // 00_teach 的对象 Key
```

**2. 新增 `TtsJob` 模型**：

```
model TtsJob {
  id        String   @id @default(cuid())
  episodeId String   @map("episode_id")
  segKey    String   @map("seg_key")      // 00_teach / 01_en / 01_zh / ext_w07 …
  text      String                        // 待合成文本
  voice     String                        // 见第三节音色表
  rate      String?                       // "+8%" 等，空 = 默认
  textHash  String   @map("text_hash")    // sha256(text + voice + rate)
  objectKey String? @map("object_key")   // 生成后的 MinIO Key
  status    String   @default("pending")  // pending|running|done|failed
  attempts  Int      @default(0)
  error     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  episode   Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  @@unique([episodeId, segKey])
  @@index([status])
  @@map("tts_jobs")
}
```

生成一条 migration；`Episode` 与 `TtsJob` 建立关联。

**3. `MediaAsset.kind` 约定值**：`cover_douyin / cover_channels / cover_bilibili / bg / audio`（音频每段一条记录，`isPublic=false`，走 `lib/media.ts` 预签名）。

---

## 五、管理 API 规格（Next.js Route Handlers）

鉴权：请求头 `X-Admin-Token`，与 `.env` 的 `ADMIN_SYNC_TOKEN` 比对（恒定时间比较）；失败 401。仅这几个路由走 token，后台管理页走登录态。

| 方法/路径 | 作用 | 要点 |
|---|---|---|
| `POST /api/admin/episodes/sync` | 一键同步入口 | `multipart/form-data`：`payload`（JSON，见下）+ `cover_douyin/cover_channels/cover_bilibili/bg_*` 文件。① upsert Episode/EpisodeItem/EpisodeWord（按 `epNo`，children 全删重建）② 图直传 MinIO 并写 MediaAsset ③ 按第三节清单 diff 出 TtsJob：`textHash` 命中且 `status=done` 的**复用不重生成**，文本变更的作废重建 ④ 返回 `{episodeId, jobs: {total, reused, pending}}` |
| `GET /api/admin/episodes/[epNo]/sync-status` | 状态查询 | 返回集子状态 + 全部 TtsJob 的 `{segKey, status, objectKey, error}` 汇总；CLI 轮询用 |
| `POST /api/admin/tts-jobs/[id]/retry` | 单条重试 | 置回 `pending`，`attempts` 保留 |
| `POST /api/admin/episodes/[epNo]/publish` | 发布上线 | **守卫**：24 段全部 `done` 才允许置 `published=true`，否则 409 |

**payload JSON 结构**（字段来自 `content/CKxxx.json`，映射关系沿用 docs/05 第一节的表）：

```jsonc
{
  "epNo": "CK001", "collection": "chunk", "index": 1, "slug": "get-to",
  "title": "...", "hook": "...", "coverTitle": "...", "coverSub": "...",
  "framework": { "prefix": "How do I get to the", "suffix": "?", "say": "...", "zh": "...", "note": "..." },
  "items": [ { "order": 1, "word": "subway", "zh": "地铁", "en": "...", "zhText": "...", "bgFile": "bg_subway" } ],  // 3 条
  "words": [ { "order": 0, "word": "bank", "zh": "银行" } ],  // 20 条
  "quizHint": "...", "outro": "...", "isFree": true
}
```

`isFree` 规则：`index <= FREE_EPISODE_LIMIT`（env，默认 5），CLI 侧算好传入。

---

## 六、TTS Worker 规格（独立容器）

**形态**：`deploy/` 新增 `Dockerfile.worker`（Python 3.12-slim + `edge-tts` + `minio` SDK），compose 加服务 `chunk-tts-worker`，与 app 同挂 `1panel-network`，env 复用 `DATABASE_URL / S3_ENDPOINT / S3_ACCESS_KEY / S3_SECRET_KEY / S3_BUCKET`。

**主循环**（伪码级描述，实现自定）：

1. 每 2s 查 `status=pending` 的 TtsJob，`SELECT … FOR UPDATE SKIP LOCKED` 领取，置 `running`；
2. 调 edge-tts 合成（`voice`、`rate` 用任务里的值，**禁止 Worker 内再写音色配置**——真源在第三节）；
3. 成功 → 上传 MinIO `audio/{ep_lower}/{segKey}.mp3` → 置 `done`、写 `objectKey` → 回写对应 `EpisodeItem.audioEnKey/audioZhKey`、`EpisodeWord.audioKey`、`Episode.frameworkAudioKey` → 写一条 `MediaAsset(kind=audio)`；
4. 失败 → `attempts+1`，<3 次自动回 `pending`，≥3 次置 `failed` 并记 `error`；
5. 每集全部 done → Episode 置 `ready`；有 failed → 保持 `generating`，等人工重试。

Worker 无状态、可并发多副本（SKIP LOCKED 天然安全）；先单副本即可。

---

## 七、本地 CLI 规格 `scripts/sync_episode.py`

放本仓库 `scripts/`，在本地 Mac 上跑（用 venv python，仓库根 `.env.local` 或参数提供 `SITE_URL / ADMIN_TOKEN`）：

```
python scripts/sync_episode.py --ep CK001 --video-root ~/WorkBuddy/英语短视频
  1. 读 content/CK001-*.json + 三端封面 + items[].bg 对应的 assets/chunk/bg/*.png
  2. 本地预检：items=3、words=20、字段齐全，缺任何一项直接报错阻断
  3. POST /api/admin/episodes/sync → 打印「新建/复用/待生成」统计
  4. 轮询 sync-status 直到全部 done/failed（默认超时 10 分钟，每 3s 一次）
  5. failed 的打印 segKey + error 一览，退出码非 0

python scripts/sync_episode.py --check        # 只读对比：本地真源清单 vs 服务器库+桶，报告差异
python scripts/sync_episode.py --ep CK001 --fallback-local
                                               # 兜底逃生门：本地 edge-tts 生成 24 段后
                                               # 上传（新增一个 admin 上传音频路由），
                                               # 仅当服务器 TTS 长期不可用时用
```

后续（可选，不在本期）：`AI发布视频流程/publish.py` 加 `--site` 开关，发视频顺手调本 CLI。

### 7.1 既有 `scripts/import_episode.ts` 的处置（🔴 重要）

仓库里已存在 `scripts/import_episode.ts`（npm `import:episode`）——它是按**已废弃的 docs/05 旧方案**实现的：方向是「本地读 `assets/` 音频 → 直传 MinIO/直写 PG」，与新拍板（服务器 TTS、HTTPS API）**方向相反**。

处置规则：

1. **不要在它基础上继续开发**；`npm run import:episode` 不要再用于真实导入；
2. 它的**可复用资产**：content JSON 解析（`SourceEpisode` 类型定义）、真源路径解析（`--video-root` 下各目录）、幂等与「不静默跳过」约束——写 `sync_episode.py` 时照搬这些逻辑；
3. 新 CLI 落地验收（S4 通过）后，将 `import_episode.ts` 删除或在文件头加废弃注释，并同步更新 `scripts/README.md` 状态表（`scripts/README.md` 已于 2026-10-11 标记其作废）。

### 7.2 CLI 语言选择说明

新 CLI 用 **Python** 而非复用 tsx：① 兜底模式需要本地 `edge-tts`（Python 包，与视频流水线同源）；② CLI 与视频项目（Python 系）同机运行，环境一致；③ 服务器侧 Next.js 工程不含此 CLI，语言不影响主工程。

---

## 八、幂等与重复同步策略

- 同一集重复 sync：Episode 按 `epNo` upsert；`EpisodeItem/EpisodeWord` **全删重建**（教学数据以最新真源为准）；
- TtsJob 按 `(episodeId, segKey)` 唯一：`textHash`（text+voice+rate）不变且已 done → **复用**（不重复合成、不重复上传）；变了 → 作废旧任务建新任务；
- 结论：**sync 命令可无脑重跑，不产生脏数据、不浪费合成次数**。

---

## 九、状态机与后台 UI 集成

```
draft（sync 入库，音频未齐）
  → generating（存在 pending/running/failed 的 job）
  → ready（24 段全部 done）
  → published（用户在后台点发布；published 才前台可见）
```

- 「导入永远不等于上线」，决定权在后台手动发布（守卫见第五节）。
- 后台 `admin-episodes` 页（对应静态稿 admin-episodes.html）补一块「TTS 生成进度」：每集 24 段的完成度、失败明细、单条重试按钮、发布按钮（ready 才亮）。

---

## 十、风险与上线前实测（🔴 必做）

**唯一重大风险：服务器（境内）到 edge-tts 依赖的 `speech.platform.bing.com` 连通性不稳。**

实施顺序上必须先做连通性实测，再决定是否需要备选：

1. 服务器上直接跑：`pip install edge-tts && edge-tts --text "hello" --voice en-US-EmmaMultilingualNeural --write-media /tmp/t.mp3`，连续 10 次统计成功率；
2. 成功率 ≥95% → 按本方案直接上；
3. 不稳 → Worker 容器配置走用户现成的 TUN 代理出站（`HTTPS_PROXY` env 即可）；
4. 终极兜底 = CLI 的 `--fallback-local`（本地生成上传，见第七节）。

---

## 十一、实施里程碑（建议顺序）

| 阶段 | 内容 | 验收 |
|---|---|---|
| S1 | Prisma：`frameworkAudioKey` + `TtsJob` + migration | `db:migrate` 通过，typecheck 通过 |
| S2 | 管理 API 四个路由 + token 鉴权 | curl 带 token 能建集/查状态（本地 dev PG） |
| S3 | Worker 容器 + compose 接入 | 本地起 compose，mock 一条 job 全流程跑通 |
| S4 | 本地 CLI（sync + check） | `sync_episode.py --ep CK001` 一条命令全绿 |
| S5 | 后台 admin-episodes 的 TTS 进度 UI | 后台可见 24 段进度、可重试、可发布 |
| S6 | 前台单集页接真数据（`app/api/episodes` 已有雏形） | 点读 24 段全部出声（预签名 URL） |

**总验收**：本地一条命令 → 服务器多出 1 集（数据 + 封面 + 24 段音频）→ 后台点发布 → 前台可学可点读。全程不产生任何 mp3/mp4 经过本地。

---

## 十二、给实施者的检查清单

- [ ] 读过 `AGENTS.md`（宪法）与 `docs/06`（交接指南）再动手
- [ ] 未重新讨论已拍板的三条需求（第一节）
- [ ] 音色表（第三节）原样落地，没有引入 en-GB、没有自创 rate
- [ ] 对象 Key 与视频项目文件名一致（`audio/ck001/…`）
- [ ] `98_extend` / `00_hook` 没有被生成
- [ ] sync 幂等：同一集连跑两次，第二次全部「复用」
- [ ] publish 守卫：音频未齐时 409
- [ ] edge-tts 连通性实测记录写进 PR/commit message
- [ ] 收工 commit + push（宪法）
