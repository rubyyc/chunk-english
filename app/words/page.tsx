import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { publicMediaUrl } from "@/lib/media";
import { searchPublishedWords } from "@/lib/content";

type WordsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";

export default async function WordsPage({ searchParams }: WordsPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 80);
  let words: Awaited<ReturnType<typeof searchPublishedWords>> = [];
  let unavailable = false;

  try {
    words = await searchPublishedWords(query);
  } catch {
    unavailable = true;
  }

  return (
    <main>
      <SiteHeader active="words" />
      <section className="shell archive-hero">
        <p className="eyebrow">词库 · WORDS</p>
        <h1>全站可替换词，一站检索</h1>
        <p>每个词都来自一集真实课程。找到词后，回到原集把它放进句式里练。</p>
      </section>

      <section className="shell archive-section">
        <form className="word-search" action="/words">
          <label htmlFor="q">搜索英文或中文</label>
          <div>
            <input id="q" name="q" defaultValue={query} placeholder="如 subway / 机场" maxLength={80} />
            <button className="button button-primary" type="submit">搜索</button>
          </div>
        </form>

        {unavailable ? (
          <div className="empty-state">词库数据暂时不可读取，请稍后重试。</div>
        ) : words.length === 0 ? (
          <div className="empty-state">{query ? `没有找到“${query}”相关词汇。` : "词库会随已发布课程自动累积。"}</div>
        ) : (
          <div className="word-results">
            <p className="muted">找到 {words.length} 个结果</p>
            <div className="word-table">
              {words.map((word) => (
                <article className="word-row" key={word.id}>
                  <div><strong>{word.word}</strong><span>{word.zh}</span></div>
                  <Link href={`/chunk/${word.episode.epNo.toLowerCase()}`}>出自 {word.episode.epNo}</Link>
                  {word.audioKey && publicMediaUrl(word.audioKey) ? (
                    <audio controls preload="none" src={publicMediaUrl(word.audioKey)!} aria-label={`${word.word} 发音`} />
                  ) : <span className="muted">发音待同步</span>}
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
