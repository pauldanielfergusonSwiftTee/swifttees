"use client";

import PageContainer from "@/components/PageContainer";

export default function WorsleyParkEventPage() {
  return (
    <PageContainer className="md:px-8">
      <div className="mx-auto max-w-6xl pb-8">

        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="mt-4 mb-4 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <div className="relative min-h-[500px] overflow-hidden rounded-[25px] md:min-h-[570px]">

            <img
              src="/images/worsley-park/worsleymain.png"
              alt="Worsley Park"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-950/60 to-green-950/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-transparent to-black/20" />

            {/* top labels */}
            <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3 md:left-8 md:right-8 md:top-8">
              <span className="rounded-full border border-white/30 bg-green-950/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md">
                ⛳ Swift Tees
              </span>

              <span className="rounded-full bg-green-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-lg">
                Next Trip
              </span>
            </div>

            {/* main hero content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-8">

              <p className="text-xs font-black uppercase tracking-[0.22em] text-green-300">
                Manchester · September 2026
              </p>

              <h1 className="mt-2 text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
                Worsley
                <span className="block text-green-300">
                  Park
                </span>
              </h1>

              <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-white/85 md:text-base">
                27 – 28 September 2026
              </p>

              <div className="mt-6 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">

                <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <p className="text-xl">👤</p>
                  <p className="mt-2 text-2xl font-black">9</p>
                  <p className="text-[10px] font-black uppercase tracking-wide text-white/70">
                    Players
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <p className="text-xl">⛳</p>
                  <p className="mt-2 text-2xl font-black">36</p>
                  <p className="text-[10px] font-black uppercase tracking-wide text-white/70">
                    Holes
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <p className="text-xl">📅</p>
                  <p className="mt-2 text-2xl font-black">2</p>
                  <p className="text-[10px] font-black uppercase tracking-wide text-white/70">
                    Days
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <p className="text-xl">🛏️</p>
                  <p className="mt-2 text-2xl font-black">1</p>
                  <p className="text-[10px] font-black uppercase tracking-wide text-white/70">
                    Night
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            EVENT SUMMARY
        ========================================================= */}

        <section className="mb-4 grid gap-3 md:grid-cols-3">

          {/* Sunday */}
          <div className="rounded-3xl border border-green-200 bg-green-950 p-5 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-green-300">
              Sunday 27 September
            </p>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-4xl font-black">
                  13:00
                </p>

                <p className="mt-1 text-lg font-black">
                  Round One
                </p>

                <p className="mt-1 text-sm text-white/65">
                  Team Scramble
                </p>
              </div>

              <span className="text-5xl">
                🤝
              </span>
            </div>
          </div>

          {/* hotel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-green-700">
              Staying At
            </p>

            <h2 className="mt-2 text-xl font-black leading-tight text-green-950">
              Delta Hotels by Marriott
            </h2>

            <p className="mt-1 text-sm font-bold text-slate-600">
              Worsley Park Country Club
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-green-800">
                🛏️ 1 Night
              </span>

              <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-green-800">
                🍽️ DBB
              </span>
            </div>
          </div>

          {/* Monday */}
          <div className="rounded-3xl border border-green-200 bg-green-950 p-5 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-green-300">
              Monday 28 September
            </p>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-4xl font-black">
                  12:15
                </p>

                <p className="mt-1 text-lg font-black">
                  Round Two
                </p>

                <p className="mt-1 text-sm text-white/65">
                  Individual Stableford
                </p>
              </div>

              <span className="text-5xl">
                🏌️
              </span>
            </div>
          </div>

        </section>

        {/* =========================================================
            KEY EVENT CARDS
        ========================================================= */}

        <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-xl text-white">
              🏆
            </span>

            <h3 className="mt-4 font-black text-green-950">
              The Competition
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Points from both days count towards one overall leaderboard.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-xl text-white">
              🎯
            </span>

            <h3 className="mt-4 font-black text-green-950">
              2 Rounds
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sunday scramble followed by Monday individual Stableford.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-xl text-white">
              👥
            </span>

            <h3 className="mt-4 font-black text-green-950">
              9 Players
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Nine golfers battling across two days at Worsley Park.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-xl text-white">
              🛏️
            </span>

            <h3 className="mt-4 font-black text-green-950">
              1 Night
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Dinner, bed and breakfast at the Worsley Park hotel.
            </p>
          </div>

        </section>

        {/* =========================================================
            COMPETITION FORMAT
        ========================================================= */}

        <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

          <p className="text-xs font-black uppercase tracking-[0.15em] text-green-700">
            Competition Format
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            How The Weekend Works
          </h2>

          <div className="mt-6 space-y-3">

            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-4">

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-950 text-2xl text-white">
                  🤝
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-green-700">
                    Sunday
                  </p>

                  <h3 className="mt-1 text-lg font-black text-green-950">
                    Team Scramble
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Players compete in the opening-day scramble format.
                    Stableford points earned from the round feed into the
                    overall weekend standings.
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-4">

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-2xl text-white">
                  🏌️
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                    Monday
                  </p>

                  <h3 className="mt-1 text-lg font-black text-green-950">
                    Individual Stableford
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Everyone plays their own ball in the final round.
                    Stableford scoring decides who makes the charge up
                    the leaderboard.
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-4">

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-2xl">
                  🏆
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                    Overall
                  </p>

                  <h3 className="mt-1 text-lg font-black text-green-950">
                    Two Days. One Leaderboard.
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Points earned across both rounds are combined into one
                    overall weekend leaderboard. Every point matters.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            WEEKEND RULES
        ========================================================= */}

        <section className="mb-4 rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm md:p-6">

          <p className="text-xs font-black uppercase tracking-[0.15em] text-green-700">
            Competition
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            Weekend Rules
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            The important stuff before anybody starts arguing on the first tee.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                ✍️
              </span>

              <h3 className="mt-4 text-lg font-black text-green-950">
                Mark Your Ball
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                All balls must be clearly marked so there is no confusion
                over whose ball is whose during either round.
              </p>
            </div>

            

            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                🚫
              </span>

              <p className="mt-4 text-xs font-black uppercase tracking-wide text-red-700">
                Putting
              </p>

              <h3 className="mt-1 text-lg font-black text-green-950">
                No Gimmies
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every putt must be holed. No gimmies. No arguments.
                No generous three-footers after six pints.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================
            TIMELINE + HOTEL
        ========================================================= */}

        <section className="mb-4 grid gap-4 lg:grid-cols-2">

          {/* Timeline */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <p className="text-xs font-black uppercase tracking-[0.15em] text-green-700">
              Trip Schedule
            </p>

            <h2 className="mt-1 text-2xl font-black text-green-950">
              Weekend Timeline
            </h2>

            <div className="mt-6">

              <div className="mb-5">
                <p className="text-sm font-black uppercase tracking-wide text-green-700">
                  Sunday 27 September
                </p>
              </div>

              <div className="ml-3 border-l-2 border-green-100 pl-6">

                <div className="relative pb-7">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-green-600 ring-4 ring-white" />

                  <div className="flex gap-4">
                    <p className="w-14 shrink-0 text-sm font-black text-green-950">
                      13:00
                    </p>

                    <div>
                      <p className="font-black text-green-950">
                        Round One
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Worsley Park Golf Course
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative pb-8">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white" />

                  <div className="flex gap-4">
                    <p className="w-14 shrink-0 text-sm font-black text-green-950">
                      15:00
                    </p>

                    <div>
                      <p className="font-black text-green-950">
                        Hotel Check-In
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        Delta Hotels by Marriott Worsley Park
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mb-5">
                <p className="text-sm font-black uppercase tracking-wide text-green-700">
                  Monday 28 September
                </p>
              </div>

              <div className="ml-3 border-l-2 border-green-100 pl-6">

                <div className="relative pb-7">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white" />

                  <div className="flex gap-4">
                    <p className="w-14 shrink-0 text-sm font-black text-green-950">
                      12:00
                    </p>

                    <div>
                      <p className="font-black text-green-950">
                        Hotel Check-Out
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Rooms checked out before the final round.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-green-600 ring-4 ring-white" />

                  <div className="flex gap-4">
                    <p className="w-14 shrink-0 text-sm font-black text-green-950">
                      12:15
                    </p>

                    <div>
                      <p className="font-black text-green-950">
                        Round Two
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Worsley Park Golf Course
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Hotel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <p className="text-xs font-black uppercase tracking-[0.15em] text-green-700">
              Staying At
            </p>

            <h2 className="mt-1 text-2xl font-black leading-tight text-green-950">
              Delta Hotels Worsley Park
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Worsley Park, Worsley, Manchester, M28 2QT.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-green-700">
                  Check In
                </p>

                <p className="mt-2 text-2xl font-black text-green-950">
                  15:00
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Sunday 27 September
                </p>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-green-700">
                  Check Out
                </p>

                <p className="mt-2 text-2xl font-black text-green-950">
                  12:00
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Monday 28 September
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Rooms
                </p>

                <p className="mt-2 font-black text-green-950">
                  2 Twin Rooms
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                  5 doubles for single occupancy
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Board Basis
                </p>

                <p className="mt-2 text-lg font-black leading-tight text-green-950">
                  Dinner, Bed & Breakfast
                </p>
              </div>

            </div>

            <a
              href="https://www.marriott.com/en-gb/hotels/manwp-delta-hotels-worsley-park-country-club/overview/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-2xl bg-green-950 px-5 py-4 text-center text-sm font-black text-white transition hover:bg-green-900"
            >
              View Hotel Website ↗
            </a>

          </div>

        </section>

        {/* =========================================================
            COURSE INFO
        ========================================================= */}

        <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-green-700">
                The Course
              </p>

              <h2 className="mt-1 text-3xl font-black text-green-950">
                Worsley Park Golf Course
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                A picturesque par-71 course set within the grounds of
                Worsley Park. Both rounds of the weekend will be played
                over the same course.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-800">
                  Par 71
                </span>

                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-800">
                  2 Rounds
                </span>

                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-800">
                  Manchester
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-green-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-green-300">
                Tee Times
              </p>

              <div className="mt-4 space-y-3">

                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/60">
                    Sunday
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    13:00
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/60">
                    Monday
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    12:15
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            TEAMS
        ========================================================= */}

        <section className="mb-4 rounded-3xl border border-dashed border-green-300 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm md:p-6">

          <div className="flex items-start gap-4">

            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-950 text-3xl text-white">
              👥
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-green-700">
                Coming Soon
              </p>

              <h2 className="mt-1 text-2xl font-black text-green-950">
                Teams & Groups
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Nine players are confirmed. Teams, groups and pairings
                will be added once the draw has been sorted.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================
            LIVE
        ========================================================= */}

        <section className="overflow-hidden rounded-3xl bg-green-950 p-5 text-white shadow-lg md:p-6">

          <div className="grid items-center gap-5 lg:grid-cols-[1fr_1.3fr]">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-green-300">
                Follow The Action
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Live This Weekend
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Live scores, Stableford points and leaderboard movement
                throughout both rounds.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <a
                href="/live-centre"
                className="group rounded-2xl bg-white p-5 text-green-950 transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">
                    🏆
                  </span>

                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-green-700">
                  Live
                </p>

                <p className="mt-1 text-lg font-black">
                  Leaderboard
                </p>
              </a>

              <a
                href="/live-scoring-v2"
                className="group rounded-2xl bg-green-500 p-5 text-white transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">
                    📝
                  </span>

                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-green-950/60">
                  Enter Scores
                </p>

                <p className="mt-1 text-lg font-black">
                  Live Scorecards
                </p>
              </a>

            </div>
          </div>
        </section>

      </div>
    </PageContainer>
  );
}