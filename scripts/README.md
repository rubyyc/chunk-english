# scripts/

网站侧的数据入口脚本目录。

| 脚本 | 状态 | 说明 |
|---|---|---|
| `import_episode.ts` | ⚠️ **已作废** | 按旧版 docs/05 写就（本地直传 PG/MinIO 方向）。用户已拍板新方案，**不要在此基础上继续开发**；其 content JSON 解析、真源路径、幂等策略可复用。替代方案见 [../docs/07-内容同步与服务器TTS方案.md](../docs/07-内容同步与服务器TTS方案.md) 第 7 节 |
| `sync_episode.py` | ⬜ 待实施 | 新方案的一键同步 CLI（本地打包 JSON+图 → HTTPS 管理 API → 服务器 TTS 生成音频）。**实施规格已定稿在 docs/07** |

## 新方案要点（详见 docs/07）

- 本地**不生成、不上传任何 mp3 / mp4**；只推 `content JSON + 三端封面 + 例句背景图`
- 音频（每集 24 段）由服务器 `chunk-tts` Worker 用 edge-tts 生成，直写 MinIO
- 对象 Key 与视频项目文件名一致：`audio/ck001/ext_w07.mp3`
- 通道走 HTTPS + `X-Admin-Token`，不走 SSH 隧道

## 依赖

- 旧脚本：项目 Node.js 依赖（`@aws-sdk/client-s3`、Prisma、`tsx`）
- 新 CLI：Python 3（可用系统 python3，无 cv2 需求）；兜底模式才需要本地 `edge-tts`

## 约束（新旧通用）

- **幂等**：同参数重复执行结果一致
- **不静默跳过**：关键数据缺失直接报错退出
- **不覆盖后台编辑**：`is_free` / `published` 默认不动，要覆盖需显式参数
- **单向数据流**：只往网站写，**绝不回写视频项目**
