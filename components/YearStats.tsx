"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow } from "@/lib/categories";
import { formatMoney, formatShort } from "@/lib/date";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import Stat from "@/components/Stat";

type YearData = { year: string; months: number[]; categories: CategoryRow[] };

type Props = {
  initialYear: string;
  currentMonth: string;
  onPickMonth: (month: string) => void;
};

// 年統計：每月長條圖 + 全年分類佔比，點長條可跳到該月
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
        if (!ignore) setData({ year, months: json.months ?? Array(12).fill(0), categories: json.categories ?? [] });
      })
      .catch(() => {
        if (!ignore) setData({ year, months: Array(12).fill(0), categories: [] });
      });
    return () => {
      ignore = true;
    };
  }, [year, router]);

  const months = loading ? Array(12).fill(0) : data!.months;
  const total = months.reduce((a, b) => a + b, 0);
  const max = Math.max(...months, 1);
  const activeMonths = months.filter((m) => m > 0).length;

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
            <p className="font-bold">{year} 年</p>
            <p className="text-2xl font-bold tabular-nums text-accent">
              {loading ? "…" : `$${formatMoney(total)}`}
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

        {/* 每月長條圖 */}
        <div className="mt-4 flex h-44 items-end gap-1">
          {months.map((amount, i) => {
            const m = `${year}-${String(i + 1).padStart(2, "0")}`;
            const isCurrent = m === currentMonth;
            return (
              <button
                key={m}
                onClick={() => onPickMonth(m)}
                className="flex h-full flex-1 flex-col items-center justify-end"
                aria-label={`${i + 1} 月`}
              >
                <span className="mb-1 h-3 text-[9px] leading-none tabular-nums text-muted">
                  {amount > 0 ? formatShort(amount) : ""}
                </span>
                <span
                  className={`w-full rounded-t-md border-[1.5px] border-b-0 border-foreground transition-all ${
                    isCurrent ? "bg-accent" : "bg-mustard"
                  }`}
                  style={{ height: amount > 0 ? `${Math.max((amount / max) * 100, 4)}%` : "0%" }}
                />
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
        <p className="mt-2 text-center text-xs text-muted">（月）點長條可以看那個月的明細</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="有記帳的月份" value={`${activeMonths} 個月`} />
        <Stat label="平均每月" value={`$${formatMoney(Math.round(total / Math.max(activeMonths, 1)))}`} />
      </div>

      {loading ? (
        <div className="card-retro h-48 animate-pulse" />
      ) : (
        <CategoryBreakdown rows={data!.categories} total={total} />
      )}
    </div>
  );
}
