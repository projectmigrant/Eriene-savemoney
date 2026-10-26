import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { ExpenseModel } from "@/models/Expense";

// 年度統計：GET /api/stats?year=YYYY → 每月合計 + 各分類合計
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  const year = new URL(request.url).searchParams.get("year") ?? "";
  if (!/^\d{4}$/.test(year)) {
    return Response.json({ error: "year 格式需為 YYYY" }, { status: 400 });
  }

  try {
    await connectDB();
    const [result] = await ExpenseModel.aggregate<{
      months: { _id: string; total: number }[];
      categories: { _id: string; amount: number; count: number }[];
    }>([
      { $match: { date: { $gte: `${year}-01-01`, $lte: `${year}-12-31` } } },
      {
        $facet: {
          // date 是 "YYYY-MM-DD"，第 5~6 個字元就是月份
          months: [{ $group: { _id: { $substrBytes: ["$date", 5, 2] }, total: { $sum: "$amount" } } }],
          categories: [{ $group: { _id: "$category", amount: { $sum: "$amount" }, count: { $sum: 1 } } }],
        },
      },
    ]);

    const months = Array.from({ length: 12 }, (_, i) => {
      const mm = String(i + 1).padStart(2, "0");
      return result.months.find((m) => m._id === mm)?.total ?? 0;
    });
    const categories = result.categories.map((c) => ({
      category: c._id,
      amount: c.amount,
      count: c.count,
    }));

    return Response.json({ year, months, categories });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "未知錯誤";
    return Response.json({ error: message }, { status: 500 });
  }
}
