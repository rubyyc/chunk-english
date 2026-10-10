import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createShadowUpload, signedShadowPlaybackUrl } from "@/lib/shadow";
import { getViewer } from "@/lib/viewer";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer.id) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const shadows = await prisma.shadow.findMany({ where: { userId: viewer.id }, include: { episode: { select: { epNo: true, title: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  const data = await Promise.all(shadows.map(async (shadow) => ({ ...shadow, playbackUrl: await signedShadowPlaybackUrl(shadow.objectKey) })));
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer.id) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const body = await request.json().catch(() => null) as { epNo?: string; itemOrder?: number; durationMs?: number } | null;
  if (!body?.epNo || !body.itemOrder || !body.durationMs) return NextResponse.json({ error: "录音参数无效。" }, { status: 400 });
  try {
    const data = await createShadowUpload(viewer, body.epNo, body.itemOrder, body.durationMs);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const message = code === "QUOTA_EXCEEDED" ? "本集免费跟读次数已用完，开通会员后可无限录制。" : code === "FORBIDDEN" ? "没有跟读权限。" : "录音参数无效。";
    return NextResponse.json({ error: message }, { status: code === "QUOTA_EXCEEDED" ? 403 : 400 });
  }
}
