import { MembershipStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "未登录。" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, nickname: true, role: true, status: true },
  });
  if (!user) return NextResponse.json({ error: "未登录。" }, { status: 401 });

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, status: MembershipStatus.ACTIVE, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    include: { plan: { select: { code: true, name: true, level: true } } },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({ data: { ...user, membership } });
}
