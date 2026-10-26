"use client";

import { useState } from "react";
import type { SessionUser } from "@/lib/auth";

// 右上角：直接看得到的登出按鈕 + 頭像（點開顯示帳號資訊）
export default function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // 換帳號時要整頁重新載入：Next.js 會保留離開前的頁面狀態，
    // 用 router 導頁的話，下次登入會看到舊畫面（例如卡在「登出中…」）
    window.location.replace("/login");
  }

  return (
    <div className="relative flex shrink-0 items-center gap-2">
      <button
        onClick={logout}
        disabled={loggingOut}
        className="rounded-full border-[1.5px] border-foreground bg-surface px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0_var(--foreground)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-50"
      >
        {loggingOut ? "登出中…" : "登出"}
      </button>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="帳號選單"
        className="grid size-11 place-items-center rounded-full border-[1.5px] border-foreground bg-mustard text-lg font-bold shadow-[2px_2px_0_var(--foreground)] transition active:translate-y-0.5 active:shadow-none"
      >
        {user.name[0]}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="card-retro absolute top-full right-0 z-40 mt-3 w-56 overflow-hidden">
            <div className="border-b-[1.5px] border-dashed border-line px-4 py-3">
              <p className="font-bold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
              {user.role === "admin" && (
                <span className="mt-1.5 inline-block rounded border border-accent px-1.5 text-[10px] text-accent">管理員</span>
              )}
            </div>
            <button onClick={logout} className="w-full px-4 py-3 text-left font-bold text-accent active:bg-line">
              登出
            </button>
          </div>
        </>
      )}
    </div>
  );
}
