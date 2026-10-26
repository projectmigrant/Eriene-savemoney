import Link from "next/link";
import AuthForm, { type AuthMode } from "@/components/AuthForm";
import CategoryBadge from "@/components/CategoryBadge";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

const FEATURES = [
  { icon: "✎", title: "一句話記帳", text: "像傳訊息一樣，打「午餐 120，公車 15」就記好了" },
  { icon: "✦", title: "AI 自動分類", text: "一句話裡有好幾筆也沒關係，AI 幫你拆開、分好類" },
  { icon: "☺", title: "大家一起記", text: "家人、室友、旅伴共用一本帳，誰記的一目了然" },
  { icon: "◔", title: "月、年統計", text: "錢都花去哪了？分類比例、每月趨勢通通看得到" },
];

const DEMO = [
  { category: "餐飲", description: "早餐蛋餅", amount: 45, who: "阿明" },
  { category: "交通", description: "捷運", amount: 30, who: "阿明" },
  { category: "娛樂", description: "看電影", amount: 320, who: "小美" },
] as const;

// 未登入時看到的 landing page，最下面是登入 / 註冊表單
export default function Landing({ mode }: { mode: AuthMode }) {
  return (
    <div className="notebook mx-auto flex min-h-dvh w-full max-w-md flex-col pr-6 pl-9">
      {/* Hero */}
      <section className="relative pt-[max(env(safe-area-inset-top),2rem)] pb-10">
        <div className="flex items-center justify-between">
          <span className="card-retro grid size-11 -rotate-6 place-items-center !rounded-xl !bg-accent text-xl font-bold text-accent-foreground">
            錢
          </span>
          <Link
            href="/login#auth"
            className="rounded-full border-[1.5px] border-foreground bg-surface px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_var(--foreground)] active:translate-y-0.5 active:shadow-none"
          >
            登入
          </Link>
        </div>

        <PocketIllustration />

        <div className="relative text-center">
          <span className="absolute -top-4 right-2 rotate-12 rounded-md border-2 border-accent px-2 py-0.5 text-sm font-bold text-accent opacity-90">
            AI 記帳
          </span>
          <h1 className="text-[2.6rem] leading-tight font-bold tracking-wide">
            錢錢
            <br />
            都來我<span className="relative inline-block text-accent">
              口袋
              <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M2 7 Q 25 1 50 6 T 98 4" fill="none" stroke="var(--mustard)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-4 text-muted">{APP_TAGLINE}</p>
        </div>

        <div className="mt-8 grid gap-3">
          <Link
            href="/register#auth"
            className="rounded-2xl border-[1.5px] border-foreground bg-accent py-4 text-center text-lg font-bold text-accent-foreground shadow-[4px_4px_0_var(--foreground)] transition active:translate-y-0.5 active:shadow-none"
          >
            免費開一本帳 →
          </Link>
          <p className="text-center text-xs text-muted">需要驗證碼才能註冊，請向管理員索取</p>
        </div>
      </section>

      {/* 示範：一句話 → 拆成好幾筆 */}
      <section className="pb-12">
        <SectionTitle no="壹" title="說一句話，就記好了" />
        <div className="flex justify-end">
          <p className="card-retro max-w-[85%] !rounded-2xl !rounded-br-sm px-4 py-2.5">
            早餐蛋餅 45，捷運 30，晚上看電影 320
          </p>
        </div>
        <p className="my-3 text-center text-sm text-muted">↓ AI 幫你拆成三筆 ↓</p>
        <ul className="card-retro -rotate-1 overflow-hidden">
          {DEMO.map((d) => (
            <li
              key={d.description}
              className="flex items-center gap-3 border-b-[1.5px] border-dashed border-line px-4 py-3 last:border-0"
            >
              <CategoryBadge category={d.category} />
              <div className="flex-1">
                <p>{d.description}</p>
                <p className="text-xs text-muted">
                  {d.category} · <span className="rounded-full bg-mustard/30 px-1.5 text-foreground">{d.who}</span>
                </p>
              </div>
              <span className="text-lg font-bold text-accent">−{d.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 功能介紹 */}
      <section className="pb-12">
        <SectionTitle no="貳" title="這本帳簿會的事" />
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`card-retro p-4 ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
              <span className="grid size-9 place-items-center rounded-full border-[1.5px] border-foreground bg-mustard text-lg">
                {f.icon}
              </span>
              <p className="mt-3 font-bold">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 登入 / 註冊 */}
      <section id="auth" className="scroll-mt-6 pb-10">
        <SectionTitle no="參" title={mode === "login" ? "打開你的帳簿" : "開始記第一筆"} />
        <AuthForm mode={mode} />
      </section>

      <footer className="mt-auto border-t-[1.5px] border-dashed border-foreground/30 py-6 text-center text-xs text-muted">
        © {APP_NAME} · 省一塊是一塊
      </footer>
    </div>
  );
}

function SectionTitle({ no, title }: { no: string; title: string }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
      <span className="grid size-9 shrink-0 -rotate-6 place-items-center rounded-full border-2 border-accent text-sm text-accent">
        {no}
      </span>
      {title}
    </h2>
  );
}

// 手繪風的口袋插圖，錢幣會輕輕上下飄
function PocketIllustration() {
  return (
    <div className="relative mx-auto my-6 h-44 w-56" aria-hidden>
      {/* 錢幣 */}
      {[
        { left: "18%", top: "0%", delay: "0s", label: "$" },
        { left: "44%", top: "-8%", delay: "0.4s", label: "元" },
        { left: "70%", top: "4%", delay: "0.8s", label: "$" },
      ].map((c) => (
        <span
          key={c.left}
          className="coin absolute grid size-11 place-items-center rounded-full border-[1.5px] border-foreground bg-mustard text-lg font-bold shadow-[2px_2px_0_var(--foreground)]"
          style={{ left: c.left, top: c.top, animationDelay: c.delay }}
        >
          {c.label}
        </span>
      ))}
      {/* 口袋 */}
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2" width="200" height="120" viewBox="0 0 200 120">
        <path
          d="M14 14 H186 V70 Q186 98 100 116 Q14 98 14 70 Z"
          fill="#4a6fa5"
          stroke="var(--foreground)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M24 24 H176 V68 Q176 90 100 106 Q24 90 24 68 Z"
          fill="none"
          stroke="var(--mustard)"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <path d="M14 14 Q100 40 186 14" fill="none" stroke="var(--foreground)" strokeWidth="3" />
        <rect x="150" y="30" width="22" height="12" rx="2" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="2" transform="rotate(-8 161 36)" />
      </svg>
    </div>
  );
}
