import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";
export const dynamic="force-dynamic";
export default async function MePage(){const session=await readSession();if(!session)redirect("/login");const user=await prisma.user.findUnique({where:{id:session.userId},select:{nickname:true,email:true,memberships:{where:{status:"ACTIVE",OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},include:{plan:{select:{name:true,code:true}}},take:1}}});if(!user)redirect("/login");const membership=user.memberships[0];return <main><SiteHeader/><section className="shell auth-page"><p className="eyebrow">我的学习</p><h1>{user.nickname??user.email}</h1><p>{membership?`当前会员：${membership.plan.name}${membership.expiresAt?`，到期日 ${membership.expiresAt.toLocaleDateString("zh-CN")}`:""}`:"当前为免费用户，可先完成前 5 集练习。"}</p><div className="member-actions"><Link className="button button-primary" href="/chunk">继续学习</Link><Link className="button button-ghost" href="/pricing">兑换或查看会员</Link></div></section><SiteFooter/></main>}
