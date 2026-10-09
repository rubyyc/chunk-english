# AGENTS.md · 项目宪法

> 本文件是所有 AI 开发工具（CodeBuddy / Codex / Claude Code / Cursor / Windsurf 等）与人类协作者的**强制工作约定**。
> 接手任何任务前，先读完本文件。详细背景与进度见 `docs/06-开发交接指南.md`。

---

## 🔴 宪法（每次任务必须遵守，不可跳过）

1. **任务开始前：先拉取最新代码**
   ```bash
   git pull --rebase
   ```
   多个 AI 工具并行开发本项目，本地看到的代码**不保证是最新的**。不拉取就动手 = 大概率在旧代码上工作，产生冲突或覆盖他人成果。

2. **任务结束后：必须提交并推送**
   ```bash
   git add -A
   git commit -m "<type>: <中文描述>"
   git push
   ```
   只改不推 = 下一个工具拉不到你的成果，等于没做。

3. **分支模型：单人项目，直接 main**。无 feature 分支、无 PR 流程。`origin/main` 即唯一真源。

4. **禁止 force push**。历史保持线性干净。

5. **提交信息规范**：中文描述 + conventional 前缀：
   `feat:` 新功能 ｜ `fix:` 修复 ｜ `docs:` 文档 ｜ `refactor:` 重构 ｜ `ui:` 视觉调整 ｜ `chore:` 杂项

---

## 项目一句话

**苑说英语官网（chunk.rubyc.cn）**：与《语块英语》短视频 1:1 对齐的英语学习网站。视频是钩子，网站做承接/留存/变现。单集数据、TTS 音频、封面全部来自**父目录的视频生产项目**（`../`，即 `~/WorkBuddy/英语短视频/`）。

## 快速上手

| 需要什么 | 去哪里 |
|---|---|
| 项目全貌 + 当前进度 + 决策记录 | `docs/06-开发交接指南.md` ⭐ **先读这个** |
| 技术架构 / 数据模型 / 部署 / 内容同步 | `docs/01~05` |
| 本地预览静态 UI（18 页） | `python3 -m http.server 8799 --directory static-pages` → http://127.0.0.1:8799 |
| 部署件 | `deploy/`（docker-compose / Dockerfile / .env.example / nginx 片段） |

## 关键硬约束（速览，违反即返工）

- **技术栈（已定）**：Next.js 15 全栈单体 + Prisma + PostgreSQL + 独立 MinIO 容器。不引入第二个后端语言。
- **部署（已拍板）**：数据库用 **1Panel 自带 PostgreSQL**（容器名直连，不新装）；应用 Docker 化（`deploy/docker-compose.yml`）；公网入口 = **1Panel 网站反向代理 `chunk.rubyc.cn` → 127.0.0.1:3000**；MinIO 用 1Panel 应用商店安装的独立容器。
- **视觉令牌（v3 暖纸编辑风）**：朱红 `#E23C20` ｜ 暖墨 `#181613` ｜ 纸白 `#FBF9F5`。
  设计系统真源 = `static-pages/styles.css` 顶部 `:root` 变量。改色改这里，不要在页面里写死。
- **品牌标识**：`static-pages/assets/logo/`（mark / logo / logo-white / favicon，SVG）。页面 brand 一律用 `<img>` 引用，不手写文字 logo。
- **美式英语铁律**：站内所有英文文案、例句、拼写一律美式（subway / restroom / apartment…），拿不准先查证。
- **中文文案按「人话」写**：不翻译腔。
- **内容唯一真源**：`../content/CKxxx-*.json`（视频项目）。网站不自己造内容，只消费它。
- **静态页禁止引入框架**：`static-pages/` 是纯 HTML/CSS/JS 演示稿，不加构建工具。正式工程在根目录另起（见 06 文档路线图）。

## 协作沟通约定

- 与用户（yuanchang）沟通用**中文**，结论先行，表格对比，简洁直接。
- 需求不明确时**先问再做**，不要猜测推进。
- 报错 → 诊断根因 → 修复 → 验证，每个结论要有证据（文件路径、命令输出），不凭空假设。
- 用户可能随时切换/并行使用多个 AI 工具——**你的每一次提交就是交接**，commit message 要让下一个工具看懂改了什么、为什么改。
