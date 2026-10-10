import type { MetadataRoute } from "next";
import { listPublishedEpisodes } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["", "/chunk", "/words", "/pricing"].map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }));
  try {
    const episodes = await listPublishedEpisodes();
    return [...pages, ...episodes.map((episode) => ({ url: `${siteUrl}/chunk/${episode.epNo.toLowerCase()}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 }))];
  } catch { return pages; }
}
