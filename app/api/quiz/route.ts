import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

function normalize(value: string) { return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim(); }

export async function POST(request: Request) {
  const session = await readSession();
  const body = await request.json().catch(() => null) as { epNo?: string; order?: number; answer?: string } | null;
  if (!session) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  if (!body?.epNo || !body.order) return NextResponse.json({ error: "题目参数无效。" }, { status: 400 });

  const episode = await prisma.episode.findFirst({ where: { epNo: body.epNo.toUpperCase(), published: true }, include: { items: true } });
  const item = episode?.items.find((entry) => entry.order === body.order);
  if (!episode || !item) return NextResponse.json({ error: "题目不存在。" }, { status: 404 });

  const expected = (episode.frameworkSay ?? "").replace("___", item.word);
  const correct = normalize(body.answer ?? "") === normalize(expected);
  const data = await prisma.quizAnswer.create({ data: { userId: session.userId, episodeId: episode.id, itemOrder: item.order, answer: body.answer ?? "", correct } });
  return NextResponse.json({ data: { ...data, correct, expected } });
}
