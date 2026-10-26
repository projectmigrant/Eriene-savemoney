// 統計頁的小數字卡；tone 決定數字顏色（收入綠、支出紅）
export default function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "income" | "expense";
}) {
  const color = tone === "income" ? "text-income" : tone === "expense" ? "text-accent" : "";
  return (
    <div className="card-retro px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
