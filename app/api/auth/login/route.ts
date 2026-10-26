import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { createSession } from "@/lib/auth";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "請輸入 Email 和密碼" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await UserModel.findOne({ email }).select("+password");
    // 帳號不存在或密碼錯誤都回同一個訊息，避免被試出哪些 Email 有註冊
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return Response.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }
    await createSession(String(user._id));
    return Response.json({
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
