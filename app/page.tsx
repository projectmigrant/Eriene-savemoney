import { Suspense } from "react";
import { redirect } from "next/navigation";
import ExpenseApp from "@/components/ExpenseApp";
import { getSessionUser } from "@/lib/auth";
import { taipeiToday } from "@/lib/date";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <App />
    </Suspense>
  );
}

// 讀 cookie 判斷登入狀態，「今天」也在請求當下才計算
async function App() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <ExpenseApp today={taipeiToday()} user={user} />;
}
