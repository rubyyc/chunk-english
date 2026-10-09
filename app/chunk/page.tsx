import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPublishedEpisodes } from "@/lib/content";
import { publicMediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function ChunkPage() {
  let episodes: Awaited<ReturnType<typeof listPublishedEpisodes>> = [];
  let unavailable = false;

  try {
    episodes = await listPublishedEpisodes();
  } catch {
    unavailable = true;
  }

  return (
    <main>
      <SiteHeader active="chunk" />
      <section className="shell archive-hero">
        <p className="eyebrow">合集 · 语块英语</p>
        <h1>一个框架，一口气多会 20 句</h1>
        <p>每集围绕一个可直接开口的英语框架：3 个例句、20 个换词，按自己的节奏反复练。</p>
      </section>

      <section className="shell archive-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">已发布内容</p>
            <h2>全部单集</h2>
          </div>
          <p className="muted">{episodes.length} 集已上线</p>
        </div>
        {unavailable ? (
          <div className="empty-state">课程数据暂时不可读取，请稍后重试。</div>
        ) : episodes.length === 0 ? (
          <div className="empty-state">首集正在导入。内容导入完成后，会在这里按发布时间自动出现。</div>
        ) : (
          <div className="episode-grid archive-grid">
            {episodes.map((episode) => (
              <Link className="episode-card" key={episode.epNo} href={`/chunk/${episode.epNo.toLowerCase()}`}>
                <div className="episode-cover">
                  {episode.coverKey && publicMediaUrl(episode.coverKey) ? (
                    <img src={publicMediaUrl(episode.coverKey)!} alt={`${episode.title}封面`} />
                  ) : (
                    <span>NO.{episode.index.toString().padStart(3, "0")}</span>
                  )}
                </div>
                <span className={episode.isFree ? "badge badge-free" : "badge"}>{episode.isFree ? "免费" : "会员"}</span>
                <h3>{episode.title}</h3>
                <p className="framework">{episode.frameworkSay}</p>
                <p className="muted">{episode.duration ? `${episode.duration} 秒` : "课程已发布"}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
