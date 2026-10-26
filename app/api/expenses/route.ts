import { connectDB } from "@/lib/mongodb";
import { analyzeExpenses } from "@/lib/analyze";
import { getSessionUser } from "@/lib/auth";
import { ExpenseModel } from "@/models/Expense";
import "@/models/User"; // populate("user") 需要 User model 已註冊

// 輸入一段文字 → AI 拆成多筆 → 每筆各存一份 document（記下是誰記的）→ 回傳結果
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json({ error: "請輸入文字" }, { status: 400 });
  }

  try {
    const items = await analyzeExpenses(text);
    if (items.length === 0) {
      return Response.json({ error: "找不到任何花費，請輸入包含金額的文字" }, { status: 422 });
    }
    await connectDB();
    const docs = await ExpenseModel.insertMany(
      items.map((item) => ({ user: user.id, rawText: text, ...item })),
    );
    const expenses = docs.map((doc) => ({
      ...doc.toObject(),
      user: { _id: user.id, name: user.name },
    }));
    return Response.json({ expenses }, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "未知錯誤";
    return Response.json({ error: message }, { status: 500 });
  }
}

// 取得某個月份所有人的記帳紀錄：GET /api/expenses?month=YYYY-MM
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  const month = new URL(request.url).searchParams.get("month") ?? "";
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return Response.json({ error: "month 格式需為 YYYY-MM" }, { status: 400 });
  }

  try {
    await connectDB();
    // date 是 "YYYY-MM-DD" 字串，用字串範圍就能篩出整個月
    const expenses = await ExpenseModel.find({ date: { $gte: `${month}-01`, $lte: `${month}-31` } })
      .sort({ date: -1, createdAt: -1 })
      .populate("user", "name")
      .lean();
    return Response.json({ expenses });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "未知錯誤";
    return Response.json({ error: message }, { status: 500 });
  }
}
