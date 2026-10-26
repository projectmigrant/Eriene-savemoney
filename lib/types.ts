import type { Category, EntryType } from "@/lib/categories";

// API 回傳給前端的記帳資料（支出或收入）
export type ExpenseItem = {
  _id: string;
  rawText: string;
  type: EntryType;
  amount: number;
  category: Category;
  description: string;
  date: string;
  source: "claude" | "mock";
  user: { _id: string; name: string }; // 誰記的帳
};
