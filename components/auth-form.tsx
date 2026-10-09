"use client";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json(); setPending(false);
    if (!response.ok) return setError(result.error ?? "操作失败，请稍后重试。");
    window.location.assign("/me");
  }
  return <form className="auth-form" onSubmit={submit}>
    {mode === "register" && <label>昵称<input name="nickname" maxLength={40} placeholder="怎么称呼你" /></label>}
    <label>邮箱<input name="email" type="email" required placeholder="you@example.com" /></label>
    <label>密码<input name="password" type="password" required minLength={10} placeholder="至少 10 位" /></label>
    {error && <p className="form-error">{error}</p>}
    <button className="button button-primary" disabled={pending} type="submit">{pending ? "处理中…" : mode === "login" ? "登录" : "创建账户"}</button>
  </form>;
}
