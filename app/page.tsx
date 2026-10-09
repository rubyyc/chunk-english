import Link from "next/link";

const recentEpisodes = [
  {
    epNo: "CK001",
    title: "问路，这一句就够",
    framework: "How do I get to the ___?",
    detail: "换掉地点，句子照样能用。出国问路、打车报地点，这一句全覆盖。",
    status: "免费",
  },
  {
    epNo: "CK002",
    title: "点杯咖啡，这一句就够",
    framework: "Can I get a ___, please?",
    detail: "正在准备内容导入，会员学习流程会与视频同步开放。",
    status: "筹备中",
  },
];

export default function HomePage() {
  return (
    <main>
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
            <Link className="active" href="/">首页</Link>
            <Link href="/chunk">语块英语</Link>
            <Link href="/words">词库</Link>
            <Link href="/pricing">会员</Link>
          </nav>
          <Link className="button button-ghost" href="/login">登录 / 注册</Link>
        </div>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">语块英语 · CHUNK ENGLISH</p>
          <h1>每天 2 分钟，把英语从<span>学过</span>变成<span>说得出</span></h1>
          <p className="hero-summary">每集只讲一个万能句式。框架记住，槽位随便换。</p>
          <div className="actions">
            <Link className="button button-primary" href="/chunk/ck001">开始学第 001 期</Link>
            <Link className="button button-ghost" href="/chunk">浏览全部单集</Link>
          </div>
          <ul className="trust-list">
            <li>前 5 集完全免费</li>
            <li>视频同款内容</li>
            <li>无需下载 App</li>
          </ul>
        </div>

        <div className="practice-card" aria-label="万能句式示例">
          <p className="card-label">万能句式 · 试一试</p>
          <p className="sentence">How do I get to the <em>___</em>?</p>
          <p className="translation">我怎么去<span>某个地点</span>？</p>
          <p className="muted">这就是语块：记住一个框架，换掉槽位就是新句子。</p>
          <div className="word-pills">
            <span>subway</span><span>gym</span><span>airport</span><span>downtown</span>
          </div>
          <Link className="text-link" href="/chunk/ck001">进这集完整学 <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="shell stats" aria-label="学习结构">
        <div><b>1</b><span>个万能句式框架</span></div>
        <div><b>3</b><span>句例句跟读</span></div>
        <div><b className="accent">20</b><span>个可替换换词</span></div>
        <div><b>60</b><span>秒单集时长</span></div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <div>
            <p className="eyebrow">从视频到练习场</p>
            <h2>最近更新</h2>
          </div>
          <Link className="text-link" href="/chunk">全部单集 →</Link>
        </div>
        <div className="episode-grid">
          {recentEpisodes.map((episode) => (
            <article className="episode-card" key={episode.epNo}>
              <div className="episode-number">NO.{episode.epNo.slice(-3)}</div>
              <span className={episode.status === "免费" ? "badge badge-free" : "badge"}>{episode.status}</span>
              <h3>{episode.title}</h3>
              <p className="framework">{episode.framework}</p>
              <p className="muted">{episode.detail}</p>
              <Link className="text-link" href={episode.epNo === "CK001" ? "/chunk/ck001" : "/chunk"}>查看内容 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section learn-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">固定流程，不靠死记</p>
            <h2>一个语块，三步练熟</h2>
          </div>
        </div>
        <div className="steps">
          <article><b>01</b><h3>听框架</h3><p>先把一句话当成一个整体，听清节奏与语调。</p></article>
          <article><b>02</b><h3>跟例句</h3><p>三个真实场景反复说，把框架练成下意识反应。</p></article>
          <article><b>03</b><h3>换词表</h3><p>二十个可替换词，一个句型马上变成二十句话。</p></article>
        </div>
      </section>

      <section className="shell member-callout">
        <div>
          <p className="eyebrow">会员学习库</p>
          <h2>解锁全部单集与 20 词发音库</h2>
          <p>会员可下载整集音频包，跟读不限次，离线也能练。</p>
        </div>
        <Link className="button button-primary" href="/pricing">了解会员</Link>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <div><strong>苑说英语</strong><p>每天 2 分钟，把英语从学过变成说得出。</p></div>
          <p>© 2026 苑说英语</p>
        </div>
      </footer>
    </main>
  );
}
