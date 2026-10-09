import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await readSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      nickname: true, email: true,
      memberships: { where: { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: { plan: { select: { name: true } } }, take: 1 },
      progress: { include: { episode: { select: { epNo: true, title: true, index: true } } }, orderBy: { updatedAt: "desc" }, take: 5 },
      favorites: { select: { episodeId: true } },
      wordbook: { select: { id: true } },
    },
  });
  if (!user) redirect("/login");
  const membership = user.memberships[0];
  const completed = user.progress.filter((entry) => entry.status === "DONE").length;

  return <main><SiteHeader/><section className="shell dashboard-page"><p className="eyebrow">我的学习</p><h1>{user.nickname ?? user.email}</h1><p>{membership ? `当前会员：${membership.plan.name}${membership.expiresAt ? `，到期日 ${membership.expiresAt.toLocaleDateString("zh-CN")}` : ""}` : "当前为免费用户，可先完成前 5 集练习。"}</p><div className="learning-stats"><div><b>{completed}</b><span>已学课程</span></div><div><b>{user.favorites.length}</b><span>已收藏</span></div><div><b>{user.wordbook.length}</b><span>生词本</span></div></div><div className="dashboard-list"><h2>继续学习</h2>{user.progress.length ? user.progress.map(({ episode, status }) => <Link key={episode.epNo} href={`/chunk/${episode.epNo.toLowerCase()}`}><span>NO.{episode.index.toString().padStart(3,"0")}</span><b>{episode.title}</b><em>{status === "DONE" ? "已完成" : "学习中"}</em></Link>) : <p className="muted">从第一节课开始，学习记录会自动保存在这里。</p>}</div><div className="member-actions"><Link className="button button-primary" href="/chunk">继续学习</Link><Link className="button button-ghost" href="/pricing">兑换或查看会员</Link></div></section><SiteFooter/></main>;
}
