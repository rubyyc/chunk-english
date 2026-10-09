import { notFound } from "next/navigation";
import { AudioButton } from "@/components/audio-button";
import { QuizCard } from "@/components/quiz-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VideoPanel } from "@/components/video-panel";
import { getPublishedEpisode } from "@/lib/content";
import { canAccess } from "@/lib/permission";
import { mediaKey, publicMediaUrl } from "@/lib/media";
import { getViewer } from "@/lib/viewer";

type EpisodePageProps = {
  params: Promise<{ no: string }>;
};

export const dynamic = "force-dynamic";

function sentence(framework: string | null, word: string) {
  return framework?.replace("___", word) ?? word;
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { no } = await params;
  const episode = await getPublishedEpisode(no).catch(() => null);

  if (!episode) {
    notFound();
  }

  const viewer = await getViewer();
  const canPlayEpisode = canAccess(viewer, episode, "play");
  const canPlayWordAudio = viewer.isAdmin || viewer.isMember;
  const hookAudio = canPlayEpisode ? publicMediaUrl(mediaKey(episode.epNo, "hook")) : null;
  const teachAudio = canPlayEpisode ? publicMediaUrl(mediaKey(episode.epNo, "teach")) : null;
  const extendAudio = canPlayWordAudio ? publicMediaUrl(mediaKey(episode.epNo, "extend")) : null;
  const video = episode.videoKeyDouyin ? publicMediaUrl(episode.videoKeyDouyin) : null;
  const cover = episode.coverKey ? publicMediaUrl(episode.coverKey) : null;

  return (
    <main>
      <SiteHeader active="chunk" />
      <section className="shell lesson-head">
        <p className="eyebrow">{episode.collection.name} · NO.{episode.index.toString().padStart(3, "0")}</p>
        <h1>{episode.title}</h1>
        <p>{episode.coverSub ?? episode.hook ?? "换掉槽位，句子照样能用。"}</p>
        <div className="lesson-meta"><span className={episode.isFree ? "badge badge-free" : "badge"}>{episode.isFree ? "免费单集" : "会员单集"}</span><span>{episode.items.length} 个例句</span><span>{episode.words.length} 个换词</span>{episode.duration && <span>{episode.duration} 秒</span>}</div>
      </section>

      <section className="shell lesson-section media-section">
        <VideoPanel poster={cover} src={video} title={episode.title} />
        <div>
          <p className="eyebrow">跟着视频，在网页上练完这一集</p>
          <h2>视频是钩子，这里是练习场</h2>
          <p className="muted">视频里一闪而过的换词，可以在下面逐个听、逐句说、自己检查。</p>
          <AudioButton src={hookAudio} label="听本集钩子" />
        </div>
      </section>

      <section className="shell lesson-section">
        <div className="framework-panel">
          <p className="eyebrow">万能句式</p>
          <h2>{episode.frameworkSay ?? episode.title}</h2>
          <p>{episode.frameworkZh ?? "记住框架，换掉槽位就是新句子。"}</p>
          <p className="muted">{episode.frameworkNote}</p>
          <AudioButton src={teachAudio} label="听框架朗读" />
        </div>
      </section>

      <section className="shell lesson-section">
        <div className="section-head"><div><p className="eyebrow">三个场景</p><h2>本集替换</h2></div></div>
        <div className="item-grid">
          {episode.items.map((item) => (
            <article className="lesson-item" key={item.id}>
              <span>例句 {item.order}</span>
              <h3>{sentence(episode.frameworkSay, item.word)}</h3>
              <p>{item.zh}</p>
              <div className="audio-actions">
                <AudioButton src={item.audioEnKey ? publicMediaUrl(item.audioEnKey) : null} label="英文" />
                <AudioButton src={item.audioZhKey ? publicMediaUrl(item.audioZhKey) : null} label="中文" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell lesson-section">
        <div className="section-head"><div><p className="eyebrow">先自己说一遍</p><h2>出题检测</h2></div><p className="muted">{episode.quizHint ?? "输入完整英文句子，马上检查。"}</p></div>
        <div className="quiz-list">
          {episode.items.map((item) => (
            <QuizCard key={item.id} number={item.order} prompt={item.zh} answer={sentence(episode.frameworkSay, item.word)} />
          ))}
        </div>
      </section>

      {episode.outro && <section className="shell lesson-section"><div className="outro-panel">{episode.outro}</div></section>}

      <section className="shell lesson-section">
        <div className="section-head"><div><p className="eyebrow">20 个可替换词</p><h2>换词表</h2></div><AudioButton src={extendAudio} label="听换词表引导" /></div>
        <p className="muted word-guide">这些词都可以直接替换句式中的槽位。逐个听发音，再回到句式里开口。</p>
        <div className="word-grid">
          {episode.words.map((word) => (
            <article key={word.id}>
              <div><strong>{word.word}</strong><span>{word.zh}</span></div>
              <AudioButton src={canPlayWordAudio && word.audioKey ? publicMediaUrl(word.audioKey) : null} label={canPlayWordAudio ? "发音" : "会员专享"} />
            </article>
          ))}
        </div>
        {!canPlayWordAudio && <p className="member-lock">换词表发音为会员权益。登录并兑换会员后即可逐词播放。</p>}
      </section>
      <SiteFooter />
    </main>
  );
}
