import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

// 註冊驗證碼，先寫死
export const REGISTER_CODE = "love";

const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 天

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("請在 .env.local 設定 AUTH_SECRET");
  return new TextEncoder().encode(value);
}

// 登入成功後簽發 JWT，存進 httpOnly cookie（前端 JS 讀不到，比較安全）
export async function createSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// 從 cookie 取得目前登入的使用者，沒登入或憑證無效回傳 null
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    await connectDB();
    const user = await UserModel.findById(payload.sub).lean<{
      _id: unknown;
      name: string;
      email: string;
      role: "user" | "admin";
    }>();
    if (!user) return null;
    return { id: String(user._id), name: user.name, email: user.email, role: user.role };
  } catch {
    return null;
  }
}
