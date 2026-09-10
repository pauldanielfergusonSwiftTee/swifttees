import Link from "next/link";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";

const adminLinks = [
  {
    title: "Tournament Setup",
    description:
      "Create and manage tournaments, players, rounds and handicaps.",
    href: "/setup-v2",
    icon: "⛳",
  },
  {
    title: "Send Notifications",
    description: "Create and send manual Swift Tees push notifications.",
    href: "/admin/notifications",
    icon: "📣",
  },
];

export default function AdminPage() {
  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <div className="mb-4">
        <Link
          href="/more"
          className="text-sm font-black text-green-800"
        >
          ← More
        </Link>
      </div>

      <PageHeader
        eyebrow="Swift Tees"
        title="Admin"
        subtitle="Tournament setup and Swift Tees admin tools."
      />

      <div className="grid gap-3 pb-4">
        {adminLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-green-700 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl">
              {item.icon}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-green-950">
                {item.title}
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-600">
                {item.description}
              </p>
            </div>

            <span className="text-xl font-black text-green-700">
              →
            </span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}