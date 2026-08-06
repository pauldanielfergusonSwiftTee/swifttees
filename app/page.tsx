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
        cant: data.filter(
          (item) => item.status === "cant_make_it"
        ).length,
      });
    }

    loadInterestStats();
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f1eb] text-slate-900">
      {/* ======================================================
          HERO - LATEST SWIFT TEES WEEKEND
      ====================================================== */}
      <section className="relative min-h-[690px] overflow-hidden rounded-b-[2rem] md:min-h-[780px]">
        <Image
          src="/carden-park.jpg"
          alt="Carden Park"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/60 to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[690px] max-w-6xl flex-col px-5 py-6 md:min-h-[780px] md:px-8">
          {/* LOGO */}
          <div className="flex items-center justify-between">
            <Image
              src="/swiftteeslogo.png"
              alt="Swift Tees logo"
              width={100}
              height={50}
              priority
            />

           
          </div>

          {/* HERO CONTENT */}
          <div className="mt-auto pb-8 text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
              ⛳ Latest Weekend
            </div>

            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-lime-300 md:text-sm">
              Carden Park • 26–27 July 2026
            </p>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-tight md:text-7xl lg:text-8xl">
              Another Classic
              <span className="block text-lime-300">
                in the Books.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-100 md:text-2xl">
              Great golf. Questionable golf. Eagles, comebacks,
              dodgy steaks and enough stories to last until the
              next trip.
            </p>

            {/* QUICK WEEKEND STATS */}
            <div className="mt-7 flex flex-wrap gap-2">
              <HeroStat value="12" label="Golfers" />
              <HeroStat value="2" label="Days" />
              <HeroStat value="36" label="Holes" />
              <HeroStat value="∞" label="Stories" />
            </div>

            {/* MAIN CTA */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a
                href="/events/carden-park-2026/weekend-review"
                className="group rounded-2xl bg-lime-300 px-5 py-4 text-center text-lg font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-lime-200"
              >
                <span className="block">
                  📖 Weekend Review
                </span>

                <span className="mt-1 block text-xs font-semibold text-slate-700">
                  Stories, winners & photos
                </span>
              </a>

              <a
                href="/full-scorecard"
                className="rounded-2xl border border-white/20 bg-white px-5 py-4 text-center text-lg font-black text-green-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-50"
              >
                <span className="block">
                  📊 Full Scorecards
                </span>

                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  See how everyone did
                </span>
              </a>

              <a
                href="/events"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center text-lg font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                <span className="block">
                  🗓️ All Events
                </span>

                <span className="mt-1 block text-xs font-semibold text-slate-200">
                  Previous Swift Tees trips
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        {/* ======================================================
            CARDEN PARK STORY TEASER
        ====================================================== */}
        <section className="mb-10">
          <div className="grid overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-lg md:grid-cols-[1.1fr_.9fr]">
            <div className="p-7 md:p-10 lg:p-12">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
                Carden Park 2026
              </p>

              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                The scores are in.
                <span className="block text-lime-300">
                  The stories are better.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
                White Team took the honours, Paul overturned an
                eight-point deficit, Ian and Painy gave us
                &quot;Eagle Baby&quot;, and Taz walked away with
                Player&apos;s Player.
              </p>

              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                And that&apos;s before we get to the 310-yard drive,
                Liam&apos;s evolving relationship with beer,
                Adam&apos;s steak-related medical emergency and the
                environmental incident involving Wrighty and Phil.
              </p>

              <a
                href="/events/carden-park-2026/weekend-review"
                className="mt-7 inline-flex items-center rounded-full bg-lime-300 px-6 py-3 font-black text-slate-950 transition hover:bg-lime-200"
              >
                Read the full weekend review →
              </a>
            </div>

            <div className="relative min-h-[340px] md:min-h-full">
              <Image
                src="/images/carden-park-2026/winnerswhites.jpg"
                alt="White Team - Carden Park 2026 champions"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/75 via-transparent to-transparent md:bg-gradient-to-r md:from-[#07111f]/50 md:to-transparent" />

              <div className="absolute bottom-5 left-5">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow">
                  🏆 White Team Champions
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            CARDEN PARK MOMENTS
        ====================================================== */}
        <section className="mb-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                From The Weekend
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Carden Park in pictures
              </h2>

              <p className="mt-2 max-w-2xl text-slate-600">
                A few moments from two days of golf, questionable
                decisions and another memorable Swift Tees weekend.
              </p>
            </div>

            <a
              href="/events/carden-park-2026/weekend-review"
              className="hidden shrink-0 text-sm font-black text-green-800 transition hover:text-green-600 sm:block"
            >
              Full review →
            </a>
          </div>

          <a
            href="/events/carden-park-2026/weekend-review"
            className="group block"
          >
            <div className="grid gap-3 md:grid-cols-[1.35fr_.65fr]">
              {/* LARGE IMAGE */}
              <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-slate-200 md:min-h-[520px]">
                <Image
                  src="/images/carden-park-2026/outsidelaugh.jpg"
                  alt="Swift Tees at Carden Park"
                  fill
                  sizes="(max-width: 768px) 100vw, 65vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-300">
                    Carden Park 2026
                  </p>

                  <p className="mt-2 max-w-xl text-2xl font-black leading-tight text-white md:text-4xl">
                    The golf mattered.
                    <span className="block text-lime-300">
                      The weekend mattered more.
                    </span>
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                <div className="relative min-h-[210px] overflow-hidden rounded-[1.7rem] bg-slate-200 md:min-h-0">
                  <Image
                    src="/images/carden-park-2026/carts.jpeg"
                    alt="Golf carts at Carden Park"
                    fill
                    sizes="(max-width: 768px) 50vw, 35vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <p className="absolute bottom-4 left-4 text-sm font-black text-white">
                    Two days. Two courses.
                  </p>
                </div>

                <div className="relative min-h-[210px] overflow-hidden rounded-[1.7rem] bg-slate-200 md:min-h-0">
                  <Image
                    src="/images/carden-park-2026/beersoutside.jpg"
                    alt="Post-round drinks at Carden Park"
                    fill
                    sizes="(max-width: 768px) 50vw, 35vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                  <p className="absolute bottom-4 left-4 text-sm font-black text-white">
                    Plenty to discuss afterwards.
                  </p>
                </div>
              </div>
            </div>
          </a>

          <div className="mt-4 sm:hidden">
            <a
              href="/events/carden-park-2026/weekend-review"
              className="flex w-full items-center justify-center rounded-2xl bg-green-900 px-5 py-4 font-black text-white"
            >
              Read the Carden Park review →
            </a>
          </div>
        </section>

        {/* ======================================================
            NEXT TRIP
        ====================================================== */}
        <section className="mb-10">
          <a
            href="/register-interest"
            className="group relative block overflow-hidden rounded-[2rem] bg-green-950 text-white shadow-lg"
          >
            <Image
              src="/images/mainpage/main5.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-950/95 to-green-950/65" />

            <div className="relative z-10 p-7 md:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-950">
                  Next Up
                </span>

                <span className="text-xs font-black uppercase tracking-[0.18em] text-green-200">
                  September 2026
                </span>
              </div>

              <div className="grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
                <div>
                  <h2 className="text-4xl font-black leading-tight md:text-5xl">
                    Where are we going next?
                  </h2>

                  <p className="mt-4 max-w-xl text-lg leading-7 text-green-100">
                    The next Swift Tees trip is taking shape.
                    Location and dates are still to be confirmed,
                    but you can register your interest now.
                  </p>

                  <span className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-black text-green-950 transition group-hover:bg-lime-300">
                    📝 Register Interest
                  </span>
                </div>

                <div>
                  <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.18em] text-green-200">
                    Current interest
                  </p>

                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <InterestStat
                      value={interestStats.going}
                      icon="✅"
                      label="Going"
                    />

                    <InterestStat
                      value={interestStats.maybe}
                      icon="🤔"
                      label="Maybe"
                    />

                    <InterestStat
                      value={interestStats.cant}
                      icon="❌"
                      label="Can't"
                    />
                  </div>
                </div>
              </div>
            </div>
          </a>
        </section>

        {/* ======================================================
            SWIFT TEES HUB
        ====================================================== */}
        <section className="mb-10">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              Swift Tees
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              The clubhouse
            </h2>

            <p className="mt-2 max-w-2xl text-slate-600">
              Results, history and the increasingly questionable
              Swift Tees record books.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/events"
              className="group rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                📅
              </div>

              <h3 className="mt-5 text-xl font-black">
                Past Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Trips, weekend reviews, photos, winners and
                everything we can still remember.
              </p>

              <p className="mt-5 text-sm font-black text-green-800">
                Browse events →
              </p>
            </a>

            <a
              href="/overall-leaderboard"
              className="group rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                🏆
              </div>

              <h3 className="mt-5 text-xl font-black">
                Overall Leaderboard
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Season standings, bragging rights and the evidence
                nobody can argue with.
              </p>

              <p className="mt-5 text-sm font-black text-green-800">
                View standings →
              </p>
            </a>

            <a
              href="/hall-of-fame"
              className="group rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                👑
              </div>

              <h3 className="mt-5 text-xl font-black">
                Hall of Fame
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Champions, records, legends and achievements of
                varying credibility.
              </p>

              <p className="mt-5 text-sm font-black text-green-800">
                Enter the Hall →
              </p>
            </a>
          </div>
        </section>

        {/* ======================================================
            CLOSING STRIP
        ====================================================== */}
        <section className="overflow-hidden rounded-[2rem] bg-[#07111f] px-6 py-10 text-center text-white md:px-10 md:py-14">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-300">
            Swift Tees
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            Questionable golf.
            <br />
            <span className="text-lime-300">
              Elite memories.
            </span>
          </p>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            One society. Plenty of trips. Far too much evidence.
          </p>
        </section>

        {/* MOBILE BOTTOM NAV SPACE */}
        <div className="h-40 md:hidden" />
      </div>
    </main>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-full border border-white/15 bg-black/25 px-4 py-2 backdrop-blur-sm">
      <span className="font-black text-lime-300">
        {value}
      </span>

      <span className="ml-2 text-xs font-bold uppercase tracking-wider text-white/80">
        {label}
      </span>
    </div>
  );
}

function InterestStat({
  value,
  icon,
  label,
}: {
  value: number;
  icon: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center backdrop-blur-sm md:p-4">
      <p className="text-3xl font-black md:text-4xl">
        {value}
      </p>

      <div className="mt-2 flex flex-col items-center">
        <span className="text-lg md:text-xl">
          {icon}
        </span>

        <span className="mt-1 text-[11px] font-bold text-green-100 md:text-sm">
          {label}
        </span>
      </div>
    </div>
  );
}