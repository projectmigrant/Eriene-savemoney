import type { Category, EntryType } from "@/lib/categories";

// 沒有可用的 Claude API key 時使用的規則式分析
// 能處理：「2026年10月26日喝牛奶38元中餐吃飯糰40」「昨天 咖啡2杯100，捷運30」「賺到業配1000」這類輸入

export type MockItem = {
  type: EntryType;
  amount: number;
  category: Category;
  description: string;
  date: string;
};

const KEYWORDS: [Category, string[]][] = [
  ["餐飲", ["早餐", "午餐", "中餐", "晚餐", "宵夜", "下午茶", "飯", "麵", "咖啡", "飲料", "便當", "牛奶", "奶茶", "茶", "飯糰", "牛排", "火鍋", "麵包", "蛋", "水果", "零食", "點心", "甜點", "小吃", "餐", "吃", "喝"]],
  ["交通", ["捷運", "公車", "客運", "計程車", "uber", "高鐵", "火車", "台鐵", "加油", "停車", "車資", "機票", "悠遊卡"]],
  ["娛樂", ["電影", "遊戲", "唱歌", "ktv", "門票", "演唱會", "展覽", "訂閱", "netflix"]],
  ["居住", ["房租", "水費", "電費", "瓦斯", "網路費", "管理費", "電話費"]],
  ["醫療", ["看醫生", "掛號", "藥", "牙醫", "診所", "醫院"]],
  ["教育", ["書", "課程", "學費", "補習", "文具"]],
  ["購物", ["買", "衣服", "褲", "鞋", "包包", "網購", "蝦皮", "日用品", "衛生紙"]],
];

// 出現這些字就算收入
const INCOME_WORDS = ["賺", "收入", "進帳", "入帳", "收到", "領到", "領薪", "薪水", "薪資", "月薪", "工資", "獎金", "年終", "業配", "接案", "外快", "兼職", "退款", "退費", "利息", "股息", "股利", "中獎", "賣掉", "賣出", "收紅包", "拿紅包"];

const INCOME_KEYWORDS: [Category, string[]][] = [
  ["薪資", ["薪水", "薪資", "月薪", "工資", "領薪"]],
  ["獎金", ["獎金", "年終", "紅包", "中獎"]],
  ["副業", ["業配", "接案", "外快", "兼職", "稿費"]],
  ["投資", ["利息", "股息", "股利", "股票", "基金", "投資"]],
];

// 數量單位：「2杯」「3個」裡的數字不是金額（「塊」是金額單位，不算）
const QUANTITY_UNITS = "杯|個|份|張|次|顆|碗|瓶|包|件|片|條|盒|罐|支|位|人|台|雙|本|斤|公斤|串|根|隻";

const toHalfWidth = (s: string) => s.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0));
const toFullWidth = (s: string) => s.replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 0xfee0));

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function shiftDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// 找出文字裡的日期，回傳日期和拿掉日期後的文字
function extractDate(text: string, today: string): { date: string; rest: string } {
  const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/(\d{4})\s*[年/.-]\s*(\d{1,2})\s*[月/.-]\s*(\d{1,2})\s*[日號]?/, (m) => `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`],
    [/(\d{1,2})\s*月\s*(\d{1,2})\s*[日號]?/, (m) => `${today.slice(0, 4)}-${pad(+m[1])}-${pad(+m[2])}`],
    [/(\d{1,2})\/(\d{1,2})(?!\d)/, (m) => `${today.slice(0, 4)}-${pad(+m[1])}-${pad(+m[2])}`],
    [/大前天/, () => shiftDays(today, -3)],
    [/前天/, () => shiftDays(today, -2)],
    [/昨天|昨日/, () => shiftDays(today, -1)],
    [/今天|今日/, () => today],
  ];
  for (const [re, toDate] of patterns) {
    const m = text.match(re);
    if (m) {
      const date = toDate(m);
      // 擋掉 13 月、32 日這種不合理的日期
      if (!Number.isNaN(Date.parse(date)) && shiftDays(date, 0) === date) {
        return { date, rest: text.replace(m[0], " ") };
      }
    }
  }
  return { date: today, rest: text };
}

function guessType(description: string): EntryType {
  return INCOME_WORDS.some((w) => description.includes(w)) ? "income" : "expense";
}

function guessCategory(description: string, type: EntryType): Category {
  const lower = description.toLowerCase();
  if (type === "income") {
    return INCOME_KEYWORDS.find(([, words]) => words.some((w) => lower.includes(w)))?.[0] ?? "其他收入";
  }
  return KEYWORDS.find(([, words]) => words.some((w) => lower.includes(w)))?.[0] ?? "其他";
}

function cleanDescription(s: string) {
  return toHalfWidth(
    s
      .replace(/^(?:[\s，,、；;。.!！~～+＋]|還有|然後|另外|以及|和|跟|與|及|再)+/, "")
      .replace(/(?:[\s，,、；;：:。=＝]|總共|一共|花了|付了|花|付|共)+$/, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function mockAnalyze(input: string, today: string): MockItem[] {
  const { date, rest } = extractDate(toHalfWidth(input), today);

  const text = rest
    // 千分位逗號：1,200 → 1200
    .replace(/(\d),(?=\d{3}(?!\d))/g, "$1")
    // 拿掉時間，例如 12:30、8點半
    .replace(/\d{1,2}[:：]\d{2}/g, " ")
    .replace(/\d{1,2}\s*點(?:\s*\d{1,2}\s*分|半)?/g, " ")
    // 數量的數字先轉成全形，下面抓金額時就不會被當成金額
    .replace(new RegExp(`\\d+(?=\\s*(?:${QUANTITY_UNITS}))`, "g"), toFullWidth);

  // 每個「金額」和它前面的文字組成一筆
  const items: MockItem[] = [];
  const amountRe = /(?:NT\$|\$)?\s*(\d+(?:\.\d+)?)\s*(?:元|塊錢|塊|圓)?/g;
  let last = 0;
  for (const m of text.matchAll(amountRe)) {
    const description = cleanDescription(text.slice(last, m.index));
    last = m.index + m[0].length;
    const amount = Number(m[1]);
    if (!amount) continue;
    const type = guessType(description);
    items.push({
      type,
      amount,
      description: description || (type === "income" ? "未命名收入" : "未命名花費"),
      category: guessCategory(description, type),
      date,
    });
  }
  return items;
}
