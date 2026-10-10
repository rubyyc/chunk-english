import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signedShadowPlaybackUrl } from "@/lib/shadow";
import { getViewer } from "@/lib/viewer";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer.id) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const { id } = await params;
  const shadow = await prisma.shadow.findUnique({ where: { id }, select: { userId: true, objectKey: true } });
  if (!shadow) return NextResponse.json({ error: "录音不存在。" }, { status: 404 });
  if (shadow.userId !== viewer.id && !viewer.isAdmin) return NextResponse.json({ error: "没有回放权限。" }, { status: 403 });
  return NextResponse.redirect(await signedShadowPlaybackUrl(shadow.objectKey));
}
