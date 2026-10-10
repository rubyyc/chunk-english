import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const viewer = await getViewer();
  if (!viewer.isAdmin) redirect("/");
  const users = await prisma.user.findMany({ select: { id: true, email: true, nickname: true, role: true, status: true }, orderBy: { createdAt: "desc" }, take: 100 });
  const memberships = await prisma.membership.findMany({ where: { userId: { in: users.map((user) => user.id) }, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: { plan: { select: { name: true } } }, orderBy: { startedAt: "desc" } });
  const planByUser = new Map<string, string>();
  memberships.forEach((membership) => { if (!planByUser.has(membership.userId)) planByUser.set(membership.userId, membership.plan.name); });
  return <main><SiteHeader/><section className="shell admin-page"><p className="eyebrow">后台 · 用户</p><h1>用户与会员</h1><div className="admin-table">{users.map((user) => <div key={user.id}><span>{user.role}</span><b>{user.nickname ?? user.email}</b><label>{user.email}</label><label>{planByUser.get(user.id) ?? "免费用户"}</label><label>{user.status}</label></div>)}</div></section><SiteFooter/></main>;
}
