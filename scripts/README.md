# scripts/

网站侧的数据入口脚本目录。

| 脚本 | 状态 | 说明 |
|---|---|---|
| `import_episode.ts` | ✅ 已实现 | 从视频项目导入单集：读 `content/*.json` + `assets/`，可上传 MinIO、写数据库。详见 [../docs/05-内容同步方案.md](../docs/05-内容同步方案.md) |

## 计划用法

```bash
# 演练（不落地）
npm run import:episode -- --ep CK001 --video-root ~/WorkBuddy/英语短视频 --dry-run

# 真导入
npm run import:episode -- --ep CK001 --video-root ~/WorkBuddy/英语短视频 --upload --db

# 全量
npm run import:episode -- --all --video-root ~/WorkBuddy/英语短视频 --upload --db
```

## 依赖

使用项目已有的 Node.js 依赖：`@aws-sdk/client-s3`、Prisma 与 `tsx`。执行前先运行 `npm install`。

## 约束

- **幂等**：同参数重复执行结果一致。
- **不静默跳过**：关键音频缺失（如 `01_en.mp3`）直接报错退出。
- **不覆盖后台编辑**：`is_free` / `published` 默认不动，要覆盖需显式 `--force-meta`。
- **单向数据流**：只往网站写，**绝不回写视频项目**。
