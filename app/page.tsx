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

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
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

  useEffect(() => {
    function updateCountdown() {
      const firstTeeTime = new Date("2026-07-26T13:10:00+01:00").getTime();
      const now = new Date().getTime();
      const difference = Math.max(0, firstTeeTime - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const mins = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const secs = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, mins, secs });
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="relative min-h-[680px] md:min-h-[760px] overflow-hidden rounded-b-[2rem]">
        <Image
          src="/carden-park.jpg"
          alt="Carden Park"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-green-950/55 to-black/35" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-6 min-h-[680px] md:min-h-[760px] flex flex-col">
          <div className="flex items-center justify-between">
            <Image
              src="/swiftteeslogo.png"
              alt="Swift Tees logo"
              width={100}
              height={50}
              priority
            />

            <a
              href="/events"
              className="rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/25"
            >
              Past Events
            </a>
          </div>

          <div className="mt-auto pb-8 text-white">
            <p className="inline-block rounded-full bg-green-500 px-4 py-2 text-xs font-black uppercase tracking-wider mb-4">
              Next Swift Tees Event
            </p>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none mb-4">
              Swift Tees
            </h1>

            <p className="text-xl md:text-3xl font-bold text-green-100 max-w-3xl mb-6">
              Questionable golf. Elite admin. One bunch of mates chasing glory,
              bragging rights and hopefully a fairway.
            </p>

            <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur p-4 md:p-6 mb-5">
              <p className="text-green-300 text-sm font-black uppercase tracking-wider">
                Carden Park Weekend
              </p>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-2">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black">
                    26–27 July 2026
                  </h2>

                  <p className="text-green-100 font-bold mt-1">
                    First tee: Cheshire Course · 13:10
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 min-w-[280px]">
                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl md:text-4xl font-black text-green-300">
                      {countdown.days}
                    </p>
                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Days
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl md:text-4xl font-black text-green-300">
                      {countdown.hours}
                    </p>
                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Hrs
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl md:text-4xl font-black text-green-300">
                      {countdown.mins}
                    </p>
                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Mins
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl md:text-4xl font-black text-green-300">
                      {countdown.secs}
                    </p>
                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Secs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="/events/carden-park-2026"
                className="rounded-2xl bg-white px-5 py-4 text-center font-black text-green-950 shadow-sm text-lg hover:bg-green-50"
              >
                📋 Weekend Details
              </a>

              <a
                href="/events/carden-park-2026/live-leaderboard"
                className="rounded-2xl bg-white px-5 py-4 text-center font-black text-green-950 shadow-sm text-lg hover:bg-green-50"
              >
                🏆 Live Leaderboard
              </a>

              <a
                href="/events/carden-park-2026/live-leaderboard/live-scoring"
                className="rounded-2xl bg-green-500 px-5 py-4 text-center font-black text-white shadow-sm text-lg hover:bg-green-400"
              >
                ⛳ Update Scorecards
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <a
          href="/register-interest"
          className="block rounded-3xl bg-green-950 text-white p-6 md:p-8 border border-green-900 shadow-sm mb-8 hover:bg-green-900"
        >
          <p className="inline-block bg-white text-green-950 text-sm font-black uppercase tracking-wider px-3 py-1 rounded-full mb-5">
            Upcoming Event
          </p>

          <div className="grid md:grid-cols-[1.5fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-3">
                September 2026 Trip
              </h2>

              <p className="text-green-100 mb-6 text-lg">
                Location and dates to be announced. Add your name and get
                involved.
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

        <section className="mb-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              "/carden-park.jpg",
              "/carden-park.jpg",
              "/carden-park.jpg",
              "/carden-park.jpg",
            ].map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative h-44 min-w-[260px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <Image
                  src={src}
                  alt="Swift Tees moment"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-4">
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
            href="/leaderboard"
            className="rounded-2xl bg-green-900 p-6 border border-green-800 hover:bg-green-800 text-white"
          >
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="text-xl font-bold">Society Leaderboard</h3>
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
        </div>
      </section>
    </main>
  );
}