import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";

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
  title: "Live Centre (Beta)",
  description: "Preview the next generation live tournament experience.",
  href: "/live-centre",
  icon: "🧪",
},
  {
    title: "Tournament Setup",
    description: "Admin setup for groups, rounds and scoring.",
    href: "/events/carden-park-2026/live-leaderboard/setup",
    icon: "⚙️",
  },
  {
  title: "Tournament Setup V2",
  description: "Build reusable tournaments with courses, players and teams.",
  href: "/setup-v2",
  icon: "🧪",
},
{
  title: "Live Scoring V2",
  description: "Dynamic scoring powered by the active tournament.",
  href: "/live-scoring-v2",
  icon: "📝",
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

            <span className="text-xl font-black text-green-700">→</span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}