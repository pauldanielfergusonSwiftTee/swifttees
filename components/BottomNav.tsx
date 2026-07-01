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
    label: "Events",
    href: "/events",
    icon: "📅",
  },
  {
    label: "Live",
    href: "/match-centre",
    icon: "🔥",
  },
  {
  label: "Scorecard",
  href: "/events/carden-park-2026/live-leaderboard/live-scoring",
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
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const isActive =
  pathname === item.href ||
  (item.href !== "/" &&
    pathname.startsWith(item.href) &&
    item.href !== "/events") ||
  (item.label === "Events" &&
    pathname.startsWith("/events") &&
    !pathname.includes("/live-scoring"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-green-700 text-white shadow-md"
                  : "text-slate-500 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="mt-1 text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}