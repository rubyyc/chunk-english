import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { canAccess, type Viewer } from "@/lib/permission";
import { mediaKey } from "@/lib/media";
import { getS3Client, mediaPolicy } from "@/lib/minio";
import { prisma } from "@/lib/prisma";

export async function createShadowUpload(viewer: Viewer, epNo: string, itemOrder: number, durationMs: number) {
  const episode = await prisma.episode.findFirst({ where: { epNo: epNo.toUpperCase(), published: true }, select: { id: true, epNo: true, isFree: true } });
  if (!viewer.id || !episode || !Number.isInteger(itemOrder) || itemOrder < 1 || itemOrder > 3 || !Number.isInteger(durationMs) || durationMs < 1 || durationMs > 180000) {
    throw new Error("INVALID_SHADOW");
  }

  if (!canAccess(viewer, episode, "shadow")) throw new Error("FORBIDDEN");
  if (!viewer.isAdmin && !viewer.isMember) {
    const quota = Number(process.env.FREE_SHADOW_QUOTA_PER_EP ?? 3);
    const count = await prisma.shadow.count({ where: { userId: viewer.id, episodeId: episode.id } });
    if (count >= quota) throw new Error("QUOTA_EXCEEDED");
  }

  const objectKey = mediaKey(episode.epNo, "shadow", { userId: viewer.id, order: itemOrder, timestamp: Date.now() });
  const shadow = await prisma.shadow.create({ data: { userId: viewer.id, episodeId: episode.id, itemOrder, objectKey, durationMs } });
  const uploadUrl = await getSignedUrl(getS3Client(), new PutObjectCommand({ Bucket: mediaPolicy.privateBucket, Key: objectKey, ContentType: "audio/webm" }), { expiresIn: mediaPolicy.putTtlSeconds });
  return { shadow, uploadUrl, expiresIn: mediaPolicy.putTtlSeconds };
}

export async function signedShadowPlaybackUrl(objectKey: string) {
  return getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: mediaPolicy.privateBucket, Key: objectKey }), { expiresIn: mediaPolicy.getTtlSeconds });
}
