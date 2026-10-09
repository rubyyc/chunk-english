import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "苑说英语 | 把英语从学过变成说得出",
  description: "与短视频内容 1:1 对齐的英语学习站。每集一个万能句式，练到能开口。",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
