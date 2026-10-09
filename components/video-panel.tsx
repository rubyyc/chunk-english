"use client";

import { useState } from "react";

type VideoPanelProps = {
  poster?: string | null;
  src?: string | null;
  title: string;
};

export function VideoPanel({ poster, src, title }: VideoPanelProps) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <div className="video-placeholder">
        {poster ? <img src={poster} alt={`${title}封面`} /> : <span>课程视频上传后会显示在这里</span>}
      </div>
    );
  }

  return open ? (
    <video className="lesson-video" controls autoPlay poster={poster ?? undefined} src={src} />
  ) : (
    <button className="video-placeholder video-poster" type="button" onClick={() => setOpen(true)}>
      {poster ? <img src={poster} alt={`${title}封面`} /> : <span>{title}</span>}
      <span className="video-play" aria-hidden="true">▷</span>
      <span className="sr-only">播放课程视频</span>
    </button>
  );
}
