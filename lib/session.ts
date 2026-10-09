import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "chunk_session";
const issuer = "chunk-english";
const audience = "chunk-english-web";

type SessionPayload = { userId: string; role: "USER" | "ADMIN" };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.startsWith("CHANGE_ME")) {
    throw new Error("AUTH_SECRET must be configured with a secure random value.");
  }
  return new TextEncoder().encode(value);
}

export async function createSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer, audience });
    if (!payload.sub || (payload.role !== "USER" && payload.role !== "ADMIN")) return null;
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: cookieName,
  options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 },
};
