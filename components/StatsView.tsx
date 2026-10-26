"use client";

import { useState } from "react";
import type { ExpenseItem } from "@/lib/types";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Category, type CategoryRow } from "@/lib/categories";
import { daysOfMonth, formatMoney, formatSigned, monthOf } from "@/lib/date";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import YearStats from "@/components/YearStats";
import Stat from "@/components/Stat";

type Props = {
  month: string;
  today: string;
  loading: boolean;
  expenses: ExpenseItem[];
  totalExpense: number;
  totalIncome: number;
  onPickMonth: (month: string) => void;
};

function rowsOf(items: ExpenseItem[], categories: readonly Category[]): CategoryRow[] {
  return categories.map((category) => {
    const matched = items.filter((e) => e.category === category);
    return { category, count: matched.length, amount: matched.reduce((sum, e) => sum + e.amount, 0) };
  });
}

// 統計頁：月統計（跟著上方月份切換）/ 年統計
export default function StatsView({ month, today, loading, expenses, totalExpense, totalIncome, onPickMonth }: Props) {
  const [mode, setMode] = useState<"month" | "year">("month");

  // 本月算到今天，其他月份算整個月
  const days = month === monthOf(today) ? Number(today.slice(8)) : daysOfMonth(month).length;
  const spending = expenses.filter((e) => e.type === "expense");
  const earning = expenses.filter((e) => e.type === "income");
  const balance = totalIncome - totalExpense;

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
              <Stat label="本月收入" value={`+$${formatMoney(totalIncome)}`} tone="income" />
              <Stat label="結餘" value={formatSigned(balance)} tone={balance < 0 ? "expense" : "income"} />
              <Stat label="支出筆數" value={`${spending.length} 筆`} />
              <Stat label="平均每天花" value={`$${formatMoney(Math.round(totalExpense / Math.max(days, 1)))}`} />
            </div>
            <p className="text-center text-xs text-muted">↑ 用上方的箭頭切換其他月份</p>
            <CategoryBreakdown rows={rowsOf(spending, EXPENSE_CATEGORIES)} total={totalExpense} />
            {earning.length > 0 && (
              <CategoryBreakdown rows={rowsOf(earning, INCOME_CATEGORIES)} total={totalIncome} title="收入來源" />
            )}
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
