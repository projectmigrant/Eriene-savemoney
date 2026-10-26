import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { REGISTER_CODE, createSession } from "@/lib/auth";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (code !== REGISTER_CODE) {
    return Response.json({ error: "驗證碼錯誤" }, { status: 403 });
  }
  if (!name || !email || !password) {
    return Response.json({ error: "請填寫名字、Email 和密碼" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Email 格式不正確" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "密碼至少 6 個字元" }, { status: 400 });
  }

  try {
    await connectDB();
    if (await UserModel.exists({ email })) {
      return Response.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }
    const user = await UserModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });
    await createSession(String(user._id));
    return Response.json({ user: { id: String(user._id), name, email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
