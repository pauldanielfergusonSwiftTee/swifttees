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

  const [selectedImage, setSelectedImage] = useState<string | null>(
    null
  );

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
        cant: data.filter(
          (item) => item.status === "cant_make_it"
        ).length,
      });
    }

    loadInterestStats();
  }, []);

  useEffect(() => {
    function updateCountdown() {
      const firstTeeTime = new Date(
        "2026-07-26T13:10:00+01:00"
      ).getTime();

      const now = new Date().getTime();
      const difference = Math.max(0, firstTeeTime - now);

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
      );

      const mins = Math.floor(
        (difference % (1000 * 60 * 60)) /
          (1000 * 60)
      );

      const secs = Math.floor(
        (difference % (1000 * 60)) / 1000
      );

      setCountdown({
        days,
        hours,
        mins,
        secs,
      });
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const momentImages = [
    "/images/mainpage/main1.JPG",
    "/images/mainpage/main2.jpeg",
    "/images/mainpage/main3.jpeg",
    "/images/mainpage/main4.jpeg",
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* MAIN HERO */}
      <section className="relative min-h-[680px] overflow-hidden rounded-b-[2rem] md:min-h-[760px]">
        <Image
          src="/carden-park.jpg"
          alt="Carden Park"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-green-950/55 to-black/35" />

        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-6xl flex-col px-5 py-6 md:min-h-[760px] md:px-8">
          <div className="flex items-center justify-between">
            <Image
              src="/swiftteeslogo.png"
              alt="Swift Tees logo"
              width={100}
              height={50}
              priority
            />
          </div>

          <div className="mt-auto pb-8 text-white">
            <h1 className="mb-4 text-5xl font-black leading-none tracking-tight md:text-8xl">
              Swift Tees
            </h1>

            <p className="mb-8 mt-4 max-w-2xl text-2xl font-black leading-tight text-white drop-shadow-md md:text-4xl">
              Questionable golf. Elite admin. A bunch of mates
              chasing glory, bragging rights and unforgettable
              stories
            </p>

            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs font-black uppercase tracking-wider">
              🟢 Next Event
            </p>

            <div className="mb-5 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur md:p-6">
              <p className="text-sm font-black uppercase tracking-wider text-green-300">
                Stu&apos;s Big 50th Weekend
              </p>

              <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-black md:text-5xl">
                    26–27 July 2026
                  </h2>

                  <p className="mt-1 font-bold text-green-100">
                    First tee: Cheshire Course · 13:10
                  </p>
                </div>

                <div className="grid min-w-[280px] grid-cols-4 gap-2">
                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl font-black text-green-300 md:text-4xl">
                      {countdown.days}
                    </p>

                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Days
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl font-black text-green-300 md:text-4xl">
                      {countdown.hours}
                    </p>

                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Hrs
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl font-black text-green-300 md:text-4xl">
                      {countdown.mins}
                    </p>

                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Mins
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-center">
                    <p className="text-3xl font-black text-green-300 md:text-4xl">
                      {countdown.secs}
                    </p>

                    <p className="text-[11px] font-bold uppercase text-green-100">
                      Secs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href="/events/carden-park-2026"
                className="rounded-2xl bg-white px-5 py-4 text-center text-lg font-black text-green-950 shadow-sm hover:bg-green-50"
              >
                📋 Weekend Details
              </a>

              <a
                href="/live-centre"
                className="rounded-2xl bg-white px-5 py-4 text-center text-lg font-black text-green-950 shadow-sm hover:bg-green-50"
              >
                🏆 Match Hub
              </a>

              <a
                href="/live-scoring-v2"
                className="rounded-2xl bg-green-500 px-5 py-4 text-center text-lg font-black text-white shadow-sm hover:bg-green-400"
              >
                ⛳ Update Scorecards
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        {/* SEPTEMBER TRIP */}
        <a
          href="/register-interest"
          className="group relative mb-8 block overflow-hidden rounded-3xl border border-green-900 bg-green-950 p-6 text-white shadow-sm md:p-8"
        >
          <Image
            src="/images/mainpage/main3.jpeg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-950/90 to-green-950/65" />

          <div className="relative z-10">
            <p className="mb-5 inline-block rounded-full bg-white px-3 py-1 text-sm font-black uppercase tracking-wider text-green-950">
              Upcoming Event
            </p>

            <div className="grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
              <div>
                <h2 className="mb-3 text-3xl font-black md:text-5xl">
                  September 2026 Trip
                </h2>

                <p className="mb-6 text-lg text-green-100">
                  Location and dates to be announced. Add your name
                  and get involved.
                </p>

                <span className="inline-block rounded-full bg-white px-6 py-3 font-bold text-green-950">
                  📝 Register Interest
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center backdrop-blur-sm md:p-5">
                  <p className="text-3xl font-black md:text-5xl">
                    {interestStats.going}
                  </p>

                  <div className="mt-2 flex flex-col items-center">
                    <span className="text-xl md:text-2xl">✅</span>

                    <span className="text-sm font-bold text-green-100 md:text-xl">
                      Going
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center backdrop-blur-sm md:p-5">
                  <p className="text-3xl font-black md:text-5xl">
                    {interestStats.maybe}
                  </p>

                  <div className="mt-2 flex flex-col items-center">
                    <span className="text-xl md:text-2xl">🤔</span>

                    <span className="text-sm font-bold text-green-100 md:text-xl">
                      Maybe
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center backdrop-blur-sm md:p-5">
                  <p className="text-3xl font-black md:text-5xl">
                    {interestStats.cant}
                  </p>

                  <div className="mt-2 flex flex-col items-center">
                    <span className="text-xl md:text-2xl">❌</span>

                    <span className="text-sm font-bold text-green-100 md:text-xl">
                      Can&apos;t
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>

        {/* MOMENTS */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4" />

          <div className="flex gap-4 overflow-x-auto pb-2">
            {momentImages.map((src, index) => (
              <button
                type="button"
                key={`${src}-${index}`}
                onClick={() => setSelectedImage(src)}
                aria-label={`Open Swift Tees moment ${index + 1}`}
                className="relative h-44 min-w-[260px] shrink-0 cursor-zoom-in overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-sm"
              >
                <Image
                  src={src}
                  alt={`Swift Tees moment ${index + 1}`}
                  fill
                  sizes="260px"
                  className="object-cover transition duration-300 hover:scale-[1.03]"
                />
              </button>
            ))}
          </div>
        </section>

        {/* ORIGINAL SMALL TILES */}
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/events"
            className="rounded-2xl border border-green-800 bg-green-900 p-6 text-white hover:bg-green-800"
          >
            <p className="mb-2 text-3xl">📅</p>

            <h3 className="text-xl font-bold">Past Events</h3>

            <p className="text-sm text-green-200">
              Previous trips, write-ups, photos and results.
            </p>
          </a>

          <a
            href="/overall-leaderboard"
            className="rounded-2xl border border-green-800 bg-green-900 p-6 text-white hover:bg-green-800"
          >
            <p className="mb-2 text-3xl">🏆</p>

            <h3 className="text-xl font-bold">
              Overall Leaderboard
            </h3>

            <p className="text-sm text-green-200">
              Scores, bragging rights and pain.
            </p>
          </a>

          <a
            href="/hall-of-fame"
            className="rounded-2xl border border-green-800 bg-green-900 p-6 text-white hover:bg-green-800"
          >
            <p className="mb-2 text-3xl">🏆</p>

            <h3 className="text-xl font-bold">Hall of Fame</h3>

            <p className="text-sm text-green-200">
              Legends, records and questionable achievements.
            </p>
          </a>
        </div>

        <div className="h-40 md:hidden" />
      </section>

      {/* IMAGE POP-OUT */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Swift Tees moment"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative h-[85vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Expanded Swift Tees moment"
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image"
              className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/65 text-3xl font-light leading-none text-white shadow-lg backdrop-blur transition hover:bg-white hover:text-black"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </main>
  );
}