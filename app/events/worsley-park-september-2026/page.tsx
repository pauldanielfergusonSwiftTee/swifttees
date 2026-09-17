"use client";

import PageContainer from "@/components/PageContainer";

const teams = [
  {
    name: "Whites",
    icon: "⚪",
    header: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-950",
    badge: "bg-slate-200 text-slate-700",
    players: [
      { name: "Chris Mc", handicap: 20, captain: true },
      { name: "John W", handicap: 24 },
      { name: "Adam", handicap: 28 },
    ],
  },
  {
    name: "Blues",
    icon: "🔵",
    header: "bg-blue-600",
    border: "border-blue-300",
    text: "text-white",
    badge: "bg-blue-100 text-blue-800",
    players: [
      { name: "Carl", handicap: 28, captain: true },
      { name: "Paul", handicap: 20 },
      { name: "Stu", handicap: 24 },
    ],
  },
  {
    name: "Greens",
    icon: "🟢",
    header: "bg-green-700",
    border: "border-green-300",
    text: "text-white",
    badge: "bg-green-100 text-green-800",
    players: [
      { name: "Ian", handicap: 24, captain: true },
      { name: "Liam", handicap: 20 },
      { name: "Calp", handicap: 28 },
    ],
  },
];

export default function WorsleyParkEventPage() {
  return (
    <PageContainer className="md:px-8">
      <div className="mx-auto max-w-6xl pb-6">

        {/* HERO */}
        <section className="mt-3 mb-3 overflow-hidden rounded-[26px] bg-green-950 shadow-lg">
          <div className="relative h-[300px] overflow-hidden md:h-[360px]">
            <img
              src="/images/worsley-park/worsleymain.png"
              alt="Worsley Park"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-transparent to-black/20" />

            <div className="absolute left-4 right-4 top-4 flex items-center justify-between md:left-6 md:right-6 md:top-6">
              <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                ⛳ Swift Tees
              </span>

              <span className="rounded-full bg-green-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-green-950">
                Next Trip
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">
                Manchester · September 2026
              </p>

              <h1 className="mt-1 text-4xl font-black leading-none tracking-tight md:text-6xl">
                Worsley <span className="text-green-300">Park</span>
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-white/85 md:text-sm">
                <span>📅 27–28 September</span>
                <span>👥 9 Players</span>
                <span>⛳ 2 Rounds</span>
                <span>🏨 1 Night · DBB</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK WEEKEND STRIP */}
        <section className="mb-3 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-4">
          <div className="border-b border-r border-slate-100 p-3 md:border-b-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Sunday
            </p>
            <p className="mt-0.5 text-lg font-black text-green-950">13:00</p>
            <p className="text-[11px] font-bold text-slate-600">Team Scramble</p>
          </div>

          <div className="border-b border-slate-100 p-3 md:border-b-0 md:border-r">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Check In
            </p>
            <p className="mt-0.5 text-lg font-black text-green-950">15:00</p>
            <p className="text-[11px] font-bold text-slate-600">Sunday</p>
          </div>

          <div className="border-r border-slate-100 p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Check Out
            </p>
            <p className="mt-0.5 text-lg font-black text-green-950">12:00</p>
            <p className="text-[11px] font-bold text-slate-600">Monday</p>
          </div>

          <div className="p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Monday
            </p>
            <p className="mt-0.5 text-lg font-black text-green-950">12:15</p>
            <p className="text-[11px] font-bold text-slate-600">
              Individual Stableford
            </p>
          </div>
        </section>

        {/* TEAMS */}
        <section className="mb-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-end justify-between bg-green-950 px-4 py-3 text-white md:px-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-300">
                🏆 The Draw Is In
              </p>
              <h2 className="text-xl font-black tracking-tight">
                Worsley Teams
              </h2>
            </div>

            <p className="text-[10px] font-bold text-white/50">
              Playing HCP
            </p>
          </div>

          <div className="grid gap-2 p-3 md:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.name}
                className={`overflow-hidden rounded-2xl border ${team.border}`}
              >
                <div
                  className={`flex items-center justify-between px-3 py-2 ${team.header} ${team.text}`}
                >
                  <h3 className="text-base font-black">
                    {team.icon} {team.name}
                  </h3>

                  <span className="text-[9px] font-black uppercase tracking-wide opacity-70">
                    Team
                  </span>
                </div>

                <div className="divide-y divide-slate-100 px-3">
                  {team.players.map((player) => (
                    <div
                      key={player.name}
                      className="flex h-10 items-center justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-black text-slate-900">
                          {player.name}
                        </p>

                        {player.captain && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-700">
                            👑 Captain
                          </span>
                        )}
                      </div>

                      <span
                        className={`ml-2 rounded-full px-2 py-1 text-[11px] font-black ${team.badge}`}
                      >
                        {player.handicap}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WEEKEND FORMAT + RULES */}
        <section className="mb-3 grid gap-3 lg:grid-cols-2">

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-green-700">
                  Competition
                </p>
                <h2 className="text-xl font-black text-green-950">
                  Weekend Format
                </h2>
              </div>

              <span className="text-3xl">🏆</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-green-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-wide text-green-700">
                  Sunday
                </p>
                <p className="mt-1 text-sm font-black text-green-950">
                  Team Scramble
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-600">
                  Stableford points count towards the weekend standings.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-wide text-blue-700">
                  Monday
                </p>
                <p className="mt-1 text-sm font-black text-green-950">
                  Individual Stableford
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-600">
                  Everyone plays their own ball in the final round.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-xl bg-green-950 px-3 py-2.5 text-white">
              <p className="text-xs font-black">
                Two days. One overall leaderboard.
              </p>
              <p className="mt-0.5 text-[10px] text-white/60">
                Points across both rounds combine. Every point matters.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-green-700">
                  Important Stuff
                </p>
                <h2 className="text-xl font-black text-green-950">
                  Weekend Rules
                </h2>
              </div>

              <span className="text-3xl">📋</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="text-xl">✍️</span>
                <div>
                  <p className="text-sm font-black text-green-950">
                    Mark Your Ball
                  </p>
                  <p className="text-[11px] leading-4 text-slate-600">
                    All balls must be clearly marked.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3">
                <span className="text-xl">🚫</span>
                <div>
                  <p className="text-sm font-black text-green-950">
                    No Gimmies
                  </p>
                  <p className="text-[11px] leading-4 text-slate-600">
                    Every putt must be holed. No generous three-footers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COURSE + HOTEL */}
        <section className="mb-3 grid gap-3 lg:grid-cols-2">

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-green-700">
                    ⛳ The Course
                  </p>
                  <h2 className="mt-0.5 text-xl font-black text-green-950">
                    Worsley Park Golf Course
                  </h2>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-black text-green-800">
                  Par 71
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Both rounds played at Worsley Park across the two-day weekend.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-green-950 p-3 text-white">
                  <p className="text-[9px] font-black uppercase tracking-wide text-green-300">
                    Sunday
                  </p>
                  <p className="mt-0.5 text-xl font-black">13:00</p>
                </div>

                <div className="rounded-xl bg-green-950 p-3 text-white">
                  <p className="text-[9px] font-black uppercase tracking-wide text-green-300">
                    Monday
                  </p>
                  <p className="mt-0.5 text-xl font-black">12:15</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-green-700">
                    🏨 Staying At
                  </p>
                  <h2 className="mt-0.5 text-xl font-black leading-tight text-green-950">
                    Delta Hotels Worsley Park
                  </h2>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-black text-green-800">
                  DBB
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                Worsley Park, Worsley, Manchester, M28 2QT
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[8px] font-black uppercase text-slate-400">
                    Check In
                  </p>
                  <p className="mt-0.5 text-sm font-black text-green-950">
                    Sun 15:00
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[8px] font-black uppercase text-slate-400">
                    Check Out
                  </p>
                  <p className="mt-0.5 text-sm font-black text-green-950">
                    Mon 12:00
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[8px] font-black uppercase text-slate-400">
                    Rooms
                  </p>
                  <p className="mt-0.5 text-sm font-black text-green-950">
                    7 Rooms
                  </p>
                </div>
              </div>

              <a
                href="https://www.marriott.com/en-gb/hotels/manwp-delta-hotels-worsley-park-country-club/overview/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 block rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-center text-xs font-black text-green-800 transition hover:bg-green-100"
              >
                Hotel Website ↗
              </a>
            </div>
          </div>
        </section>

        {/* LIVE ACTION */}
        <section className="overflow-hidden rounded-[24px] bg-green-950 p-4 text-white shadow-lg md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-green-300">
                Follow The Action
              </p>

              <h2 className="text-xl font-black">
                Live This Weekend
              </h2>

              <p className="mt-1 text-xs text-white/55">
                Scores, Stableford points and leaderboard movement.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:w-[430px]">
              <a
                href="/live-centre"
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-green-950 transition hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-green-700">
                    Live
                  </p>
                  <p className="text-sm font-black">
                    🏆 Leaderboard
                  </p>
                </div>

                <span>→</span>
              </a>

              <a
                href="/live-scoring-v2"
                className="flex items-center justify-between rounded-xl bg-green-400 px-4 py-3 text-green-950 transition hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-green-950/50">
                    Enter
                  </p>
                  <p className="text-sm font-black">
                    📝 Scores
                  </p>
                </div>

                <span>→</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </PageContainer>
  );
}