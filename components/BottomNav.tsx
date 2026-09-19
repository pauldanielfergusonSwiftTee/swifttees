"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: "🏠",
  },
  {
    label: "Worsley",
    href: "/events/worsley-park-september-2026",
    icon: "⛳",
  },
  {
    label: "Leaderboard",
    href: "/live-centre",
    icon: "🏆",
  },
  {
    label: "Scorecards",
    href: "/live-scoring-v2",
    icon: "📝",
  },
  {
    label: "More",
    href: "/more",
    icon: "☰",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed left-3 right-3 z-50"
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 rounded-[26px] border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
        {navItems.map((item) => {
          const isScorecard = pathname.includes("/live-scoring");

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.href.includes("live-scoring")
                ? isScorecard
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center rounded-[18px] px-1 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-green-700 text-white shadow-md"
                  : "text-slate-500 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>

              <span className="mt-1 w-full truncate text-center text-[10px] font-medium leading-tight sm:text-[11px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}