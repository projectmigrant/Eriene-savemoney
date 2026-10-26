import { Suspense } from "react";
import { redirect } from "next/navigation";
import Landing from "@/components/Landing";
import { getSessionUser } from "@/lib/auth";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Register />
    </Suspense>
  );
}

// 已登入就直接回首頁
async function Register() {
  if (await getSessionUser()) redirect("/");
  return <Landing mode="register" />;
}
