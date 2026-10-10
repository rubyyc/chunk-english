import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";
export const dynamic="force-dynamic";
export default async function AdminOrdersPage(){const viewer=await getViewer();if(!viewer.isAdmin)redirect("/");const orders=await prisma.order.findMany({include:{user:{select:{email:true,nickname:true}},plan:{select:{name:true}}},orderBy:{createdAt:"desc"},take:200});return <main><SiteHeader/><section className="shell admin-page"><p className="eyebrow">后台 · 订单</p><h1>订单记录</h1><div className="admin-table">{orders.map(order=><div key={order.id}><span>{order.status}</span><b>{order.plan.name}</b><label>{order.user.nickname??order.user.email}</label><label>{order.payMethod}</label><label>{order.createdAt.toLocaleDateString("zh-CN")}</label></div>)}</div></section><SiteFooter/></main>}
