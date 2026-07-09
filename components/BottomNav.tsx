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
  label: "Stu's B'day",
  href: "/events/carden-park-2026",
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
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-1">
        {navItems.map((item) => {
          const isScorecard = pathname.includes("/live-scoring");

const isActive =
  item.href === "/"
    ? pathname === "/"
    : item.href.includes("live-scoring")
    ? isScorecard
    : item.href === "/events/carden-park-2026"
    ? pathname.startsWith("/events/carden-park-2026") && !isScorecard
    : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-green-700 text-white shadow-md"
                  : "text-slate-500 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="mt-1 text-center text-[11px] font-medium leading-tight">
  {item.label}
</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}