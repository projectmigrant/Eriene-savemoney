import { getSessionUser } from "@/lib/auth";

// 取得目前登入的使用者
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "尚未登入" }, { status: 401 });
  }
  return Response.json({ user });
}
