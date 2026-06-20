import Image from "next/image";

export default function Home() {
  const daysToCarden = Math.ceil(
  (new Date("2026-07-26").getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24)
);
  return (
    <main className="min-h-screen bg-green-950 text-white">
      <nav className="border-b border-green-800 bg-green-950/90">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Image
            src="/swiftteeslogo.png"
            alt="Swift Tees logo"
            width={180}
            height={90}
            priority
          />

          <div className="hidden md:flex gap-6 text-sm text-green-100">
            <a href="/players">Players</a>
            <a href="/events">Events</a>
            <a href="/gallery">Gallery</a>
            <a href="/leaderboard">Leaderboard</a>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative h-100 rounded-3xl overflow-hidden mb-10">
  <Image
    src="/carden-park.jpg"
    alt="Carden Park"
    fill
    className="object-cover"
  />

  <div className="absolute inset-0 bg-black/40" />
</div>
        <p className="text-green-300 font-semibold mb-4">
          Private Golf Society
        </p>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
          Swift Tees
        </h1>

        <p className="text-2xl md:text-3xl text-green-100 mb-10 max-w-3xl">
          Questionable golf. Elite admin. Twelve lads chasing glory, dignity,
          and at least one fairway.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl bg-green-900 p-6 border border-green-800">
            <p className="text-4xl font-black">12</p>
            <p className="text-green-200">Golfers</p>
          </div>

          <div className="rounded-2xl bg-green-900 p-6 border border-green-800">
            <p className="text-4xl font-black">4</p>
            <p className="text-green-200">Weekends Last Year</p>
          </div>

          <div className="rounded-2xl bg-green-900 p-6 border border-green-800">
            <p className="text-4xl font-black">∞</p>
            <p className="text-green-200">Lost Balls</p>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-green-900 to-green-800 p-8 border border-green-700">
          <p className="text-green-300 font-semibold mb-2">Next Event</p>

          <h2 className="text-4xl font-black mb-3">Carden Park Weekend</h2>

          <p className="text-green-100 mb-6">
  {daysToCarden} days until Carden Park • Scores, photos, write-ups and inevitable controversy.
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
                <div className="grid md:grid-cols-3 gap-4 mt-8">
          <a href="/players" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800">
            <p className="text-3xl mb-2">👥</p>
            <h3 className="text-xl font-bold">Players</h3>
            <p className="text-green-200 text-sm">The full Swift Tees squad.</p>
          </a>

          <a href="/events" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800">
            <p className="text-3xl mb-2">📅</p>
            <h3 className="text-xl font-bold">Events</h3>
            <p className="text-green-200 text-sm">Past weekends and the next trip.</p>
          </a>

          <a href="/gallery" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800">
            <p className="text-3xl mb-2">📸</p>
            <h3 className="text-xl font-bold">Gallery</h3>
            <p className="text-green-200 text-sm">Photos, memories and evidence.</p>
          </a>

          <a href="/leaderboard" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800">
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="text-xl font-bold">Leaderboard</h3>
            <p className="text-green-200 text-sm">Scores, bragging rights and pain.</p>
          </a>
          <a
  href="/hall-of-fame"
  className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800"
>
  <p className="text-3xl mb-2">🏆</p>
  <h3 className="text-xl font-bold">Hall of Fame</h3>
  <p className="text-green-200 text-sm">
    Legends, records and questionable achievements.
  </p>
</a>

<a
  href="/weekend-bingo"
  className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800"
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