import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { sort: "asc" }, select: { code: true, name: true, priceCents: true, durationDays: true, level: true } });
  return NextResponse.json({ data: plans });
}
