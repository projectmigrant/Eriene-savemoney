"use client";

import Link from "next/link";
import { useState } from "react";

export type AuthMode = "login" | "register";

const FIELDS: Record<AuthMode, { name: string; label: string; type: string; autoComplete: string; placeholder: string }[]> = {
  login: [
    { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
    { name: "password", label: "密碼", type: "password", autoComplete: "current-password", placeholder: "••••••" },
  ],
  register: [
    { name: "name", label: "名字", type: "text", autoComplete: "name", placeholder: "大家怎麼稱呼你" },
    { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
    { name: "password", label: "密碼", type: "password", autoComplete: "new-password", placeholder: "至少 6 個字元" },
    { name: "code", label: "驗證碼", type: "text", autoComplete: "off", placeholder: "請向管理員索取" },
  ],
};

// 登入 / 註冊共用表單（放在 landing page 的最下方）
export default function AuthForm({ mode }: { mode: AuthMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // 整頁重新載入首頁，清掉前一個帳號留下的畫面狀態
      window.location.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* 登入 / 註冊切換，scroll={false} 讓切換時停在原位 */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {(["register", "login"] as const).map((m) => (
          <Link
            key={m}
            href={m === "login" ? "/login" : "/register"}
            replace
            scroll={false}
            className={`rounded-2xl border-[1.5px] border-foreground py-3.5 text-center text-lg font-bold transition active:translate-y-0.5 ${
              mode === m
                ? "bg-foreground text-background shadow-[3px_3px_0_var(--accent)]"
                : "bg-surface shadow-[3px_3px_0_var(--foreground)]"
            }`}
          >
            {m === "login" ? "登入" : "註冊新帳號"}
          </Link>
        ))}
      </div>

      <div className="card-retro relative px-5 pt-6 pb-5">
        <span className="tape absolute -top-3 left-6 h-6 w-20 -rotate-6" />
        <p className="mb-4 font-bold">{isLogin ? "歡迎回來！錢錢等你很久了" : "填好資料就能加入囉"}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS[mode].map((f) => (
            <label key={f.name} className="block">
              <span className="text-sm text-muted">{f.label}</span>
              <input
                name={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                required
                minLength={f.name === "password" && !isLogin ? 6 : undefined}
                className="mt-0.5 block w-full border-b-[1.5px] border-dashed border-foreground/40 bg-transparent py-1.5 text-[16px] outline-none placeholder:text-muted/60 focus:border-solid focus:border-accent"
              />
            </label>
          ))}

          {error && <p className="text-sm font-bold text-accent">✗ {error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl border-[1.5px] border-foreground bg-accent py-3.5 text-lg font-bold text-accent-foreground shadow-[3px_3px_0_var(--foreground)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {loading ? "請稍候…" : isLogin ? "登入" : "完成註冊"}
          </button>
        </form>
      </div>
    </div>
  );
}
