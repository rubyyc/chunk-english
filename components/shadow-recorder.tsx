"use client";

import { useRef, useState } from "react";

type ShadowRecorderProps = { epNo: string; itemOrder: number };

export function ShadowRecorder({ epNo, itemOrder }: ShadowRecorderProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const [status, setStatus] = useState<"idle" | "recording" | "uploading">("idle");
  const [message, setMessage] = useState("");

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const durationMs = Math.max(1, Date.now() - startedAtRef.current);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 8 * 1024 * 1024) { setMessage("录音超过 8MB，请缩短后重试。"); setStatus("idle"); return; }
        setStatus("uploading");
        const created = await fetch("/api/shadows", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ epNo, itemOrder, durationMs }) });
        const payload = await created.json();
        if (!created.ok) { setMessage(payload.error ?? "无法保存录音。"); setStatus("idle"); return; }
        const upload = await fetch(payload.data.uploadUrl, { method: "PUT", headers: { "content-type": "audio/webm" }, body: blob });
        setMessage(upload.ok ? "录音已保存，可到“我的学习”回放。" : "上传失败，请重新录制。");
        setStatus("idle");
      };
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setStatus("recording");
      setMessage("正在录音，再点一次结束。");
    } catch { setMessage("无法访问麦克风。请在浏览器中允许录音权限后重试。"); }
  }

  return <button className="button button-ghost shadow-button" type="button" disabled={status === "uploading"} onClick={() => status === "recording" ? recorderRef.current?.stop() : start()}>{status === "recording" ? "结束跟读" : status === "uploading" ? "保存中…" : "跟读录音"}{message && <small>{message}</small>}</button>;
}
