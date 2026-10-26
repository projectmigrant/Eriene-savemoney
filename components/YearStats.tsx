"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow, EntryType } from "@/lib/categories";
import { formatMoney, formatShort, formatSigned } from "@/lib/date";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import Stat from "@/components/Stat";

type YearData = {
  year: string;
  expense: number[];
  income: number[];
  categories: (CategoryRow & { type: EntryType })[];
};

type Props = {
  initialYear: string;
  currentMonth: string;
  onPickMonth: (month: string) => void;
};

const EMPTY = Array<number>(12).fill(0);
const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);

// 年統計：每月支出 / 收入長條圖 + 全年分類佔比，點長條可跳到該月
export default function YearStats({ initialYear, currentMonth, onPickMonth }: Props) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState<YearData | null>(null);
  const loading = data?.year !== year;

  useEffect(() => {
    let ignore = false;
    fetch(`/api/stats?year=${year}`)
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        return res.json();
      })
      .then((json) => {
        if (!ignore) {
          setData({
            year,
            expense: json.expense ?? EMPTY,
            income: json.income ?? EMPTY,
            categories: json.categories ?? [],
          });
        }
      })
      .catch(() => {
        if (!ignore) setData({ year, expense: EMPTY, income: EMPTY, categories: [] });
      });
    return () => {
      ignore = true;
    };
  }, [year, router]);

  const expense = loading ? EMPTY : data!.expense;
  const income = loading ? EMPTY : data!.income;
  const totalExpense = sum(expense);
  const totalIncome = sum(income);
  const max = Math.max(...expense, ...income, 1);
  const activeMonths = expense.filter((m, i) => m > 0 || income[i] > 0).length;
  const categories = loading ? [] : data!.categories;
  const barHeight = (amount: number) => (amount > 0 ? `${Math.max((amount / max) * 100, 4)}%` : "0%");

  return (
    <div className="space-y-4">
      <div className="card-retro relative px-4 pt-4 pb-3">
        <span className="tape absolute -top-3 right-6 h-6 w-16 rotate-6" />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setYear(String(Number(year) - 1))}
            aria-label="前一年"
            className="grid size-8 place-items-center rounded-full text-lg font-bold active:bg-line"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="font-bold">{year} 年支出</p>
            <p className="text-2xl font-bold tabular-nums text-accent">
              {loading ? "…" : `$${formatMoney(totalExpense)}`}
            </p>
          </div>
          <button
            onClick={() => setYear(String(Number(year) + 1))}
            aria-label="下一年"
            className="grid size-8 place-items-center rounded-full text-lg font-bold active:bg-line"
          >
            ›
          </button>
        </div>

        {/* 每月長條圖：左支出、右收入 */}
        <div className="mt-4 flex h-44 items-end gap-1">
          {expense.map((spent, i) => {
            const m = `${year}-${String(i + 1).padStart(2, "0")}`;
            const isCurrent = m === currentMonth;
            const earned = income[i];
            return (
              <button
                key={m}
                onClick={() => onPickMonth(m)}
                className="flex h-full flex-1 flex-col items-center justify-end"
                aria-label={`${i + 1} 月`}
              >
                <span className="mb-1 h-3 text-[9px] leading-none tabular-nums text-muted">
                  {spent > 0 ? formatShort(spent) : ""}
                </span>
                <span className="flex h-full w-full items-end gap-px">
                  <span
                    className={`flex-1 rounded-t-sm border-[1.5px] border-b-0 border-foreground ${
                      isCurrent ? "bg-accent" : "bg-mustard"
                    } ${spent > 0 ? "" : "border-0"}`}
                    style={{ height: barHeight(spent) }}
                  />
                  <span
                    className={`flex-1 rounded-t-sm border-[1.5px] border-b-0 border-foreground bg-income ${
                      earned > 0 ? "" : "border-0"
                    }`}
                    style={{ height: barHeight(earned) }}
                  />
                </span>
                <span
                  className={`w-full border-t-[1.5px] border-foreground pt-1 text-[11px] whitespace-nowrap ${
                    isCurrent ? "font-bold text-accent" : "text-muted"
                  }`}
                >
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-sm border border-foreground bg-mustard" />支出
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-sm border border-foreground bg-income" />收入
          </span>
          <span>· 點長條看該月明細</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="全年收入" value={`+$${formatMoney(totalIncome)}`} tone="income" />
        <Stat
          label="全年結餘"
          value={formatSigned(totalIncome - totalExpense)}
          tone={totalIncome - totalExpense < 0 ? "expense" : "income"}
        />
        <Stat label="有記帳的月份" value={`${activeMonths} 個月`} />
        <Stat label="平均每月花" value={`$${formatMoney(Math.round(totalExpense / Math.max(activeMonths, 1)))}`} />
      </div>

      {loading ? (
        <div className="card-retro h-48 animate-pulse" />
      ) : (
        <>
          <CategoryBreakdown rows={categories.filter((c) => c.type === "expense")} total={totalExpense} />
          {totalIncome > 0 && (
            <CategoryBreakdown
              rows={categories.filter((c) => c.type === "income")}
              total={totalIncome}
              title="收入來源"
            />
          )}
        </>
      )}
    </div>
  );
}
