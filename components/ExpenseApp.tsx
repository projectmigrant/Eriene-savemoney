"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseItem } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { formatMoney, formatMonth, monthOf, shiftMonth } from "@/lib/date";
import DateStrip from "@/components/DateStrip";
import DayList from "@/components/DayList";
import StatsView from "@/components/StatsView";
import Composer from "@/components/Composer";
import UserMenu from "@/components/UserMenu";
import { APP_NAME } from "@/lib/brand";

type Tab = "detail" | "stats";

export default function ExpenseApp({ today, user }: { today: string; user: SessionUser }) {
  const router = useRouter();
  const [month, setMonth] = useState(monthOf(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [tab, setTab] = useState<Tab>("detail");
  const [data, setData] = useState<{ month: string; expenses: ExpenseItem[] } | null>(null);
  const [toast, setToast] = useState("");

  const loading = data?.month !== month;
  const expenses = useMemo(() => (loading ? [] : (data?.expenses ?? [])), [loading, data]);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/expenses?month=${month}`)
      .then((res) => {
        // cookie 過期 → 回登入頁
        if (res.status === 401) router.replace("/login");
        return res.json();
      })
      .then((json) => {
        if (!ignore) setData({ month, expenses: json.expenses ?? [] });
      })
      .catch(() => {
        if (!ignore) setData({ month, expenses: [] });
      });
    return () => {
      ignore = true;
    };
  }, [month, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const monthTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) map[e.date] = (map[e.date] ?? 0) + e.amount;
    return map;
  }, [expenses]);

  function goToMonth(next: string) {
    setMonth(next);
    setSelectedDate(next === monthOf(today) ? today : `${next}-01`);
  }

  function handleAdded(added: ExpenseItem[]) {
    const first = added[0];
    setToast(`記好了！共 ${added.length} 筆`);
    setSelectedDate(first.date);
    if (monthOf(first.date) !== month) {
      // 新紀錄在別的月份 → 切過去，useEffect 會重新抓資料
      setMonth(monthOf(first.date));
    } else {
      setData((prev) =>
        prev
          ? { ...prev, expenses: [...added.filter((e) => monthOf(e.date) === month), ...prev.expenses] }
          : prev,
      );
    }
  }

  return (
    <div className="notebook mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="pr-5 pl-8 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="card-retro grid size-11 shrink-0 -rotate-6 place-items-center rounded-xl !bg-accent text-xl font-bold text-accent-foreground">
              錢
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg leading-tight font-bold">{APP_NAME}</p>
              <p className="truncate text-xs text-muted">嗨，{user.name}！今天也要記帳喔</p>
            </div>
          </div>
          <UserMenu user={user} />
        </div>

        {/* 本月開銷卡片，上面貼一段紙膠帶 */}
        <div className="card-retro relative px-4 pt-5 pb-4">
          <span className="tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3" />
          <div className="flex items-center justify-between">
            <button
              onClick={() => goToMonth(shiftMonth(month, -1))}
              aria-label="上個月"
              className="grid size-9 place-items-center rounded-full transition active:scale-90 active:bg-line"
            >
              <Chevron dir="left" />
            </button>
            <span className="text-base font-bold">{formatMonth(month)}</span>
            <button
              onClick={() => goToMonth(shiftMonth(month, 1))}
              aria-label="下個月"
              className="grid size-9 place-items-center rounded-full transition active:scale-90 active:bg-line"
            >
              <Chevron dir="right" />
            </button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs tracking-[0.4em] text-muted">本月開銷</p>
            <p className="mt-1 inline-block border-b-4 border-double border-accent px-3 pb-0.5 text-4xl font-bold tabular-nums">
              <span className="mr-1 text-lg">$</span>
              {loading ? "…" : formatMoney(monthTotal)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {(["detail", "stats"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl border-[1.5px] border-foreground py-2 text-[15px] font-bold transition active:translate-y-0.5 ${
                tab === t ? "bg-foreground text-background shadow-[3px_3px_0_var(--accent)]" : "bg-surface"
              }`}
            >
              {t === "detail" ? "✎ 明細" : "◔ 統計"}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 pb-32">
        {tab === "detail" ? (
          <>
            <DateStrip
              month={month}
              today={today}
              selected={selectedDate}
              dailyTotals={dailyTotals}
              onSelect={setSelectedDate}
            />
            <DayList
              date={selectedDate}
              loading={loading}
              expenses={expenses.filter((e) => e.date === selectedDate)}
            />
          </>
        ) : (
          <StatsView
            month={month}
            today={today}
            loading={loading}
            expenses={expenses}
            total={monthTotal}
            onPickMonth={goToMonth}
          />
        )}
      </main>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-20 flex justify-center">
          <span className="card-retro -rotate-2 !rounded-full px-4 py-2 text-sm font-bold">{toast}</span>
        </div>
      )}

      <Composer onAdded={handleAdded} />
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}
