import * as argon2 from "argon2";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, sessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string; nickname?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 10) {
    return NextResponse.json({ error: "请输入有效邮箱和至少 10 位密码。" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "该邮箱已注册。" }, { status: 409 });
  const user = await prisma.user.create({ data: { email, passwordHash: await argon2.hash(password, { type: argon2.argon2id }), nickname: body?.nickname?.trim().slice(0, 40) || null } });
  const response = NextResponse.json({ data: { id: user.id, email: user.email } }, { status: 201 });
  response.cookies.set(sessionCookie.name, await createSession({ userId: user.id, role: user.role }), sessionCookie.options);
  return response;
}
