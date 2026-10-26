import { CATEGORY_COLORS, type CategoryRow } from "@/lib/categories";
import { formatMoney } from "@/lib/date";
import CategoryBadge from "@/components/CategoryBadge";

// 分類佔比：比例條 + 各分類長條，月統計和年統計共用
export default function CategoryBreakdown({ rows, total }: { rows: CategoryRow[]; total: number }) {
  const sorted = rows.filter((r) => r.amount > 0).sort((a, b) => b.amount - a.amount);

  if (sorted.length === 0) {
    return (
      <div className="card-retro px-6 py-10 text-center">
        <p className="text-3xl">(ㆆ_ㆆ)</p>
        <p className="mt-3 text-muted">這段時間還沒有花費紀錄</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-retro p-4">
        <p className="mb-3 text-sm font-bold">花費分佈</p>
        <div className="flex h-5 overflow-hidden rounded-full border-[1.5px] border-foreground">
          {sorted.map((r) => (
            <div
              key={r.category}
              className="border-r-[1.5px] border-foreground last:border-0"
              style={{ width: `${(r.amount / total) * 100}%`, backgroundColor: CATEGORY_COLORS[r.category] }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {sorted.map((r) => (
            <span key={r.category} className="flex items-center gap-1.5 text-xs">
              <span
                className="size-2.5 rounded-full border border-foreground"
                style={{ backgroundColor: CATEGORY_COLORS[r.category] }}
              />
              {r.category} {Math.round((r.amount / total) * 100)}%
            </span>
          ))}
        </div>
      </div>

      <ul className="card-retro overflow-hidden">
        {sorted.map((r, i) => (
          <li
            key={r.category}
            className="flex items-center gap-3 border-b-[1.5px] border-dashed border-line px-4 py-3 last:border-0"
          >
            <CategoryBadge category={r.category} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[16px]">
                  {i === 0 && <span className="mr-1 text-xs text-accent">♛</span>}
                  {r.category}
                  <span className="ml-1.5 text-xs text-muted">{r.count} 筆</span>
                </span>
                <span className="font-bold tabular-nums">${formatMoney(r.amount)}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-foreground/60 bg-background">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(r.amount / total) * 100}%`, backgroundColor: CATEGORY_COLORS[r.category] }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
