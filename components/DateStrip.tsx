"use client";

import { useEffect, useRef } from "react";
import { daysOfMonth, formatShort, weekdayOf } from "@/lib/date";

export type DayTotal = { expense: number; income: number };

type Props = {
  month: string;
  today: string;
  selected: string;
  dailyTotals: Record<string, DayTotal>;
  onSelect: (date: string) => void;
};

// 可橫向滑動的日期列，選中的日期像蓋了紅色印章
export default function DateStrip({ month, today, selected, dailyTotals, onSelect }: Props) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  // 選中的日期自動捲到中間
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected, month]);

  return (
    <div className="no-scrollbar mt-6 flex snap-x gap-2.5 overflow-x-auto pr-5 pl-8 pt-1 pb-2">
      {daysOfMonth(month).map((date) => {
        const isSelected = date === selected;
        const isToday = date === today;
        const total = dailyTotals[date];
        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => onSelect(date)}
            className={`flex w-[52px] shrink-0 snap-center flex-col items-center rounded-xl border-[1.5px] py-2 transition active:scale-95 ${
              isSelected
                ? "-rotate-3 border-accent bg-accent text-accent-foreground shadow-[2px_2px_0_var(--foreground)]"
                : isToday
                  ? "border-dashed border-accent bg-surface"
                  : "border-foreground/25 bg-surface"
            }`}
          >
            <span className={`text-[11px] ${isSelected ? "" : isToday ? "font-bold text-accent" : "text-muted"}`}>
              {isToday ? "今天" : weekdayOf(date)}
            </span>
            <span className="text-xl leading-tight font-bold tabular-nums">{Number(date.slice(8))}</span>
            {/* 有支出顯示支出（紅），只有收入時顯示收入（綠） */}
            <span
              className={`h-3.5 text-[10px] tabular-nums ${
                isSelected ? "" : total?.expense ? "text-accent" : "text-income"
              }`}
            >
              {total?.expense
                ? formatShort(total.expense)
                : total?.income
                  ? `+${formatShort(total.income)}`
                  : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
