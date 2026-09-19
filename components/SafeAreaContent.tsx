"use client";

import { usePathname } from "next/navigation";

export default function SafeAreaContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  return (
    <div
      style={{
        paddingTop: isHomePage
          ? "0"
          : "env(safe-area-inset-top)",
      }}
    >
      {children}
    </div>
  );
}