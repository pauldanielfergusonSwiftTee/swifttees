import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";

const events = [
  {
    title: "Carden Park",
    date: "July 2026",
    label: "Next Event",
    description:
      "Cheshire Course, Nicklaus Course, live scoring and the full Swift Tees Match Centre.",
    href: "/events/carden-park-2026",
    image: "/carden-park.jpg",
    featured: true,
  },
  {
    title: "Mottram Hall",
    label: "March 2026",
    href: "/events/mottram-hall-march-2026",
    image: "/images/mottram-march-2026/photo-1.png",
    featured: false,
  },
  {
    title: "Shrigley Hall",
    label: "September 2025",
    href: "/events/shrigley-hall-september-2025",
    image: "/images/shrigley-25/shrigley-bg.jpg",
    featured: false,
  },
  {
    title: "Mottram Hall",
    label: "June 2025",
    href: "/events/mottram-hall-june-2025",
    image: "/images/mottram-25/mottram-25-bg.JPG",
    featured: false,
  },
  {
    title: "Tarporley",
    label: "April 2025",
    href: "/events/tarporley-april-2025",
    image: "/images/portal-25/portal-25-bg.jpg",
    featured: false,
  },
];

export default function EventsPage() {
  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <PageHeader
        eyebrow="Swift Tees"
        title="Past Events"
        subtitle="Upcoming trips, past weekends and the photographic evidence."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Link
            key={`${event.title}-${event.date}`}
            href={event.href}
            className={`group relative overflow-hidden rounded-3xl shadow-sm transition active:scale-[0.99] ${
              event.featured
                ? "min-h-[300px] md:col-span-2 md:min-h-[380px]"
                : "min-h-[230px]"
            }`}
          >
            {event.image ? (
              <Image
                src={event.image}
                alt={`${event.title} ${event.date}`}
                fill
                priority={event.featured}
                sizes={
                  event.featured
                    ? "(max-width: 768px) 100vw, 1024px"
                    : "(max-width: 768px) 100vw, 512px"
                }
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-950 to-slate-950" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide backdrop-blur ${
                  event.featured
                    ? "bg-green-400 text-green-950"
                    : "bg-white/90 text-green-950"
                }`}
              >
                {event.label}
              </span>

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-black text-green-950 shadow-sm">
                →
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-green-300">
                {event.date}
              </p>

              <h2
                className={`mt-1 font-black tracking-tight ${
                  event.featured ? "text-4xl md:text-5xl" : "text-3xl"
                }`}
              >
                {event.title}
              </h2>

              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-white/85">
                {event.description}
              </p>

              <div className="mt-4 inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                {event.featured ? "Open event" : "View weekend"}
                <span className="ml-2 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}