import * as argon2 from "argon2";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.collection.upsert({
    where: { code: "chunk" },
    update: { name: "语块英语", description: "与短视频内容 1:1 对齐的英语学习单元", sort: 1 },
    create: { code: "chunk", name: "语块英语", description: "与短视频内容 1:1 对齐的英语学习单元", sort: 1 },
  });

  const plans = [
    { code: "free", name: "免费用户", priceCents: 0, durationDays: null, level: 0, sort: 0 },
    { code: "monthly", name: "月度会员", priceCents: 0, durationDays: 30, level: 1, sort: 1 },
    { code: "yearly", name: "年度会员", priceCents: 0, durationDays: 365, level: 1, sort: 2 },
    { code: "lifetime", name: "永久会员", priceCents: 0, durationDays: null, level: 1, sort: 3 },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await argon2.hash(adminPassword, { type: argon2.argon2id });

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: Role.ADMIN, nickname: process.env.SEED_ADMIN_NICKNAME ?? "站长" },
      create: {
        email: adminEmail,
        passwordHash,
        nickname: process.env.SEED_ADMIN_NICKNAME ?? "站长",
        role: Role.ADMIN,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
