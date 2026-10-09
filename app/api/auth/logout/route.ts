import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/session";

export function POST() {
  const response = NextResponse.json({ data: { loggedOut: true } });
  response.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return response;
}
