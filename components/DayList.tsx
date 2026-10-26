import type { ExpenseItem } from "@/lib/types";
import { formatDay, formatMoney } from "@/lib/date";
import CategoryBadge from "@/components/CategoryBadge";

type Props = {
  date: string;
  loading: boolean;
  expenses: ExpenseItem[];
};

// 選中日期的收支明細，像帳本的一頁
export default function DayList({ date, loading, expenses }: Props) {
  const spent = expenses.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
  const earned = expenses.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0);

  return (
    <section className="mt-5 pr-5 pl-8">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-bold">{formatDay(date)}</h2>
        {expenses.length > 0 && (
          <span className="flex gap-2 text-sm tabular-nums text-muted">
            {spent > 0 && (
              <span>
                支出 <span className="font-bold text-accent">${formatMoney(spent)}</span>
              </span>
            )}
            {earned > 0 && (
              <span>
                收入 <span className="font-bold text-income">${formatMoney(earned)}</span>
              </span>
            )}
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
          {expenses.map((e) => {
            const isIncome = e.type === "income";
            return (
              <li
                key={e._id}
                className="flex items-center gap-3 border-b-[1.5px] border-dashed border-line px-4 py-3 last:border-0"
              >
                <CategoryBadge category={e.category} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px]">{e.description}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    {isIncome && <span className="rounded border border-income px-1 text-[10px] text-income">收入</span>}
                    {e.category}
                    <span>·</span>
                    <span className="rounded-full bg-mustard/30 px-1.5 text-foreground">{e.user.name}</span>
                    {e.source === "mock" && <span className="text-[10px] opacity-70">(mock)</span>}
                  </p>
                </div>
                <span className={`text-lg font-bold tabular-nums ${isIncome ? "text-income" : "text-accent"}`}>
                  {isIncome ? "+" : "−"}
                  {formatMoney(e.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
