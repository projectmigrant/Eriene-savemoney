"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseItem } from "@/lib/types";

// 底部固定的輸入列，像聊天 App 一樣用一句話記帳
export default function Composer({ onAdded }: { onAdded: (items: ExpenseItem[]) => void }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 文字變多時自動長高（最多約 6 行，超過再捲動），送出清空後縮回一行
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  // Enter 送出、Shift+Enter 換行；注音／拼音選字中按的 Enter 不算
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

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
        <form onSubmit={handleSubmit} className="card-retro flex items-end gap-2 !rounded-[1.5rem] p-1.5 pl-5">
          <span className="pb-2 text-lg text-muted">✎</span>
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "AI 正在幫你記…" : "午餐 120，公車 15…"}
            disabled={loading}
            enterKeyHint="send"
            className="min-w-0 flex-1 resize-none bg-transparent py-2 text-[16px] leading-6 outline-none placeholder:text-muted/80 disabled:opacity-60"
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
