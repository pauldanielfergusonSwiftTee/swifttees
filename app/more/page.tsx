import Link from "next/link";

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import EnableNotifications from "@/components/EnableNotifications";

const moreLinks = [
  {
    title: "Overall Leaderboard",
    description: "Full standings and detailed results.",
    href: "/overall-leaderboard",
    icon: "🏆",
  },
  {
    title: "Past Events",
    description: "Browse previous Swift Tees weekends.",
    href: "/events",
    icon: "📅",
  },
  {
    title: "Hall of Fame",
    description: "Past winners, legends and questionable achievements.",
    href: "/hall-of-fame",
    icon: "🏅",
  },
  {
    title: "Soundboard",
    description: "Swift Tees sounds.",
    href: "/soundboard",
    icon: "🔊",
  },
  {
    title: "Send Notifications",
    description: "Create and send Swift Tees push notifications.",
    href: "/admin/notifications",
    icon: "🔔",
  },
  {
    title: "Tournament Setup",
    description:
      "Create and manage tournaments, players, rounds and handicaps.",
    href: "/setup-v2",
    icon: "⚙️",
  },
];

export default function MorePage() {
  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <PageHeader
        eyebrow="Swift Tees"
        title="More"
        subtitle="Explore Swift Tees beyond the live weekend."
      />

      {/* MAIN LINKS */}
      <div className="grid gap-3">
        {moreLinks.map((item) => (
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

      {/* DEVICE NOTIFICATIONS */}
      <div className="mt-8 pb-4">
        <div className="mb-3 px-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Your Device
          </p>
        </div>

        <EnableNotifications />
      </div>
    </PageContainer>
  );
}