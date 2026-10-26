import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { CATEGORIES, ENTRY_TYPES } from "@/lib/categories";

const ExpenseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 誰記的帳
    rawText: { type: String, required: true }, // 使用者輸入的原始文字
    type: { type: String, enum: ENTRY_TYPES, default: "expense", required: true }, // 支出或收入
    amount: { type: Number, required: true }, // 一律存正數，正負由 type 決定
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    source: { type: String, enum: ["claude", "mock"], required: true }, // 分析來源
  },
  { timestamps: true },
);

export type Expense = InferSchemaType<typeof ExpenseSchema>;

// hot reload 時先移除舊的 model，確保改過的 schema 會生效
if (mongoose.models.Expense) mongoose.deleteModel("Expense");
export const ExpenseModel = mongoose.model("Expense", ExpenseSchema);
