import { S3Client } from "@aws-sdk/client-s3";
import { getNumberEnvironment } from "@/lib/env";

let client: S3Client | undefined;

export function getS3Client(): S3Client {
  if (client) {
    return client;
  }

  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("S3_ENDPOINT, S3_ACCESS_KEY, and S3_SECRET_KEY must be configured.");
  }

  client = new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}

export const mediaPolicy = {
  getTtlSeconds: getNumberEnvironment("SIGN_GET_TTL", 900),
  putTtlSeconds: getNumberEnvironment("SIGN_PUT_TTL", 600),
  maxShadowBytes: getNumberEnvironment("MAX_SHADOW_BYTES", 8 * 1024 * 1024),
  publicBucket: process.env.S3_BUCKET_PUBLIC ?? "chunk-public",
  privateBucket: process.env.S3_BUCKET_PRIVATE ?? "chunk-private",
};
