// 日期一律用 "YYYY-MM-DD" 字串，以台灣時區為準

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function taipeiToday() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
}

export function monthOf(date: string) {
  return date.slice(0, 7);
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function daysOfMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

export function weekdayOf(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return `${y} 年 ${m} 月`;
}

export function formatDay(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${m} 月 ${d} 日 · 星期${weekdayOf(date)}`;
}

export function formatMoney(n: number) {
  return n.toLocaleString("zh-TW", { maximumFractionDigits: 2 });
}

// 圖表上的簡短金額，例如 12500 → 1.3萬
export function formatShort(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}萬`;
  return formatMoney(Math.round(n));
}
