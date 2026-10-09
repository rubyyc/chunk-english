import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="shell empty-page">
        <p className="eyebrow">404</p>
        <h1>这节课还没有上线</h1>
        <p>请回到合集查看已经发布的内容。</p>
        <Link className="button button-primary" href="/chunk">返回语块英语</Link>
      </section>
      <SiteFooter />
    </main>
  );
}
