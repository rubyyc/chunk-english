import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default function LoginPage(){return <main><SiteHeader/><section className="shell auth-page"><p className="eyebrow">账户</p><h1>回来继续练</h1><p>登录后保存学习进度、收藏和会员权益。</p><AuthForm mode="login"/><p>还没有账户？ <Link href="/register">创建账户</Link></p></section><SiteFooter/></main>}
