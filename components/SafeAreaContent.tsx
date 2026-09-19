"use client";

import { usePathname } from "next/navigation";

export default function SafeAreaContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Homepage stays full-bleed behind the iPhone status bar.
  if (pathname === "/") {
    return <>{children}</>;
  }

  function getSafeAreaBackground() {
    // Live leaderboard
    if (pathname.startsWith("/live-centre")) {
      return "#f5f4ee";
    }

    // Live scoring / scorecard
    if (pathname.startsWith("/live-scoring-v2")) {
      return "#eef2eb";
    }

    // Overall leaderboard
    if (pathname.startsWith("/overall-leaderboard")) {
      return "#f3f1eb";
    }

    // Hall of Fame
    if (pathname.startsWith("/hall-of-fame")) {
      return "#f2f0e9";
    }

    // More, Worsley, setup, notifications and other
    // PageContainer pages use Tailwind slate-100.
    return "#f1f5f9";
  }

  const safeAreaBackground = getSafeAreaBackground();

  return (
    <div
      style={{
        backgroundColor: safeAreaBackground,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          height: "env(safe-area-inset-top)",
          backgroundColor: safeAreaBackground,
        }}
      />

      {children}
    </div>
  );
}