# chunk-english · 苑说英语官网

> 与短视频内容 1:1 对齐的英语学习站。视频是钩子，网站是承接与留存。
> 域名：**chunk.rubyc.cn** ｜ 部署：**1Panel 自带 PostgreSQL + Docker + 1Panel 网站反代** ｜ 媒资：**独立 MinIO 容器**

---

## 〇、AI 工具协作（先看这个）

本项目由多个 AI 开发工具（CodeBuddy / Codex / Claude Code / Cursor 等）接力开发。

| 文件 | 作用 |
|---|---|
| **[AGENTS.md](AGENTS.md)** | 🔴 宪法：**任务前 `git pull --rebase`，任务后 commit + push**（保证代码永远最新）+ 硬约束速览 |
| **[docs/06-开发交接指南.md](docs/06-开发交接指南.md)** | ⭐ 接手必读：项目全貌、进度快照、决策记录、目录结构、设计系统、路线图、任务 SOP |

## 一、这个站解决什么问题

抖音/B站只能给"看一遍"的体验，留不住人也收不到人。网站要承接三件事：

| 目标 | 靠什么实现 |
|---|---|
| **留存** | 单集可反复练：跟读、出题、换词表逐词发音（视频里一闪而过的 20 个词，站上能一个个点着听） |
| **沉淀** | 按编号组织全集 + 全站词库检索，做成"可检索的口语弹药库"（同时喂 GEO/AI 搜索） |
| **变现** | 会员等级 + 权限：免费看前 5 集，会员解锁全集、音频下载、更高跟读次数 |

**核心差异**：视频里的六类卡片（封面/教框架/例句/出题/收尾/换词表）在网站上变成**可交互的学习单元**，不是把视频往页面上一嵌了事。

## 二、当前进度（2026-10-09）

| 阶段 | 状态 |
|---|---|
| 规划文档 + 部署件 | ✅ docs/01~06 + deploy/ |
| 静态 UI | ✅ **18 页全部完成**（v3 暖纸编辑风 + 深色页脚 + 移动端适配），含 Logo 四件套 |
| M0 工程地基（Next.js + Prisma + PG + MinIO） | ⬜ 下一步，见 [docs/06 §7](docs/06-开发交接指南.md) |
| M1 内容只读 / M2 会员权限 | ⬜ |

本地预览：`python3 -m http.server 8799 --directory static-pages` → http://127.0.0.1:8799

## 三、内容资产（上游契约）

单集数据源：`../content/CK00X-<slug>.json`（视频项目，**内容唯一真源**），实际资产分三处：

| 资产 | 位置 | 用途 |
|---|---|---|
| 单集结构数据 | `../content/CK001-get-to.json` | framework / items[3] / extend.words[20] |
| 成片 + 封面 | `../产物/语块英语/CK001-get-to/{抖音,视频号,B站}/` | 站内播放、封面 |
| 音频（TTS 分立文件） | `../assets/chunk/audio/ck001/*.mp3` | 跟读、逐词发音（**上 MinIO**） |
| 卡片静态图 | `../assets/chunk/audio/ck001/cards/*.png` | 学习单元配图 |

音频文件名与站内交互的映射（**交互设计就建立在这上面**）：

| 文件 | 站内交互 |
|---|---|
| `00_teach.mp3` | 「听框架」按钮 |
| `0N_en.mp3` / `0N_zh.mp3` | 例句跟读（英/中） |
| `ext_w00~19.mp3` | **换词表每行一个喇叭**（会员锁定项） |
| `00_hook` / `98_extend` / `99_outro` | 片头 / 引导 / 收尾 |

## 四、文档索引

| 文档 | 内容 |
|---|---|
| [AGENTS.md](AGENTS.md) | 🔴 宪法：工作流（pull/push 铁律）+ 硬约束速览 |
| [docs/01-技术方案.md](docs/01-技术方案.md) | 架构选型（含备选对比）、仓库目录、技术栈、里程碑 |
| [docs/02-功能模块与页面结构.md](docs/02-功能模块与页面结构.md) | 7 大功能模块、站点地图、核心页线框 |
| [docs/03-数据模型与接口.md](docs/03-数据模型与接口.md) | 表设计、权限模型、API 清单、MinIO 对象 Key 规范 |
| [docs/04-部署与域名配置.md](docs/04-部署与域名配置.md) | 1Panel 全流程、MinIO 独立容器、Nginx 反代、SSL、备份、坑表 |
| [docs/05-内容同步方案.md](docs/05-内容同步方案.md) | 视频项目 → 网站/MinIO 的导入脚本与流程 |
| [docs/06-开发交接指南.md](docs/06-开发交接指南.md) | ⭐ AI 工具接手必读：进度/决策/结构/SOP |
| [deploy/](deploy/) | docker-compose.yml / Dockerfile / .env.example / nginx 片段 |

## 五、静态 UI 站点地图（18 页已实现）

```
公开（9）                 个人中心（5）              后台（4）
/index     着陆页⭐        /me          总览        /admin-stats    概览
/episode   单集学习⭐      /me-progress 学习进度     /admin-episodes 内容管理
/chunk     合集列表        /me-words    生词本       /admin-members  会员管理
/words     词库检索        /me-records  跟读记录     /admin-codes    兑换码
/pricing   会员定价        /me-settings 账户设置
/login /forgot /about /logo（品牌规范）
```

正式工程站点地图与线框见 [docs/02](docs/02-功能模块与页面结构.md)。

## 六、关键决策状态

**已定**：Next.js 15 全栈单体 + Prisma + **1Panel 自带 PostgreSQL**（容器名直连，不新装）+ 独立 MinIO 容器（应用商店安装）；应用 Docker 化，**1Panel 网站反向代理 `chunk.rubyc.cn`**；视觉 = 暖纸编辑风 v3（朱红 #E23C20 / 暖墨 #181613 / 纸白 #FBF9F5，真源 `static-pages/styles.css`）。

**默认推进中**（静态 UI 已按此实现，正式开发前可与用户确认）：免费前 5 集 ｜ 站内直连 MinIO 播放 ｜ 一期兑换码 + 手动开通 ｜ 跟读一期只录音回放。完整决策记录见 [docs/06 §3](docs/06-开发交接指南.md)。
