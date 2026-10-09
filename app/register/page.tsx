import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default function RegisterPage(){return <main><SiteHeader/><section className="shell auth-page"><p className="eyebrow">开始学习</p><h1>创建你的练习场</h1><p>注册后可保存学习记录，并通过兑换码开通会员。</p><AuthForm mode="register"/><p>已有账户？ <Link href="/login">直接登录</Link></p></section><SiteFooter/></main>}
