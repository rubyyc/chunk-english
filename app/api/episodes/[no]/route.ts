import { NextResponse } from "next/server";
import { getPublishedEpisode } from "@/lib/content";

export async function GET(_: Request, { params }: { params: Promise<{ no: string }> }) {
  try {
    const { no } = await params;
    const episode = await getPublishedEpisode(no);

    if (!episode) {
      return NextResponse.json({ error: "Episode not found." }, { status: 404 });
    }

    return NextResponse.json({ data: episode });
  } catch {
    return NextResponse.json(
      { error: "Episode data is temporarily unavailable." },
      { status: 503 },
    );
  }
}
