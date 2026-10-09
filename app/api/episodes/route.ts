import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const episodes = await prisma.episode.findMany({
      where: { published: true },
      orderBy: [{ sort: "asc" }, { index: "asc" }],
      select: {
        epNo: true,
        slug: true,
        title: true,
        frameworkSay: true,
        duration: true,
        isFree: true,
      },
    });

    return NextResponse.json({ data: episodes });
  } catch {
    return NextResponse.json(
      { error: "Episode data is temporarily unavailable." },
      { status: 503 },
    );
  }
}
