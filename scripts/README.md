# scripts/

网站侧的数据入口脚本目录。

| 脚本 | 状态 | 说明 |
|---|---|---|
| `import_episode.py` | **待开发** | 从视频项目导入单集：读 `content/*.json` + `assets/` + `产物/`，上传 MinIO，写数据库。详见 [../docs/05-内容同步方案.md](../docs/05-内容同步方案.md) |

## 计划用法

```bash
# 演练（不落地）
python3 scripts/import_episode.py --ep CK001 --video-root ~/WorkBuddy/英语短视频 --dry-run

# 真导入
python3 scripts/import_episode.py --ep CK001 --video-root ~/WorkBuddy/英语短视频 --upload --db

# 全量
python3 scripts/import_episode.py --all --upload --db
```

## 依赖

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install boto3 psycopg2-binary
```

## 约束

- **幂等**：同参数重复执行结果一致。
- **不静默跳过**：关键音频缺失（如 `01_en.mp3`）直接报错退出。
- **不覆盖后台编辑**：`is_free` / `published` 默认不动，要覆盖需显式 `--force-meta`。
- **单向数据流**：只往网站写，**绝不回写视频项目**。
