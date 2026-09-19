"use client";

import { usePathname } from "next/navigation";

export default function SafeAreaContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="bg-[#052e16]">
      <div
        aria-hidden="true"
        style={{
          height: "env(safe-area-inset-top)",
        }}
      />

      {children}
    </div>
  );
}