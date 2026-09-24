"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Worsley Park weekend starts Sunday 27 September 2026
    const targetDate = new Date(
      "2026-09-27T13:00:00+01:00"
    ).getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      setHasStarted(difference <= 0);
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

      <section aria-labelledby="next-trip-title" className="relative isolate overflow-hidden bg-[#092e24] text-[#faf7ed]">
        <Image
          src="/images/worsley-park/worsleymain.png"
          alt="Worsley Park Marriott Hotel & Country Club"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#052e16]/95 via-[#052e16]/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-5 pb-7 pt-6 sm:px-8 sm:pb-10">
          <div className="flex items-center justify-between gap-4">
            <Image src="/swiftteeslogo.png" alt="Swift Tees" width={100} height={50} priority className="h-auto w-24" />
            <span className="rounded-full border border-green-300/40 bg-green-800/85 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm sm:text-xs">
              Up Next...
            </span>
          </div>

          <div className="pb-7 pt-12 sm:pb-9 sm:pt-20 lg:pt-24">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-300">Manchester · 27–28 September 2026</p>
            <div className="mt-4 grid items-end gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
              <h1 id="next-trip-title" className="text-[clamp(3.5rem,9vw,7.5rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Worsley <span className="block text-green-300">Park.</span>
              </h1>
              <div className="max-w-sm lg:pb-2">
                <p className="text-xl font-semibold leading-snug sm:text-2xl">Two rounds. One Weekend.<br />Who will top the Leaderboard?</p>
                <p className="mt-3 text-sm leading-6 text-white/70">The teams are drawn. The first tee is waiting.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-300/30 bg-green-950/70 px-3 py-6 shadow-lg sm:px-6 sm:py-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
                {hasStarted ? "Tournament now live" : "Until the first tee"}
              </h2>
              <p className="text-xs text-white/70">Sunday · 13:00 UK time</p>
            </div>
            {hasStarted ? (
              <div className="py-3">
                <p className="text-3xl font-black tracking-tight text-green-300 sm:text-5xl">
                  🟢 TOURNAMENT NOW LIVE
                </p>
                <p className="mt-2 text-sm font-semibold text-white/75 sm:text-base">
                  Follow the action on Swift Tees
                </p>
              </div>
            ) : (
              <div role="timer" aria-label="Time until the first tee" className="grid grid-cols-4 divide-x divide-white/20">
                <CountdownNumber value={countdown?.days} label="Days" />
                <CountdownNumber value={countdown?.hours} label="Hours" />
                <CountdownNumber value={countdown?.minutes} label="Minutes" />
                <CountdownNumber value={countdown?.seconds} label="Seconds" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/75">36 holes <span className="mx-2 text-white/35">/</span> 3 teams <span className="mx-2 text-white/35">/</span> 1 weekend</p>
            <a href="/events/worsley-park-september-2026" className="inline-flex items-center justify-between gap-10 rounded-xl bg-green-400 px-6 py-4 font-bold text-[#092e24] transition hover:bg-green-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Weekend details <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
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
                and the environmental incidents involving Wrighty
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
                  🏆 THe Champions
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
                questionable golf and another memorable
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
                      The Weekend mattered more.
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
            {[
              {
                title: "Past Events",
                description: "Trips, weekend reviews, photos, winners and everything we can still remember.",
                action: "Browse events",
                href: "/events",
                image: "/images/carden-park-2026/grouplandscape.jpg",
                theme: "bg-[#073e2e] text-white border-green-800 hover:border-green-400",
                accent: "text-green-300",
                icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2M7 14h3m4 0h3m-10 4h3",
              },
              {
                title: "Overall Leaderboard",
                description: "Season standings, bragging rights and the evidence nobody can argue with.",
                action: "View standings",
                href: "/overall-leaderboard",
                image: "/images/carden-park-2026/bunker.jpg",
                theme: "bg-green-950 text-white border-green-800 hover:border-green-400",
                accent: "text-green-300",
                icon: "M8 21V11h8v10M2 21V15h6m8-7h6v13M1 21h22M10 5l2-3 2 3",
              },
              {
                title: "Hall of Fame",
                description: "Champions, records, legends and achievements of varying credibility.",
                action: "See the Winners",
                href: "/hall-of-fame",
                image: "/images/carden-park-2026/winnerswhites.jpg",
                theme: "bg-[#112820] text-white border-green-900 hover:border-green-400",
                accent: "text-[#e5ce90]",
                icon: "M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8m-6-2h4",
              },
            ].map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={`group relative isolate flex min-h-[400px] flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-sm transition duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700 motion-safe:hover:-translate-y-1 motion-reduce:transition-none lg:p-8 ${item.theme}`}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-top transition-transform duration-700 motion-safe:group-hover:scale-105 motion-reduce:transition-none"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#052e16] via-[#052e16]/65 to-black/10" />
                <div className="relative flex items-center justify-between">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-9 w-9 ${item.accent}`}>
                    <path d={item.icon} />
                  </svg>
                  <span aria-hidden="true" className="font-mono text-xs tracking-widest opacity-50">0{index + 1}</span>
                </div>
                <h3 className="relative mt-28 text-2xl font-black leading-tight tracking-tight">{item.title}</h3>
                <p className="relative mb-7 mt-3 max-w-sm text-sm leading-6 opacity-80">{item.description}</p>
                <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-current/15 pt-5">
                  <span className={`text-sm font-bold ${item.accent}`}>{item.action}</span>
                  <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-current/25 transition duration-300 group-hover:bg-white/15 motion-safe:group-hover:rotate-[-45deg] motion-reduce:transition-none">→</span>
                </div>
              </a>
            ))}
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

function CountdownNumber({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="min-w-0 px-1 text-center sm:px-4">
      <span className="block text-[clamp(2.5rem,8vw,6rem)] font-black leading-none tracking-[-0.06em] tabular-nums text-[#faf7ed]">
        {value === undefined ? "—" : String(value).padStart(2, "0")}
      </span>
      <span className="mt-3 block text-[9px] font-bold uppercase tracking-[0.12em] text-green-300 sm:text-xs sm:tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}