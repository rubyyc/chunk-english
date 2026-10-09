import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, extname, join, parse, resolve } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

type SourceItem = { en: string; zh: string; bg?: string };
type SourceWord = { en: string; zh: string };
type SourceEpisode = {
  ep?: string;
  episode?: string;
  collection?: string;
  index?: number | string;
  title?: string;
  hook?: string;
  framework?: string | { prefix?: string; suffix?: string; say?: string; zh?: string; note?: string };
  cover?: { title?: string; sub?: string };
  quiz_hint?: string;
  outro?: string;
  items?: SourceItem[];
  extend?: { words?: SourceWord[] };
};

type Options = {
  ep?: string;
  all: boolean;
  videoRoot: string;
  upload: boolean;
  db: boolean;
  dryRun: boolean;
  forceMeta: boolean;
  forcedFree?: boolean;
};

const prisma = new PrismaClient();

function usage(): never {
  throw new Error("Usage: npm run import:episode -- --ep CK001 --video-root /path --dry-run [--upload] [--db] [--force-meta] [--free|--paid], or use --all.");
}

function parseArgs(args: string[]): Options {
  const options: Partial<Options> = { all: false, upload: false, db: false, dryRun: false, forceMeta: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--ep": options.ep = args[++index]?.toUpperCase(); break;
      case "--all": options.all = true; break;
      case "--video-root": options.videoRoot = args[++index]; break;
      case "--upload": options.upload = true; break;
      case "--db": options.db = true; break;
      case "--dry-run": options.dryRun = true; break;
      case "--force-meta": options.forceMeta = true; break;
      case "--free": options.forcedFree = true; break;
      case "--paid": options.forcedFree = false; break;
      default: usage();
    }
  }

  if ((options.all && options.ep) || (!options.all && !options.ep) || !options.videoRoot) {
    usage();
  }

  return options as Options;
}

function findSource(root: string, ep: string): string {
  const contentDirectory = join(root, "content");
  const filename = readdirSync(contentDirectory).find((file) => file.toUpperCase().startsWith(`${ep}-`) && file.endsWith(".json"));

  if (!filename) {
    throw new Error(`Could not find source JSON for ${ep} in ${contentDirectory}.`);
  }

  return join(contentDirectory, filename);
}

function sourceEpisodes(root: string, ep?: string): string[] {
  if (ep) {
    return [ep];
  }

  return readdirSync(join(root, "content"))
    .filter((file) => /^CK\d{3,}-.*\.json$/i.test(file))
    .map((file) => file.slice(0, file.indexOf("-")).toUpperCase())
    .sort();
}

function audioKey(ep: string, filename: string): string {
  return `audio/${ep.toLowerCase()}/${filename}`;
}

function assertFile(path: string): void {
  if (!existsSync(path) || !statSync(path).isFile()) {
    throw new Error(`Required asset is missing: ${path}`);
  }
}

function requiredAudioFiles(): string[] {
  return [
    "00_hook.mp3",
    "00_teach.mp3",
    "01_en.mp3", "01_zh.mp3", "02_en.mp3", "02_zh.mp3", "03_en.mp3", "03_zh.mp3",
    "98_extend.mp3", "99_outro.mp3",
    ...Array.from({ length: 20 }, (_, index) => `ext_w${index.toString().padStart(2, "0")}.mp3`),
  ];
}

function buildS3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("S3_ENDPOINT, S3_ACCESS_KEY, and S3_SECRET_KEY are required when --upload is used.");
  }

  return new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function uploadFile(client: S3Client, bucket: string, path: string, key: string, contentType: string) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: createReadStream(path),
    ContentType: contentType,
  }));
}

async function uploadAssets(client: S3Client, bucket: string, ep: string, audioDirectory: string) {
  for (const file of requiredAudioFiles()) {
    await uploadFile(client, bucket, join(audioDirectory, file), audioKey(ep, file), "audio/mpeg");
  }
}

function findFirstFile(directory: string, extensions: string[]): string | null {
  if (!existsSync(directory)) {
    return null;
  }

  return readdirSync(directory)
    .map((file) => join(directory, file))
    .find((path) => statSync(path).isFile() && extensions.includes(extname(path).toLowerCase())) ?? null;
}

function frameworkFields(source: SourceEpisode) {
  if (typeof source.framework === "string") {
    return { frameworkSay: source.framework, frameworkPrefix: null, frameworkSuffix: null, frameworkZh: null, frameworkNote: null };
  }

  return {
    frameworkSay: source.framework?.say ?? null,
    frameworkPrefix: source.framework?.prefix ?? null,
    frameworkSuffix: source.framework?.suffix ?? null,
    frameworkZh: source.framework?.zh ?? null,
    frameworkNote: source.framework?.note ?? null,
  };
}

async function importEpisode(options: Options, ep: string) {
  const sourcePath = findSource(options.videoRoot, ep);
  const source = JSON.parse(await readFile(sourcePath, "utf8")) as SourceEpisode;
  const epNo = (source.ep ?? source.episode ?? ep).toUpperCase();
  const index = Number(source.index ?? epNo.replace(/^CK/i, ""));
  const slug = parse(sourcePath).name.replace(new RegExp(`^${epNo}-`, "i"), "") || epNo.toLowerCase();
  const audioDirectory = join(options.videoRoot, "assets", "chunk", "audio", epNo.toLowerCase());
  const productDirectory = join(options.videoRoot, "产物", "语块英语", parse(sourcePath).name);
  const coverPath = findFirstFile(join(productDirectory, "抖音"), [".png", ".jpg", ".jpeg", ".webp"]);
  const videoPath = findFirstFile(join(productDirectory, "抖音"), [".mp4"]);
  const items = source.items ?? [];
  const words = source.extend?.words ?? [];

  if (!source.title || !Number.isInteger(index) || items.length !== 3 || words.length !== 20) {
    throw new Error(`${epNo} source JSON must contain title, a numeric index, 3 items, and 20 extend words.`);
  }

  requiredAudioFiles().forEach((file) => assertFile(join(audioDirectory, file)));
  console.log(`[${epNo}] validated ${items.length} items, ${words.length} words, and ${requiredAudioFiles().length} audio files.`);

  if (options.dryRun) {
    console.log(`[${epNo}] dry run: no assets uploaded and no database rows changed.`);
    return;
  }

  if (options.upload) {
    const client = buildS3Client();
    const bucket = process.env.S3_BUCKET_PUBLIC ?? "chunk-public";
    await uploadAssets(client, bucket, epNo, audioDirectory);

    if (coverPath) {
      await uploadFile(client, bucket, coverPath, `cover/${epNo.toLowerCase()}/vertical${extname(coverPath).toLowerCase()}`, "image/png");
    }
    if (videoPath) {
      await uploadFile(client, bucket, videoPath, `video/${epNo.toLowerCase()}/douyin.mp4`, "video/mp4");
    }
    console.log(`[${epNo}] uploaded audio${coverPath ? ", cover" : ""}${videoPath ? ", video" : ""}.`);
  }

  if (options.db) {
    const collection = await prisma.collection.upsert({
      where: { code: source.collection ?? "chunk" },
      update: {},
      create: { code: source.collection ?? "chunk", name: "语块英语", sort: 1 },
    });
    const framework = frameworkFields(source);
    const freeLimit = Number(process.env.FREE_EPISODE_LIMIT ?? 5);
    const isFree = options.forcedFree ?? index <= freeLimit;

    const episode = await prisma.episode.upsert({
      where: { epNo },
      update: {
        collectionId: collection.id,
        index,
        slug,
        title: source.title,
        hook: source.hook ?? null,
        coverTitle: source.cover?.title ?? null,
        coverSub: source.cover?.sub ?? null,
        quizHint: source.quiz_hint ?? null,
        outro: source.outro ?? null,
        coverKey: coverPath ? `cover/${epNo.toLowerCase()}/vertical${extname(coverPath).toLowerCase()}` : null,
        videoKeyDouyin: videoPath ? `video/${epNo.toLowerCase()}/douyin.mp4` : null,
        ...framework,
        ...(options.forceMeta ? { isFree, published: true } : {}),
      },
      create: {
        collectionId: collection.id,
        epNo,
        index,
        slug,
        title: source.title,
        hook: source.hook ?? null,
        coverTitle: source.cover?.title ?? null,
        coverSub: source.cover?.sub ?? null,
        quizHint: source.quiz_hint ?? null,
        outro: source.outro ?? null,
        coverKey: coverPath ? `cover/${epNo.toLowerCase()}/vertical${extname(coverPath).toLowerCase()}` : null,
        videoKeyDouyin: videoPath ? `video/${epNo.toLowerCase()}/douyin.mp4` : null,
        isFree,
        published: true,
        sort: index,
        ...framework,
      },
    });

    await prisma.$transaction([
      prisma.episodeItem.deleteMany({ where: { episodeId: episode.id } }),
      prisma.episodeWord.deleteMany({ where: { episodeId: episode.id } }),
      prisma.episodeItem.createMany({
        data: items.map((item, order) => ({
          episodeId: episode.id,
          order: order + 1,
          word: item.en,
          zh: item.zh,
          audioEnKey: audioKey(epNo, `${(order + 1).toString().padStart(2, "0")}_en.mp3`),
          audioZhKey: audioKey(epNo, `${(order + 1).toString().padStart(2, "0")}_zh.mp3`),
          backgroundKey: item.bg ? `bg/${epNo.toLowerCase()}/${basename(item.bg)}` : null,
        })),
      }),
      prisma.episodeWord.createMany({
        data: words.map((word, order) => ({
          episodeId: episode.id,
          order,
          word: word.en,
          zh: word.zh,
          audioKey: audioKey(epNo, `ext_w${order.toString().padStart(2, "0")}.mp3`),
        })),
      }),
    ]);
    console.log(`[${epNo}] upserted database content.`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = resolve(options.videoRoot);

  for (const ep of sourceEpisodes(root, options.ep)) {
    await importEpisode(options, ep);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
