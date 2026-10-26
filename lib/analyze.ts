import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES, ENTRY_TYPES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { taipeiToday as today } from "@/lib/date";
import { mockAnalyze } from "@/lib/mockAnalyze";

const ItemSchema = z.object({
  type: z.enum(ENTRY_TYPES).describe("expense = 花出去的錢；income = 賺到、收到的錢"),
  amount: z.number().describe("金額（新台幣），一律填正數"),
  category: z
    .enum(CATEGORIES)
    .describe(`支出用：${EXPENSE_CATEGORIES.join("、")}；收入用：${INCOME_CATEGORIES.join("、")}`),
  description: z.string().describe("簡短描述這一筆，例如「午餐便當」「業配收入」"),
  date: z.string().describe("花費日期，格式 YYYY-MM-DD"),
});

const AnalysisSchema = z.object({
  items: z.array(ItemSchema).describe("文字中提到的每一筆收入或支出，一筆一個元素"),
});

export type Analysis = z.infer<typeof ItemSchema> & {
  source: "claude" | "mock";
};

const client = new Anthropic();

export async function analyzeExpenses(text: string): Promise<Analysis[]> {
  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4096,
      output_config: {
        effort: "low",
        format: zodOutputFormat(AnalysisSchema),
      },
      system: `你是記帳助理。使用者的一段文字可能包含一筆或多筆收支，請把每一筆都分別擷取出來放進 items。花錢記為 expense、賺到或收到錢（薪水、獎金、業配、接案、退款、利息等）記為 income，並選對應的分類。今天是 ${today()}，若文字提到「昨天」「上週五」等相對日期請換算成實際日期；沒提到日期就用今天。`,
      messages: [{ role: "user", content: text }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      throw new Error("AI 無法分析這段文字");
    }
    return response.parsed_output.items.map((item) => ({
      ...item,
      category: fixCategory(item.type, item.category),
      source: "claude",
    }));
  } catch (error) {
    // 目前 .env.local 是假的 API key → 改用簡易規則分析，讓整個流程可以先測試
    if (error instanceof Anthropic.AuthenticationError) {
      console.warn("ANTHROPIC_API_KEY 無效，改用 mock 分析");
      return mockAnalyze(text, today()).map((item) => ({ ...item, source: "mock" }));
    }
    throw error;
  }
}

// 收入配到支出分類（或反過來）時，改成對應的「其他」
function fixCategory(type: Analysis["type"], category: Analysis["category"]): Analysis["category"] {
  const allowed: readonly string[] = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (allowed.includes(category)) return category;
  return type === "income" ? "其他收入" : "其他";
}
