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
            <a href="/players" className="hover:text-green-700">Players</a>
            <a href="/events" className="hover:text-green-700">Past Events</a>
            <a href="/gallery" className="hover:text-green-700">Gallery</a>
            <a href="/leaderboard" className="hover:text-green-700">Society Leaderboard</a>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-green-700 font-semibold mb-2">Est. 2025</p>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-green-950">
          Swift Tees Golf Society
        </h1>

        <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl">
          Questionable golf. Elite admin. One bunch of mates chasing glory,
          dignity and at least one fairway.
        </p>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden mb-8 p-4 md:p-5">
          <div className="relative h-80 md:h-[430px] rounded-2xl overflow-hidden">
            <Image
              src="/carden-park.jpg"
              alt="Carden Park"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-950/45 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="inline-block bg-green-600 text-white text-sm font-black uppercase tracking-wider px-4 py-2 rounded-xl mb-4">
                Next Event
              </p>

              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Carden Park Weekend
              </h2>

              <p className="text-xl md:text-2xl font-semibold mt-3">
                26–27 July 2026
              </p>

              <div className="mt-4 flex items-center gap-3 text-green-300">
  <span className="text-2xl">⏳</span>

  <span className="text-3xl md:text-4xl font-black">
    {daysToCarden}
  </span>

  <span className="text-lg md:text-xl font-bold uppercase">
    Days To Go
  </span>
</div>
            </div>
          </div>

          <div className="pt-6 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
              <a
                href="/events/carden-park-2026"
                className="rounded-2xl bg-white px-6 py-5 text-center font-black text-green-950 border border-slate-200 shadow-sm text-lg md:text-xl hover:border-green-700"
              >
                📋 Weekend Details
              </a>
 <a
                href="/events/carden-park-2026/live-leaderboard"
                className="rounded-2xl bg-white px-6 py-5 text-center font-black text-green-950 border border-slate-200 shadow-sm text-lg md:text-xl hover:border-green-700"
              >
                🏆 Live Leaderboard
              </a>
<a
  href="/weekend-bingo"
  className="rounded-2xl bg-white px-6 py-5 text-center font-black text-green-950 border border-slate-200 shadow-sm text-lg md:text-xl hover:border-green-700"
>
  🎯 Carden Park Bingo
</a>
             
            </div>
          </div>
        </div>

        <a
          href="/register-interest"
          className="block rounded-3xl bg-green-950 text-white p-6 md:p-8 border border-green-900 shadow-sm mb-8 hover:bg-green-900"
        >
          <p className="inline-block bg-white text-green-950 text-sm font-black uppercase tracking-wider px-3 py-1 rounded-full mb-5">
            Upcoming Event. 
          </p>

          <div className="grid md:grid-cols-[1.5fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-3">
                September 2026 Trip
              </h2>

              <p className="text-green-100 mb-6 text-lg">
                Location and dates to be announced.
                Add your name and get involved.
              </p>

              <span className="inline-block rounded-full bg-white text-green-950 px-6 py-3 font-bold">
                📝 Register Interest
              </span>
            </div>





           <div className="grid grid-cols-3 gap-3 md:gap-4">
  <div className="rounded-2xl bg-white/10 p-4 md:p-5 text-center">
    <p className="text-3xl md:text-5xl font-black">
      {interestStats.going}
    </p>

    <div className="flex flex-col items-center mt-2">
      <span className="text-xl md:text-2xl">✅</span>
      <span className="text-sm md:text-xl font-bold text-green-100">
        Going
      </span>
    </div>
  </div>

  <div className="rounded-2xl bg-white/10 p-4 md:p-5 text-center">
    <p className="text-3xl md:text-5xl font-black">
      {interestStats.maybe}
    </p>

    <div className="flex flex-col items-center mt-2">
      <span className="text-xl md:text-2xl">🤔</span>
      <span className="text-sm md:text-xl font-bold text-green-100">
        Maybe
      </span>
    </div>
  </div>

  <div className="rounded-2xl bg-white/10 p-4 md:p-5 text-center">
    <p className="text-3xl md:text-5xl font-black">
      {interestStats.cant}
    </p>

    <div className="flex flex-col items-center mt-2">
      <span className="text-xl md:text-2xl">❌</span>
      <span className="text-sm md:text-xl font-bold text-green-100">
        Can't
      </span>
    </div>
  </div>
</div>
          
          
          
          
          
          
          
          </div>
        </a>

        <div className="grid md:grid-cols-3 gap-4">
          <a href="/players" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white">
            <p className="text-3xl mb-2">👥</p>
            <h3 className="text-xl font-bold">The Players</h3>
            <p className="text-green-200 text-sm">The full Swift Tees squad.</p>
          </a>

          <a href="/events" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white">
            <p className="text-3xl mb-2">📅</p>
            <h3 className="text-xl font-bold">Past Events</h3>
            <p className="text-green-200 text-sm">Previous trips, write-ups, photos and results.</p>
          </a>

          <a href="/gallery" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white">
            <p className="text-3xl mb-2">📸</p>
            <h3 className="text-xl font-bold">Gallery</h3>
            <p className="text-green-200 text-sm">Photos, memories and evidence.</p>
          </a>

          <a href="/leaderboard" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white">
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="text-xl font-bold">Society Leaderboard</h3>
            <p className="text-green-200 text-sm">Scores, bragging rights and pain.</p>
          </a>

          <a href="/hall-of-fame" className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white">
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="text-xl font-bold">Hall of Fame</h3>
            <p className="text-green-200 text-sm">Legends, records and questionable achievements.</p>
          </a>

        
        </div>
      </section>
    </main>
  );
}