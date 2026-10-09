import Link from "next/link";

type SiteHeaderProps = {
  active?: "home" | "chunk" | "words" | "pricing";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link className="brand" href="/" aria-label="苑说英语首页">
          <span className="brand-mark" aria-hidden="true">—</span>
          <span>
            <strong>苑说英语</strong>
            <small>CHUNK ENGLISH</small>
          </span>
        </Link>
        <nav className="nav" aria-label="主导航">
          <Link className={active === "home" ? "active" : undefined} href="/">首页</Link>
          <Link className={active === "chunk" ? "active" : undefined} href="/chunk">语块英语</Link>
          <Link className={active === "words" ? "active" : undefined} href="/words">词库</Link>
          <Link className={active === "pricing" ? "active" : undefined} href="/pricing">会员</Link>
        </nav>
        <Link className="button button-ghost" href="/login">登录 / 注册</Link>
      </div>
    </header>
  );
}
