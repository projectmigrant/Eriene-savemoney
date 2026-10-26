// 分類定義放在這裡（不 import mongoose），前後端都能共用
export const EXPENSE_CATEGORIES = ["餐飲", "交通", "購物", "娛樂", "居住", "醫療", "教育", "其他"] as const;
export const INCOME_CATEGORIES = ["薪資", "獎金", "副業", "投資", "其他收入"] as const;
export const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;

export type Category = (typeof CATEGORIES)[number];

// 收入或支出
export const ENTRY_TYPES = ["expense", "income"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

// 偏復古、低飽和的色票；收入用綠色系
export const CATEGORY_COLORS: Record<Category, string> = {
  餐飲: "#d9653b",
  交通: "#3e6fa8",
  購物: "#c2577f",
  娛樂: "#7a5ba6",
  居住: "#a0703c",
  醫療: "#d39b2a",
  教育: "#2e8c8c",
  其他: "#8b7d65",
  薪資: "#3f8f5a",
  獎金: "#6aa84f",
  副業: "#2e9e8f",
  投資: "#3a7d9c",
  其他收入: "#7d9b4a",
};

export type CategoryRow = { category: Category; amount: number; count: number };
