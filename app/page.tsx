import Image from "next/image";

export default function Home() {
  const daysToCarden = Math.ceil(
    (new Date("2026-07-26").getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Image
            src="/swiftteeslogo.png"
            alt="Swift Tees logo"
            width={100}
            height={50}
            priority
          />

          <div className="hidden md:flex gap-6 text-sm">
            <a href="/players" className="hover:text-green-700">
              Players
            </a>
            <a href="/events" className="hover:text-green-700">
              Events
            </a>
            <a href="/gallery" className="hover:text-green-700">
              Gallery
            </a>
            <a href="/leaderboard" className="hover:text-green-700">
              Leaderboard
            </a>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-12">
        

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-green-950">
          Swift Tees Golf Society
        </h1>

        <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl">
          Questionable golf. Elite admin. Twelve lads chasing glory,
          dignity, and at least one fairway.
        </p>

        <div className="relative h-80 rounded-3xl overflow-hidden mb-8 shadow-lg">
          <Image
            src="/carden-park.jpg"
            alt="Carden Park"
            fill
            className="object-cover"
          />
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-green-900 to-green-800 p-8 border border-green-700 text-white mb-8">
          <p className="text-green-300 font-semibold mb-2">
            Next Event
          </p>

          <h2 className="text-4xl font-black mb-3">
            Carden Park Weekend
          </h2>

          <p className="text-green-100 mb-6">
            {daysToCarden} days until Carden Park • Scores, photos,
            write-ups and inevitable controversy.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/events"
              className="rounded-full bg-white text-green-950 px-5 py-3 font-bold"
            >
              View Event
            </a>

            <a
              href="/leaderboard"
              className="rounded-full border border-green-300 px-5 py-3 font-bold"
            >
              Live Leaderboard
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/players"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">👥</p>
            <h3 className="text-xl font-bold">Players</h3>
            <p className="text-green-200 text-sm">
              The full Swift Tees squad.
            </p>
          </a>

          <a
            href="/events"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">📅</p>
            <h3 className="text-xl font-bold">Events</h3>
            <p className="text-green-200 text-sm">
              Past weekends and the next trip.
            </p>
          </a>

          <a
            href="/gallery"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">📸</p>
            <h3 className="text-xl font-bold">Gallery</h3>
            <p className="text-green-200 text-sm">
              Photos, memories and evidence.
            </p>
          </a>

          <a
            href="/leaderboard"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="text-xl font-bold">Leaderboard</h3>
            <p className="text-green-200 text-sm">
              Scores, bragging rights and pain.
            </p>
          </a>

          <a
            href="/hall-of-fame"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="text-xl font-bold">Hall of Fame</h3>
            <p className="text-green-200 text-sm">
              Legends, records and questionable achievements.
            </p>
          </a>

          <a
            href="/weekend-bingo"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">🎯</p>
            <h3 className="text-xl font-bold">Weekend Bingo</h3>
            <p className="text-green-200 text-sm">
              No names needed. Everyone knows.
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}