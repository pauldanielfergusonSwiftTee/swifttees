"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [interestStats, setInterestStats] = useState({
  going: 0,
  maybe: 0,
  cant: 0,
});

useEffect(() => {
  async function loadInterestStats() {
    const { data } = await supabase
      .from("trip_interest")
      .select("status")
      .eq("trip_id", 1);

    if (!data) return;

    setInterestStats({
      going: data.filter((item) => item.status === "going").length,
      maybe: data.filter((item) => item.status === "maybe").length,
      cant: data.filter((item) => item.status === "cant_make_it").length,
    });
  }

  loadInterestStats();
}, []);
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
              Past Events
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

      <section className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-green-700 font-semibold mb-2">
          Est. 2025
        </p>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-green-950">
          Swift Tees Golf Society
        </h1>

        <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl">
          Questionable golf. Elite admin. Twelve lads chasing glory,
          dignity and at least one fairway.
        </p>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="relative h-56">
            <Image
              src="/carden-park.jpg"
              alt="Carden Park"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="inline-block bg-green-600 text-white text-sm font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                Next Event
              </p>

              <h2 className="text-4xl font-black">
                Carden Park Weekend
              </h2>

              <p className="text-lg font-semibold mt-2">
                26–27 July 2026
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-full bg-green-700 text-white py-3 text-center font-bold">
                ⏳ {daysToCarden} Days to Go
              </div>

              <a
                href="/events/carden-park-2026"
                className="rounded-full bg-green-900 text-white py-3 text-center font-bold"
              >
                📅 Full Details
              </a>

              <a
                href="/leaderboard"
                className="rounded-full border border-green-900 text-green-900 py-3 text-center font-bold"
              >
                🏆 Live Leaderboard
              </a>
            </div>
          </div>
        </div>

        <a
          href="/register-interest"
          className="block rounded-3xl bg-green-950 text-white p-6 border border-green-900 shadow-sm mb-8 hover:bg-green-900"
        >
          <p className="inline-block bg-white text-green-950 text-sm font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Register Interest
          </p>

          <h2 className="text-3xl font-black mb-2">
            September 2026 Trip
          </h2>

          <p className="text-green-100 mb-5">
            Location and dates to be announced.
            Add your name so we know who is interested.
          </p>
<div className="flex flex-wrap gap-2 mb-5">
  <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold">
    ✅ {interestStats.going} Going
  </span>
  <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold">
    🤔 {interestStats.maybe} Maybe
  </span>
  <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold">
    ❌ {interestStats.cant} Can't
  </span>
</div>
          <span className="inline-block rounded-full bg-white text-green-950 px-5 py-3 font-bold">
            📝 Register Interest
          </span>
        </a>

        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/players"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">👥</p>
            <h3 className="text-xl font-bold">The Players</h3>
            <p className="text-green-200 text-sm">
              The full Swift Tees squad.
            </p>
          </a>

          <a
            href="/events"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">📅</p>
            <h3 className="text-xl font-bold">Past Events</h3>
            <p className="text-green-200 text-sm">
              Previous trips, write-ups, photos and results.
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