"use client";

import { useRef, useState } from "react";

type AudioButtonProps = {
  src?: string | null;
  label: string;
  className?: string;
};

export function AudioButton({ src, label, className }: AudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function playAudio() {
    if (!src) {
      return;
    }

    if (!audioRef.current || audioRef.current.src !== src) {
      audioRef.current = new Audio(src);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    await audioRef.current.play();
    setIsPlaying(true);
  }

  return (
    <button className={className ?? "audio-button"} type="button" onClick={playAudio} disabled={!src}>
      <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▷"}</span>
      {label}
    </button>
  );
}
