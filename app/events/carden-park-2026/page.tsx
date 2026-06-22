export default function EventsPage() {
  const timeline = [
    {
      day: "Day 1",
      date: "Sunday 26 July 2026",
      items: [
        {
          time: "13:10",
          title: "Carden Park - Cheshire Course",
          detail: "First round of the trip. Buggy requested, paid locally.",
        },
        {
          time: "15:00",
          title: "Check-in",
          detail: "Carden Park Hotel, Golf Resort & Spa.",
        },
        {
          time: "Evening",
          title: "Dinner, drinks & excuses",
          detail: "Dinner, bed and breakfast plan included.",
        },
      ],
    },
    {
      day: "Day 2",
      date: "Monday 27 July 2026",
      items: [
        {
          time: "11:00",
          title: "Check-out",
          detail: "Carden Park Hotel, Golf Resort & Spa.",
        },
        {
          time: "12:25",
          title: "Carden Park - Nicklaus Course",
          detail: "Second round. Final scores, pressure and inevitable controversy.",
        },
      ],
    },
  ];

  const details = [
    { label: "Venue", value: "Carden Park Hotel, Golf Resort & Spa" },
    { label: "Location", value: "Broxton Road, Chester, CH3 9DQ" },
    { label: "Accommodation", value: "5 twin rooms + 2 double rooms for single occupancy" },
    { label: "Board", value: "Dinner, bed and breakfast" },
    { label: "Players", value: "12 adults" },
    { label: "Confirmation", value: "Confirmed by Poppy" },
  ];

  const formats = [
    "Day 1: Cheshire Course - format to be confirmed",
    "Day 2: Nicklaus Course - format to be confirmed",
    "Live leaderboard planned",
    "Nearest pin / longest drive to be added",
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <section className="mt-6 mb-10 rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-green-700 font-bold mb-2">Next Swift Tees Trip</p>

          <h1 className="text-5xl md:text-7xl font-black mb-4 text-green-950">
            Carden Park 2026
          </h1>

          <p className="text-xl text-slate-700 max-w-3xl">
            Two days, two courses, twelve golfers and absolutely no guarantee
            of sensible scoring, sensible drinking or sensible shot selection.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <p className="text-green-700 text-sm font-bold">Trip Dates</p>
            <p className="text-2xl font-black mt-2 text-green-950">26-27 July 2026</p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <p className="text-green-700 text-sm font-bold">Courses</p>
            <p className="text-2xl font-black mt-2 text-green-950">Cheshire + Nicklaus</p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <p className="text-green-700 text-sm font-bold">Players</p>
            <p className="text-2xl font-black mt-2 text-green-950">12 Adults</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-4xl font-black mb-6 text-green-950">Trip Timeline</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {timeline.map((day) => (
              <div
                key={day.day}
                className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm"
              >
                <p className="text-green-700 font-bold">{day.day}</p>
                <h3 className="text-2xl font-black mb-5 text-green-950">{day.date}</h3>

                <div className="space-y-4">
                  {day.items.map((item) => (
                    <div
                      key={`${item.time}-${item.title}`}
                      className="rounded-xl bg-slate-50 p-4 border border-slate-200"
                    >
                      <p className="text-green-700 text-sm font-bold">{item.time}</p>
                      <p className="text-xl font-bold text-slate-900">{item.title}</p>
                      <p className="text-slate-600 text-sm mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-black mb-5 text-green-950">Trip Details</h2>

            <div className="space-y-3">
              {details.map((detail) => (
                <div key={detail.label} className="border-b border-slate-200 pb-3">
                  <p className="text-green-700 text-sm font-bold">{detail.label}</p>
                  <p className="text-slate-700">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-black mb-5 text-green-950">Formats & Extras</h2>

            <div className="space-y-3">
              {formats.map((format) => (
                <div
                  key={format}
                  className="rounded-xl bg-slate-50 p-4 text-slate-700 border border-slate-200"
                >
                  {format}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-green-950 text-white p-8">
          <p className="font-bold text-sm mb-2 text-green-300">Coming Soon</p>
          <h2 className="text-4xl font-black mb-3">Live Leaderboard</h2>
          <p className="mb-6 text-green-100">
            Hole-by-hole scoring, Stableford points, movers, collapses and
            bragging rights will appear here once the scoring system is built.
          </p>

          <a
            href="/leaderboard"
            className="inline-block rounded-full bg-white text-green-950 px-5 py-3 font-bold"
          >
            View Leaderboard
          </a>
        </section>
      </div>
    </main>
  );
}