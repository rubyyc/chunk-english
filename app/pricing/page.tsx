import { RedeemForm } from "@/components/redeem-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default function PricingPage(){return <main><SiteHeader active="pricing"/><section className="shell archive-hero"><p className="eyebrow">会员</p><h1>把每一集练到能开口</h1><p>免费开放核心体验；会员解锁全量换词发音、下载与无限跟读。</p></section><section className="shell archive-section pricing-grid"><article><h2>免费</h2><p>前 5 集课程与核心练习</p></article><article className="featured"><h2>会员</h2><p>全部课程、20 词发音库、音频下载与无限跟读</p></article></section><section className="shell redeem-section"><p className="eyebrow">已有兑换码</p><h2>立即开通</h2><RedeemForm/></section><SiteFooter/></main>}
