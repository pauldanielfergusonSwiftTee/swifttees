"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Worsley Park weekend starts Sunday 27 September 2026
    const targetDate = new Date(
      "2026-09-27T13:00:00+01:00"
    ).getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      setCountdown({
        days: Math.floor(
          difference / (1000 * 60 * 60 * 24)
        ),
        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),
        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),
        seconds: Math.floor(
          (difference / 1000) % 60
        ),
      });
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f1eb] text-slate-900">
      {/* ======================================================
          HERO - NEXT SWIFT TEES WEEKEND
      ====================================================== */}
      <section className="relative min-h-[720px] overflow-hidden rounded-b-[2rem] md:min-h-[820px]">
        <Image
          src="/images/worsley-park/worsleymain.png"
          alt="Worsley Park Marriott Hotel & Country Club"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* HERO OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/55 to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-6xl flex-col px-5 py-6 md:min-h-[820px] md:px-8">
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
              ⛳ Next Swift Tees Weekend
            </div>

            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-lime-300 md:text-sm">
              27–28 September 2026
            </p>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-tight md:text-7xl lg:text-8xl">
              Worsley
              <span className="block text-lime-300">
                Park.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-xl font-black leading-tight text-white md:text-3xl">
              Worsley Marriott Hotel &amp; Country Club
            </p>

            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-200 md:text-xl md:leading-8">
              The next Swift Tees weekend is booked. Two days
              away, another golf trip and plenty more stories
              waiting to be made.
            </p>

            {/* HERO DATE STATS */}
            <div className="mt-7 flex flex-wrap gap-2">
              <HeroStat value="27" label="Sunday" />
              <HeroStat value="28" label="Monday" />
              <HeroStat value="SEP" label="2026" />
            </div>

            {/* HERO CTA */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#worsley-details"
                className="rounded-2xl bg-lime-300 px-6 py-4 text-center text-lg font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-lime-200"
              >
                ⛳ Weekend Details ↓
              </a>

              <a
                href="/events"
                className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center text-lg font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                🗓️ Previous Trips
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        {/* ======================================================
            WORSLEY PARK - COMING UP
        ====================================================== */}
        <section
          id="worsley-details"
          className="mb-14 scroll-mt-6"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                Coming Up
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Worsley Park 2026
              </h2>

              <p className="mt-2 max-w-2xl text-slate-600">
                The next weekend is now officially in
                the diary.
              </p>
            </div>
          </div>

          <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 md:grid-cols-[1.1fr_.9fr]">
            {/* WORSLEY DETAILS */}
            <div className="p-7 md:p-10">
              <div className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-green-900">
                Next Weekend Away
              </div>

              <h3 className="mt-5 text-3xl font-black leading-tight tracking-tight md:text-4xl">
                Worsley Marriott Hotel
                <span className="block text-green-800">
                  &amp; Country Club
                </span>
              </h3>

              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                Sunday 27th September to Monday 28th September
                2026. The venue is sorted. The rest of the
                details will follow as the weekend takes shape.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <InfoCard
                  icon="📍"
                  label="Venue"
                  value="Worsley Park"
                />

                <InfoCard
                  icon="📅"
                  label="Dates"
                  value="27–28 September"
                />

                <InfoCard
                  icon="🏨"
                  label="Stay"
                  value="Marriott Hotel"
                />

                <InfoCard
                  icon="⛳"
                  label="Golf"
                  value="Details coming soon"
                />
              </div>

              <div className="mt-7 rounded-2xl bg-slate-100 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  More to come
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                  Tee times, formats, teams, rooms and the rest
                  of the weekend details will be added here once
                  confirmed.
                </p>
              </div>
            </div>

            {/* WORSLEY IMAGE */}
            <div className="relative min-h-[360px] md:min-h-full">
              <Image
                src="/images/worsley-park/worsleymain.png"
                alt="Worsley Park Marriott Hotel & Country Club"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* LIVE COUNTDOWN */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-lime-300 px-4 py-3 text-slate-950 shadow-lg md:px-5">
                  <span className="text-lg md:text-xl">
                    ⛳
                  </span>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-700 md:text-[10px]">
                      Worsley Park starts in
                    </p>

                    <div className="mt-1 flex items-baseline gap-2 md:gap-3">
                      <CountdownNumber
                        value={countdown.days}
                        label="days"
                      />

                      <span className="font-black text-slate-500">
                        •
                      </span>

                      <CountdownNumber
                        value={countdown.hours}
                        label="hrs"
                      />

                      <span className="font-black text-slate-500">
                        •
                      </span>

                      <CountdownNumber
                        value={countdown.minutes}
                        label="mins"
                      />

                      <span className="hidden font-black text-slate-500 sm:inline">
                        •
                      </span>

                      <div className="hidden sm:block">
                        <CountdownNumber
                          value={countdown.seconds}
                          label="secs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            LAST TIME OUT - CARDEN PARK
        ====================================================== */}
        <section className="mb-10">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              Last Time Out
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Carden Park 2026
            </h2>

            
          </div>

          <div className="grid overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-lg md:grid-cols-[1.1fr_.9fr]">
            <div className="p-7 md:p-10 lg:p-12">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
                Carden Park • 26–27 July 2026
              </p>

              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                Another Classic
                <span className="block text-lime-300">
                  in the Books.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
                White Team took the honours, Ian and Painy gave us
                &quot;Eagle Baby&quot;, and Taz walked away with
                Player&apos;s Player.
              </p>

              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                And that&apos;s before we get to the 309-yard
                longest drive, Liam&apos;s evolving relationship with
                beer, Adam&apos;s steak-related medical emergency
                and the environmental incident involving Wrighty
                and Phil.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/events/carden-park-2026/weekend-review"
                  className="inline-flex items-center rounded-full bg-lime-300 px-6 py-3 font-black text-slate-950 transition hover:bg-lime-200"
                >
                  📖 Full Weekend Review →
                </a>

                <a
                  href="/full-scorecard"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-6 py-3 font-black text-white transition hover:bg-white/20"
                >
                  📊 Scorecards
                </a>
              </div>

              {/* CARDEN QUICK STATS */}
              <div className="mt-8 flex flex-wrap gap-2">
                <DarkStat value="12" label="Golfers" />
                <DarkStat value="2" label="Days" />
                <DarkStat value="36" label="Holes" />
                <DarkStat value="∞" label="Stories" />
              </div>
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
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                From The Weekend
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Carden Park in pictures
              </h2>

              <p className="mt-2 max-w-2xl text-slate-600">
                A few moments from two days of golf,
                questionable decisions and another memorable
                Swift Tees weekend.
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

              {/* RIGHT IMAGES */}
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
            {/* PAST EVENTS */}
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

            {/* OVERALL LEADERBOARD */}
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
                Season standings, bragging rights and the
                evidence nobody can argue with.
              </p>

              <p className="mt-5 text-sm font-black text-green-800">
                View standings →
              </p>
            </a>

            {/* HALL OF FAME */}
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

function DarkStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
      <span className="font-black text-lime-300">
        {value}
      </span>

      <span className="ml-2 text-xs font-bold uppercase tracking-wider text-white/70">
        {label}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {icon}
        </span>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-500">
            {label}
          </p>

          <p className="mt-1 font-black text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CountdownNumber({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-black tabular-nums md:text-xl">
        {String(value).padStart(2, "0")}
      </span>

      <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </span>
    </div>
  );
}