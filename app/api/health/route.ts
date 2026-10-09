import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "chunk-english",
    timestamp: new Date().toISOString(),
  });
}
