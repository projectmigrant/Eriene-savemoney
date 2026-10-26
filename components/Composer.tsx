"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseItem } from "@/lib/types";

// 底部固定的輸入列，像聊天 App 一樣用一句話記帳
export default function Composer({ onAdded }: { onAdded: (items: ExpenseItem[]) => void }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAdded(data.expenses);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-10">
      <div className="mx-auto max-w-md bg-gradient-to-t from-background via-background to-transparent px-4 pt-6 pb-[max(env(safe-area-inset-bottom),1rem)]">
        {error && <p className="mb-2 px-3 text-sm text-accent">✗ {error}</p>}
        <form onSubmit={handleSubmit} className="card-retro flex items-center gap-2 !rounded-full p-1.5 pl-5">
          <span className="text-lg text-muted">✎</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={loading ? "AI 正在幫你記…" : "午餐 120，公車 15…"}
            disabled={loading}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted/80 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="h-10 shrink-0 rounded-full border-[1.5px] border-foreground bg-accent px-4 font-bold text-accent-foreground transition active:scale-95 disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent align-middle" />
            ) : (
              "記上"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
