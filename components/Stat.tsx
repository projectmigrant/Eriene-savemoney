// 統計頁的小數字卡
export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-retro px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
