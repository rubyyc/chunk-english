import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";
export const dynamic="force-dynamic";
export default async function AdminPage(){const viewer=await getViewer();if(!viewer.isAdmin)redirect("/");const now=new Date();const [users,members,published,orders]=await Promise.all([prisma.user.count(),prisma.membership.count({where:{status:"ACTIVE",OR:[{expiresAt:null},{expiresAt:{gt:now}}]}}),prisma.episode.count({where:{published:true}}),prisma.order.count({where:{status:"PAID"}})]);return <main><SiteHeader/><section className="shell admin-page"><p className="eyebrow">后台 · 概览</p><h1>运营看板</h1><div className="learning-stats"><div><b>{users}</b><span>注册用户</span></div><div><b>{members}</b><span>有效会员</span></div><div><b>{published}</b><span>已上架课程</span></div><div><b>{orders}</b><span>已支付订单</span></div></div><div className="admin-links"><Link href="/admin/episodes">课程管理</Link><Link href="/admin/codes">兑换码</Link><Link href="/admin/users">用户列表</Link><Link href="/admin/orders">订单记录</Link></div></section><SiteFooter/></main>}
