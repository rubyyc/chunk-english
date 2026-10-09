export type MediaKind =
  | "hook"
  | "teach"
  | "itemEn"
  | "itemZh"
  | "extend"
  | "outro"
  | "word"
  | "cover"
  | "video"
  | "shadow";

function episodeSlug(epNo: string): string {
  return epNo.toLowerCase();
}

function twoDigits(value: number): string {
  return value.toString().padStart(2, "0");
}

export function mediaKey(
  epNo: string,
  kind: MediaKind,
  options: { order?: number; channel?: "douyin" | "bili"; userId?: string; timestamp?: number } = {},
): string {
  const slug = episodeSlug(epNo);

  switch (kind) {
    case "hook":
      return `audio/${slug}/00_hook.mp3`;
    case "teach":
      return `audio/${slug}/00_teach.mp3`;
    case "itemEn":
      return `audio/${slug}/${twoDigits(options.order ?? 1)}_en.mp3`;
    case "itemZh":
      return `audio/${slug}/${twoDigits(options.order ?? 1)}_zh.mp3`;
    case "extend":
      return `audio/${slug}/98_extend.mp3`;
    case "outro":
      return `audio/${slug}/99_outro.mp3`;
    case "word":
      return `audio/${slug}/ext_w${twoDigits(options.order ?? 0)}.mp3`;
    case "cover":
      return `cover/${slug}/vertical.png`;
    case "video":
      return `video/${slug}/${options.channel ?? "douyin"}.mp4`;
    case "shadow":
      if (!options.userId) {
        throw new Error("A user ID is required for shadow media.");
      }
      return `shadow/${options.userId}/${slug}/${options.order ?? 0}-${options.timestamp ?? Date.now()}.webm`;
  }
}

export function publicMediaUrl(key: string): string | null {
  const base = process.env.S3_PUBLIC_BASE?.replace(/\/$/, "");
  return base ? `${base}/${key}` : null;
}
