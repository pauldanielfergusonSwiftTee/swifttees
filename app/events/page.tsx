import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";

const events = [
  {
    title: "Carden Park",
    date: "July 2026",
    label: "Next Event",
    description:
      "The upcoming Swift Tees trip. Cheshire Course, Nicklaus Course, registration, scoring and inevitable controversy.",
    href: "/events/carden-park-2026",
    featured: true,
  },
  {
    title: "Mottram Hall",
    date: "March 2026",
    label: "Past Event",
    description: "Write-up, results and photos coming soon.",
    href: "/events/mottram-hall-march-2026",
    featured: false,
  },
  {
    title: "Shrigley Hall",
    date: "September 2025",
    label: "Past Event",
    description: "Write-up, results and photos coming soon.",
    href: "/events/shrigley-hall-september-2025",
    featured: false,
  },
  {
    title: "Mottram Hall",
    date: "June 2025",
    label: "Past Event",
    description: "Write-up, results and photos coming soon.",
    href: "/events/mottram-hall-june-2025",
    featured: false,
  },
  {
    title: "Tarporley",
    date: "April 2025",
    label: "Past Event",
    description: "Write-up, results and photos coming soon.",
    href: "/events/tarporley-april-2025",
    featured: false,
  },
];

export default function EventsPage() {
  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <PageHeader
        eyebrow="Swift Tees"
        title="Weekend Hub"
        subtitle="Past weekends, future trips and the questionable history of Swift Tees."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Link
            key={`${event.title}-${event.date}`}
            href={event.href}
            className={`rounded-3xl border p-5 shadow-sm transition active:scale-[0.98] ${
              event.featured
                ? "border-green-900 bg-green-950 text-white md:col-span-2"
                : "border-slate-200 bg-white text-slate-900 hover:border-green-700 hover:shadow-md"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={`mb-2 text-xs font-black uppercase tracking-[0.2em] ${
                    event.featured ? "text-green-100" : "text-green-700"
                  }`}
                >
                  {event.label}
                </p>

                <h2
                  className={`text-2xl font-black tracking-tight ${
                    event.featured ? "text-white" : "text-green-950"
                  }`}
                >
                  {event.title}
                </h2>

                <p
                  className={`mt-1 text-sm font-bold ${
                    event.featured ? "text-green-100" : "text-slate-600"
                  }`}
                >
                  {event.date}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  event.featured
                    ? "bg-white text-green-950"
                    : "bg-green-100 text-green-800"
                }`}
              >
                →
              </span>
            </div>

            <p
              className={`mt-4 text-sm leading-6 ${
                event.featured ? "text-green-100" : "text-slate-600"
              }`}
            >
              {event.description}
            </p>

            <p
              className={`mt-5 rounded-2xl px-4 py-3 text-center text-sm font-black ${
                event.featured
                  ? "bg-white text-green-950"
                  : "bg-green-700 text-white"
              }`}
            >
              Open weekend
            </p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}