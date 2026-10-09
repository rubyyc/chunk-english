import { NextResponse } from "next/server";
import { searchPublishedWords } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 80);

  try {
    const words = await searchPublishedWords(query);
    return NextResponse.json({ data: words });
  } catch {
    return NextResponse.json(
      { error: "Word data is temporarily unavailable." },
      { status: 503 },
    );
  }
}
