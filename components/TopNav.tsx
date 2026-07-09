"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Stu's B'day", href: "/events/carden-park-2026" },
  { label: "Leaderboard", href: "/live-centre" },
  {
    label: "Scorecard",
    href: "/live-scoring-v2",
  },
  { label: "More", href: "/more" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden border-b border-slate-200 bg-white md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-black text-green-950">
          Swift Tees
        </Link>

        <div className="flex gap-2">
          {navItems.map((item) => {
            const isActive =
  item.href === "/"
    ? pathname === "/"
    : item.href === "/events/carden-park-2026"
    ? pathname === "/events/carden-park-2026"
    : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  isActive
                    ? "bg-green-700 text-white"
                    : "text-slate-600 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}