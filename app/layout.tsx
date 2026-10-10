import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} | 把英语从学过变成说得出`, template: `%s | ${siteName}` },
  description: "与短视频内容 1:1 对齐的英语学习站。每集一个万能句式，练到能开口。",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "zh_CN", siteName, url: siteUrl, title: `${siteName} | 把英语从学过变成说得出`, description: "与短视频内容 1:1 对齐的英语学习站。" },
  twitter: { card: "summary" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl, inLanguage: "zh-CN", description: "与短视频内容同步的英语口语学习网站。" };
  return <html lang="zh-CN"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}/>{children}</body></html>;
}
