import * as argon2 from "argon2";
import { UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, sessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !body?.password) return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || user.status !== UserStatus.ACTIVE || !(await argon2.verify(user.passwordHash, body.password))) {
    return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
  }
  const response = NextResponse.json({ data: { id: user.id, email: user.email, nickname: user.nickname } });
  response.cookies.set(sessionCookie.name, await createSession({ userId: user.id, role: user.role }), sessionCookie.options);
  return response;
}
