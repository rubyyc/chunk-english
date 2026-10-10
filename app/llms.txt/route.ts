import { listPublishedEpisodes } from "@/lib/content";
import { siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  let episodes: Awaited<ReturnType<typeof listPublishedEpisodes>> = [];
  try { episodes = await listPublishedEpisodes(); } catch { episodes = []; }

  const body = [
    `# ${siteName}`,
    "",
    "苑说英语是与短视频内容同步的英语口语学习网站。每集围绕一个可替换的英语句式，提供框架、例句、换词表、出题与跟读练习。",
    "",
    "## Public pages",
    `- Home: ${siteUrl}/`,
    `- Course archive: ${siteUrl}/chunk`,
    `- Word library: ${siteUrl}/words`,
    `- Membership: ${siteUrl}/pricing`,
    "",
    "## Published lessons",
    ...episodes.map((episode) => `- ${episode.epNo}: ${episode.title} - ${siteUrl}/chunk/${episode.epNo.toLowerCase()}`),
    "",
    "## Content and access",
    "Only published lessons are public. Member-only audio and personal learning data are not public content. Course data originates from the associated video production project.",
  ].join("\n");

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
