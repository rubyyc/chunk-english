import { MembershipSource, MembershipStatus, OrderStatus, PayMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "请先登录后再兑换。" }, { status: 401 });
  const body = await request.json().catch(() => null) as { code?: string } | null;
  const code = body?.code?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "请输入兑换码。" }, { status: 400 });

  try {
    const membership = await prisma.$transaction(async (tx) => {
      const redeemed = await tx.redeemCode.findUnique({ where: { code }, include: { plan: true } });
      if (!redeemed || redeemed.usedBy || (redeemed.expiresAt && redeemed.expiresAt <= new Date())) throw new Error("INVALID_CODE");
      const changed = await tx.redeemCode.updateMany({ where: { id: redeemed.id, usedBy: null }, data: { usedBy: session.userId, usedAt: new Date() } });
      if (changed.count !== 1) throw new Error("INVALID_CODE");
      const order = await tx.order.create({ data: { userId: session.userId, planId: redeemed.planId, amountCents: 0, status: OrderStatus.PAID, payMethod: PayMethod.REDEEM, paidAt: new Date() } });
      const expiresAt = redeemed.plan.durationDays ? new Date(Date.now() + redeemed.plan.durationDays * 24 * 60 * 60 * 1000) : null;
      return tx.membership.create({ data: { userId: session.userId, planId: redeemed.planId, status: MembershipStatus.ACTIVE, source: MembershipSource.REDEEM, orderId: order.id, expiresAt }, include: { plan: { select: { code: true, name: true } } } });
    });
    return NextResponse.json({ data: membership }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CODE") return NextResponse.json({ error: "兑换码无效、已使用或已过期。" }, { status: 400 });
    throw error;
  }
}
