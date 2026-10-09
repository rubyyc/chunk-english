import { redirect } from "next/navigation";
import { AdminEpisodes } from "@/components/admin-episodes";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/viewer";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function AdminEpisodesPage(){const viewer=await getViewer();if(!viewer.isAdmin)redirect("/");const episodes=await prisma.episode.findMany({orderBy:[{sort:"asc"},{index:"asc"}],select:{id:true,epNo:true,index:true,title:true,published:true,isFree:true}});return <main><SiteHeader/><section className="shell admin-page"><p className="eyebrow">后台 · 内容</p><h1>课程管理</h1><p>导入新课程后，在这里控制是否上架以及免费边界。</p><AdminEpisodes initial={episodes}/></section><SiteFooter/></main>}
