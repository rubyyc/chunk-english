import { redirect } from "next/navigation";
import { AdminCodeGenerator } from "@/components/admin-code-generator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/viewer";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function AdminCodesPage(){const viewer=await getViewer();if(!viewer.isAdmin)redirect("/");const plans=await prisma.plan.findMany({where:{active:true},select:{code:true,name:true},orderBy:{sort:"asc"}});return <main><SiteHeader/><section className="shell admin-page"><p className="eyebrow">后台 · 变现</p><h1>兑换码</h1><p>生成后复制发送给用户；用户登录后可在会员页自行兑换。</p><AdminCodeGenerator plans={plans}/></section><SiteFooter/></main>}
