// 分類定義放在這裡（不 import mongoose），前後端都能共用
export const CATEGORIES = ["餐飲", "交通", "購物", "娛樂", "居住", "醫療", "教育", "其他"] as const;

export type Category = (typeof CATEGORIES)[number];

// 偏復古、低飽和的色票
export const CATEGORY_COLORS: Record<Category, string> = {
  餐飲: "#d9653b",
  交通: "#3e6fa8",
  購物: "#c2577f",
  娛樂: "#7a5ba6",
  居住: "#4e8a5b",
  醫療: "#d39b2a",
  教育: "#2e8c8c",
  其他: "#8b7d65",
};

export type CategoryRow = { category: Category; amount: number; count: number };
