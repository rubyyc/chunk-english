import { prisma } from "@/lib/prisma";

export const episodeListSelect = {
  epNo: true,
  index: true,
  slug: true,
  title: true,
  frameworkSay: true,
  duration: true,
  isFree: true,
  coverKey: true,
} as const;

export async function listPublishedEpisodes() {
  return prisma.episode.findMany({
    where: { published: true },
    orderBy: [{ sort: "asc" }, { index: "asc" }],
    select: episodeListSelect,
  });
}

export async function getPublishedEpisode(epNo: string) {
  return prisma.episode.findFirst({
    where: {
      epNo: epNo.toUpperCase(),
      published: true,
    },
    include: {
      collection: true,
      items: { orderBy: { order: "asc" } },
      words: { orderBy: { order: "asc" } },
    },
  });
}

export async function searchPublishedWords(query: string) {
  return prisma.episodeWord.findMany({
    where: {
      episode: { published: true },
      OR: query
        ? [
            { word: { contains: query, mode: "insensitive" } },
            { zh: { contains: query } },
          ]
        : undefined,
    },
    orderBy: [{ word: "asc" }, { episode: { index: "asc" } }],
    include: {
      episode: {
        select: { epNo: true, index: true, slug: true, isFree: true },
      },
    },
    take: 100,
  });
}
