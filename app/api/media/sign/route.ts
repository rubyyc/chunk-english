import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getS3Client, mediaPolicy } from "@/lib/minio";
import { getViewer } from "@/lib/viewer";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer.id) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const body = await request.json().catch(() => null) as { key?: string; op?: "get" | "put"; contentType?: string } | null;
  if (!body?.key || (body.op !== "get" && body.op !== "put")) return NextResponse.json({ error: "媒体请求参数无效。" }, { status: 400 });
  if (body.key.startsWith("shadow/")) {
    return NextResponse.json({ error: "跟读录音请通过 /api/shadows 创建。" }, { status: 400 });
  }
  if (!viewer.isMember && !viewer.isAdmin) return NextResponse.json({ error: "该媒体需要会员权限。" }, { status: 403 });
  if (!body.key.startsWith("pack/") || body.op !== "get") return NextResponse.json({ error: "没有该媒体操作权限。" }, { status: 403 });
  const url = await getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: mediaPolicy.privateBucket, Key: body.key }), { expiresIn: mediaPolicy.getTtlSeconds });
  return NextResponse.json({ data: { url, expiresIn: mediaPolicy.getTtlSeconds } });
}
