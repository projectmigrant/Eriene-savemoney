import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";
import { taipeiToday as today } from "@/lib/date";

const ItemSchema = z.object({
  amount: z.number().describe("花費金額（新台幣），只要數字"),
  category: z.enum(CATEGORIES),
  description: z.string().describe("簡短描述這筆花費，例如「午餐便當」"),
  date: z.string().describe("花費日期，格式 YYYY-MM-DD"),
});

const AnalysisSchema = z.object({
  items: z.array(ItemSchema).describe("文字中提到的每一筆花費，一筆一個元素"),
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
      system: `你是記帳助理。使用者的一段文字可能包含一筆或多筆花費，請把每一筆都分別擷取出來放進 items。今天是 ${today()}，若文字提到「昨天」「上週五」等相對日期請換算成實際日期；沒提到日期就用今天。`,
      messages: [{ role: "user", content: text }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      throw new Error("AI 無法分析這段文字");
    }
    return response.parsed_output.items.map((item) => ({ ...item, source: "claude" }));
  } catch (error) {
    // 目前 .env.local 是假的 API key → 改用簡易規則分析，讓整個流程可以先測試
    if (error instanceof Anthropic.AuthenticationError) {
      console.warn("ANTHROPIC_API_KEY 無效，改用 mock 分析");
      return mockAnalyze(text);
    }
    throw error;
  }
}

const KEYWORDS: Record<(typeof CATEGORIES)[number], string[]> = {
  餐飲: ["早餐", "午餐", "晚餐", "宵夜", "飯", "麵", "咖啡", "飲料", "便當", "吃"],
  交通: ["捷運", "公車", "計程車", "uber", "高鐵", "火車", "加油", "停車"],
  購物: ["買", "衣服", "鞋", "網購", "蝦皮"],
  娛樂: ["電影", "遊戲", "唱歌", "ktv", "門票"],
  居住: ["房租", "水費", "電費", "瓦斯", "網路費"],
  醫療: ["看醫生", "掛號", "藥", "牙醫"],
  教育: ["書", "課程", "學費", "補習"],
  其他: [],
};

// 依標點或「還有」切成多段，有數字的段落各算一筆
function mockAnalyze(text: string): Analysis[] {
  return text
    .split(/[，,、；;。\n]|還有/)
    .map((s) => s.trim())
    .filter((s) => /\d/.test(s))
    .map(mockAnalyzeOne);
}

function mockAnalyzeOne(text: string): Analysis {
  const amount = Number(text.match(/\d+(\.\d+)?/)?.[0] ?? 0);
  const lower = text.toLowerCase();
  const category =
    CATEGORIES.find((c) => KEYWORDS[c].some((k) => lower.includes(k))) ?? "其他";
  return {
    amount,
    category,
    description: text.replace(/\d+(\.\d+)?\s*(元|塊)?/, "").trim() || text,
    date: today(),
    source: "mock",
  };
}
