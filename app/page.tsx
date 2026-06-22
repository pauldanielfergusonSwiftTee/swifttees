import Image from "next/image";

export default function Home() {
  const daysToCarden = Math.ceil(
    (new Date("2026-07-26").getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-end md:justify-between items-center">
          <Image
            className="hidden md:block"
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

      <section className="max-w-6xl mx-auto px-6 py-10 md:py-12">
        <p className="text-green-700 font-semibold mb-2">Est. 2025</p>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-green-950">
          Swift Tees Golf Society
        </h1>

        <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl">
          Questionable golf. Elite admin. Twelve lads chasing glory, dignity,
          and at least one fairway.
        </p>

        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-lg">
          <Image
            src="/carden-park.jpg"
            alt="Carden Park"
            fill
            className="object-cover"
          />
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="relative h-44 md:h-56">
            <Image
              src="/carden-park.jpg"
              alt="Carden Park golf course"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-green-200 font-semibold mb-1">Next Event</p>
              <h2 className="text-3xl md:text-4xl font-black">
                Carden Park Weekend
              </h2>
            </div>
          </div>

          <div className="p-6 md:p-8">
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

          <a
            href="https://www.instagram.com/swiftteesgolf"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-white p-6 border border-slate-200 hover:border-green-700 text-slate-900 md:col-span-3"
          >
            <p className="text-3xl mb-2">📲</p>
            <h3 className="text-xl font-bold text-green-950">
              Follow Swift Tees on Instagram
            </h3>
            <p className="text-slate-600 text-sm">
              Player spotlights, trip build-up, questionable predictions and
              evidence for the group chat.
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}