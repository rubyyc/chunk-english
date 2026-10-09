# ============================================================
#  chunk-english · 应用镜像（多阶段构建 / Next.js standalone）
#  由 deploy/docker-compose.yml 的 app.build 引用
# ============================================================

# ---------- deps：装依赖（含 dev，供构建用）----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ---------- builder：构建 Next.js ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next 独立产物
ENV NEXT_TELEMETRY_DISABLED=1
# 构建期不可能连生产库，给个占位让 prisma generate / next build 通过
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
RUN npx prisma generate && npm run build

# ---------- runner：运行时（最小镜像）----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# 非 root 运行
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

# standalone 产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma CLI、迁移与 seed 依赖必须在运行时可取到
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --chown=nextjs:nodejs scripts ./scripts

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
