import type { ExpenseItem } from "@/lib/types";
import { formatDay, formatMoney } from "@/lib/date";
import CategoryBadge from "@/components/CategoryBadge";

type Props = {
  date: string;
  loading: boolean;
  expenses: ExpenseItem[];
};

// 選中日期的記帳明細，像帳本的一頁
export default function DayList({ date, loading, expenses }: Props) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <section className="mt-5 pr-5 pl-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-bold">{formatDay(date)}</h2>
        {expenses.length > 0 && (
          <span className="text-sm tabular-nums text-muted">
            小計 <span className="font-bold text-accent">${formatMoney(total)}</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="card-retro h-40 animate-pulse" />
      ) : expenses.length === 0 ? (
        <div className="card-retro px-6 py-10 text-center">
          <p className="text-3xl">( ˘ω˘ )</p>
          <p className="mt-3 text-muted">這天還是空白的一頁</p>
          <p className="mt-1 text-xs text-muted">在下方寫下「早餐 60，捷運 25」試試看</p>
        </div>
      ) : (
        <ul className="card-retro overflow-hidden">
          {expenses.map((e) => (
            <li
              key={e._id}
              className="flex items-center gap-3 border-b-[1.5px] border-dashed border-line px-4 py-3 last:border-0"
            >
              <CategoryBadge category={e.category} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px]">{e.description}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  {e.category}
                  <span>·</span>
                  <span className="rounded-full bg-mustard/30 px-1.5 text-foreground">{e.user.name}</span>
                  {e.source === "mock" && <span className="text-[10px] opacity-70">(mock)</span>}
                </p>
              </div>
              <span className="text-lg font-bold tabular-nums text-accent">−{formatMoney(e.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
