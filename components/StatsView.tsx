"use client";

import { useState } from "react";
import type { ExpenseItem } from "@/lib/types";
import { CATEGORIES, type CategoryRow } from "@/lib/categories";
import { daysOfMonth, formatMoney, monthOf } from "@/lib/date";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import YearStats from "@/components/YearStats";
import Stat from "@/components/Stat";

type Props = {
  month: string;
  today: string;
  loading: boolean;
  expenses: ExpenseItem[];
  total: number;
  onPickMonth: (month: string) => void;
};

// 統計頁：月統計（跟著上方月份切換）/ 年統計
export default function StatsView({ month, today, loading, expenses, total, onPickMonth }: Props) {
  const [mode, setMode] = useState<"month" | "year">("month");

  // 本月算到今天，其他月份算整個月
  const days = month === monthOf(today) ? Number(today.slice(8)) : daysOfMonth(month).length;
  const rows: CategoryRow[] = CATEGORIES.map((category) => {
    const items = expenses.filter((e) => e.category === category);
    return { category, count: items.length, amount: items.reduce((sum, e) => sum + e.amount, 0) };
  });

  return (
    <section className="mt-5 pr-5 pl-8">
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-full border-[1.5px] border-foreground bg-surface p-1 text-sm">
          {(["month", "year"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-5 py-1 font-bold transition ${
                mode === m ? "bg-mustard" : "text-muted"
              }`}
            >
              {m === "month" ? "月統計" : "年統計"}
            </button>
          ))}
        </div>
      </div>

      {mode === "month" ? (
        loading ? (
          <div className="card-retro h-64 animate-pulse" />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="記了幾筆" value={`${expenses.length} 筆`} />
              <Stat label="平均每天" value={`$${formatMoney(Math.round(total / Math.max(days, 1)))}`} />
            </div>
            <p className="text-center text-xs text-muted">↑ 用上方的箭頭切換其他月份</p>
            <CategoryBreakdown rows={rows} total={total} />
          </div>
        )
      ) : (
        <YearStats
          initialYear={month.slice(0, 4)}
          currentMonth={month}
          onPickMonth={(m) => {
            onPickMonth(m);
            setMode("month");
          }}
        />
      )}
    </section>
  );
}
