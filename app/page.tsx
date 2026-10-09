import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPublishedEpisodes } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let episodes: Awaited<ReturnType<typeof listPublishedEpisodes>> = [];

  try {
    episodes = await listPublishedEpisodes();
  } catch {
    episodes = [];
  }

  const latestEpisode = episodes[0];
  const framework = latestEpisode?.frameworkSay ?? "一个句式，二十种开口方式";

  return (
    <main>
      <SiteHeader active="home" />

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">语块英语 · CHUNK ENGLISH</p>
          <h1>每天 2 分钟，把英语从<span>学过</span>变成<span>说得出</span></h1>
          <p className="hero-summary">每集只讲一个万能句式。框架记住，槽位随便换。</p>
          <div className="actions">
            <Link className="button button-primary" href={latestEpisode ? `/chunk/${latestEpisode.epNo.toLowerCase()}` : "/chunk"}>
              {latestEpisode ? `开始学第 ${latestEpisode.index.toString().padStart(3, "0")} 期` : "查看课程导入状态"}
            </Link>
            <Link className="button button-ghost" href="/chunk">浏览全部单集</Link>
          </div>
          <ul className="trust-list">
            <li>前 5 集完全免费</li>
            <li>视频同款内容</li>
            <li>无需下载 App</li>
          </ul>
        </div>

        <div className="practice-card" aria-label="语块英语学习方式">
          <p className="card-label">万能句式 · 试一试</p>
          <p className="sentence">{framework}</p>
          <p className="translation">{latestEpisode ? "导入后可在课程页听框架、练例句、查换词。" : "首集内容导入后，课程页会提供完整的听说练习。"}</p>
          <p className="muted">这就是语块：记住一个框架，换掉槽位就是新句子。</p>
          <div className="word-pills">
            <span>听框架</span><span>跟例句</span><span>查换词</span><span>反复开口</span>
          </div>
          <Link className="text-link" href={latestEpisode ? `/chunk/${latestEpisode.epNo.toLowerCase()}` : "/chunk"}>
            {latestEpisode ? "进课程完整学" : "查看课程状态"} <span aria-hidden="true">→</span>
          </Link>
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
        {episodes.length === 0 ? (
          <div className="empty-state">还没有已发布课程。运行内容导入命令后，最新课程会自动出现在这里。</div>
        ) : (
          <div className="episode-grid">
            {episodes.slice(0, 2).map((episode) => (
              <Link className="episode-card" key={episode.epNo} href={`/chunk/${episode.epNo.toLowerCase()}`}>
                <div className="episode-number">NO.{episode.index.toString().padStart(3, "0")}</div>
                <span className={episode.isFree ? "badge badge-free" : "badge"}>{episode.isFree ? "免费" : "会员"}</span>
                <h3>{episode.title}</h3>
                <p className="framework">{episode.frameworkSay}</p>
                <p className="muted">{episode.duration ? `${episode.duration} 秒` : "已发布"}</p>
                <span className="text-link">查看内容 →</span>
              </Link>
            ))}
          </div>
        )}
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
      <SiteFooter />
    </main>
  );
}
