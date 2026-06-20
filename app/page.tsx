import Image from "next/image";

export default function Home() {
  const daysToCarden = Math.ceil(
    (new Date("2026-07-26").getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-green-800/20 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Image
            src="/swiftteeslogo.png"
            alt="Swift Tees logo"
            width={160}
            height={80}
            priority
          />

          <div className="hidden md:flex gap-6 text-sm font-medium text-green-950">
            <a href="/players">Players</a>
            <a href="/events">Events</a>
            <a href="/gallery">Gallery</a>
            <a href="/leaderboard">Leaderboard</a>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-sm">
          <Image
            src="/carden-park.jpg"
            alt="Carden Park"
            fill
            className="object-cover"
            priority
          />
        </div>

        <p className="text-green-700 font-bold mb-4">
          Private Golf Society
        </p>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 text-green-950">
          Swift Tees
        </h1>

        <p className="text-2xl md:text-3xl text-slate-700 mb-10 max-w-3xl">
          Questionable golf. Elite admin. Twelve lads chasing glory, dignity,
          and at least one fairway.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <p className="text-4xl font-black text-green-950">12</p>
            <p className="text-slate-600">Golfers</p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <p className="text-4xl font-black text-green-950">4</p>
            <p className="text-slate-600">Weekends Last Year</p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            <p className="text-4xl font-black text-green-950">∞</p>
            <p className="text-slate-600">Lost Balls</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm mb-8">
          <p className="text-green-700 font-bold mb-2">
            The Next Swift Tees Trip
          </p>

          <h2 className="text-4xl font-black mb-3 text-green-950">
            Carden Park Weekend
          </h2>

          <p className="text-slate-700 mb-6">
            {daysToCarden} days until Carden Park • Scores, photos, write-ups
            and inevitable controversy.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/events"
              className="rounded-full bg-green-950 text-white px-5 py-3 font-bold"
            >
              View Event
            </a>

            <a
              href="/leaderboard"
              className="rounded-full border border-green-950 text-green-950 px-5 py-3 font-bold"
            >
              Live Leaderboard
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/players"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-green-700"
          >
            <p className="text-3xl mb-2">👥</p>
            <h3 className="text-xl font-bold text-green-950">Players</h3>
            <p className="text-slate-600 text-sm">The full Swift Tees squad.</p>
          </a>

          <a
            href="/events"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-green-700"
          >
            <p className="text-3xl mb-2">📅</p>
            <h3 className="text-xl font-bold text-green-950">Events</h3>
            <p className="text-slate-600 text-sm">
              Past weekends and the next trip.
            </p>
          </a>

          <a
            href="/gallery"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-green-700"
          >
            <p className="text-3xl mb-2">📸</p>
            <h3 className="text-xl font-bold text-green-950">Gallery</h3>
            <p className="text-slate-600 text-sm">
              Photos, memories and evidence.
            </p>
          </a>

          <a
            href="/leaderboard"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-green-700"
          >
            <p className="text-3xl mb-2">📈</p>
            <h3 className="text-xl font-bold text-green-950">Leaderboard</h3>
            <p className="text-slate-600 text-sm">
              Scores, bragging rights and pain.
            </p>
          </a>

          <a
            href="/hall-of-fame"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-green-700"
          >
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="text-xl font-bold text-green-950">Hall of Fame</h3>
            <p className="text-slate-600 text-sm">
              Legends, records and questionable achievements.
            </p>
          </a>

          <a
            href="/weekend-bingo"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-green-700"
          >
            <p className="text-3xl mb-2">🎯</p>
            <h3 className="text-xl font-bold text-green-950">Weekend Bingo</h3>
            <p className="text-slate-600 text-sm">
              No names needed. Everyone knows.
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}