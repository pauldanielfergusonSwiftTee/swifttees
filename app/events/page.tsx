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
    <main className="min-h-screen bg-slate-100 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <h1 className="text-5xl md:text-6xl font-black mt-6 mb-2 text-green-950">
          All Events
        </h1>

        <p className="text-slate-600 mb-10">
          Past weekends, future trips and the questionable history of Swift Tees.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <a
              key={`${event.title}-${event.date}`}
              href={event.href}
              className={`rounded-3xl p-6 border shadow-sm transition ${
                event.featured
                  ? "bg-green-950 text-white border-green-900 hover:bg-green-900 md:col-span-2"
                  : "bg-white text-slate-900 border-slate-200 hover:border-green-700"
              }`}
            >
              <p
                className={`font-bold text-sm mb-2 ${
                  event.featured ? "text-white" : "text-green-700"
                }`}
              >
                {event.label}
              </p>

              <h2
                className={`text-3xl font-black mb-2 ${
                  event.featured ? "text-white" : "text-green-950"
                }`}
              >
                {event.title}
              </h2>

              <p
                className={`font-bold mb-4 ${
                  event.featured ? "text-green-100" : "text-slate-600"
                }`}
              >
                {event.date}
              </p>

              <p
                className={`text-sm leading-6 ${
                  event.featured ? "text-green-100" : "text-slate-600"
                }`}
              >
                {event.description}
              </p>

              <p
                className={`mt-5 text-sm font-bold ${
                  event.featured ? "text-white" : "text-green-700"
                }`}
              >
                View event →
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}