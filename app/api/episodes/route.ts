import { NextResponse } from "next/server";
import { listPublishedEpisodes } from "@/lib/content";

export async function GET() {
  try {
    const episodes = await listPublishedEpisodes();

    return NextResponse.json({ data: episodes });
  } catch {
    return NextResponse.json(
      { error: "Episode data is temporarily unavailable." },
      { status: 503 },
    );
  }
}
