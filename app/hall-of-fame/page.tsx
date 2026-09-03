"use client";

import PageContainer from "@/components/PageContainer";

type StablefordRound = {
  name: string;
  points: number;
  event: string;
  course: string;
};

type AttendanceGroup = {
  trips: number;
  players: string[];
};

type ClosestPinWinner = {
  player: string;
  event: string;
};

/* ============================================================
   REAL SWIFT TEES RECORDS
   Updated to and including Carden Park 2026
============================================================ */

const attendanceGroups: AttendanceGroup[] = [
  {
    trips: 5,
    players: ["Paul"],
  },
  {
    trips: 4,
    players: [
      "Painy",
      "Ian",
      "Liam",
      "Gav",
      "Stu",
      "Wrighty",
      "John W",
    ],
  },
  {
    trips: 3,
    players: ["Chris Mc"],
  },
  {
    trips: 2,
    players: ["Dan", "Cal"],
  },
  {
    trips: 1,
    players: [
      "Phil",
      "Adam",
      "Taz",
      "Carl",
      "Chris W",
      "Alistair",
      "Rick",
    ],
  },
];

const closestToPinWinners: ClosestPinWinner[] = [
  {
    player: "Paul",
    event: "Tarporley 2025 - Day 1 ",
  },
  {
    player: "Wrighty",
    event: "Tarporley 2025 - Day 2 ",
  },
  {
    player: "Stu",
    event: "Carden Park 2026",
  },
  {
    player: "Adam",
    event: "Carden Park 2026",
  },
  {
    player: "Dan",
    event: "Carden Park 2026",
  },
  {
    player: "Liam",
    event: "Carden Park 2026",
  },
  {
    player: "Painy",
    event: "Carden Park 2026",
  },
  {
    player: "Gav",
    event: "Carden Park 2026",
  },
];

const longestDriveRecords = [
  {
    player: "Paul",
    wins: 3,
    events: [
      "Tarporley 2025",
      "Tarporley 2025",
      "Carden Park 2026",
    ],
  },
  {
    player: "Wrighty",
    wins: 1,
    events: ["Carden Park 2026"],
  },
];

const eventWins = [
  {
    player: "Paul",
    wins: 2,
    events: ["Tarporley 2025", "Carden Park 2026"],
  },
];

/* ============================================================
   CARDEN PARK STABLEFORD
============================================================ */

const bestStableford: StablefordRound[] = [
  {
    name: "Paul",
    points: 41,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Adam",
    points: 38,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Stu",
    points: 36,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Dan",
    points: 34,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Wrighty",
    points: 34,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Ian",
    points: 32,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Liam",
    points: 32,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Painy",
    points: 29,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Gav",
    points: 28,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Carl",
    points: 27,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Phil",
    points: 17,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
  {
    name: "Taz",
    points: 16,
    event: "Carden Park 2026",
    course: "Nicklaus",
  },
];

/* ============================================================
   PAGE
============================================================ */

export default function HallOfFamePage() {
  return (
    <PageContainer className="bg-[#f2f0e9] text-slate-900">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] bg-[#06140f] text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[45px] border-white/[0.025]" />

        <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full border-[35px] border-lime-300/[0.025]" />

        <div className="relative p-6 md:p-10">
          <a
            href="/"
            className="text-sm font-black text-lime-300 transition hover:text-lime-200"
          >
            ← Back to home
          </a>

          <div className="mt-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
              <span>🏛️</span>
              Swift Tees Record Book
            </div>

            <h1 className="mt-5 text-5xl font-black leading-[0.88] tracking-[-0.05em] md:text-8xl">
              Hall of
              <span className="block text-lime-300">
                Fame.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-slate-300 md:text-base">
              The records, winners and milestones that make up
              Swift Tees history.
            </p>
          </div>

          {/* SMALL HISTORY STRIP */}

          <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-300 text-lg text-green-950">
              👥
            </div>

            <div>
              <p className="text-sm font-black text-white">
                18 players across the weekends
              </p>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Up to and including Carden Park 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN RECORD HOLDERS
      ====================================================== */}

      <section className="mt-8">
        <SectionHeading
          eyebrow="The Record Holders"
          title="Names in the book."
          description="The records everyone else has to chase."
        />

        <div className="grid gap-3 md:grid-cols-3">
          {/* LONGEST DRIVE */}

          <div className="relative overflow-hidden rounded-[1.8rem] bg-[#071b13] p-5 text-white shadow-lg md:col-span-2">
            <div className="absolute -right-4 -top-10 text-[150px] opacity-[0.055]">
              🚀
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-lime-300 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-green-950">
                  Longest Drive
                </span>

                <span className="text-2xl">
                  🚀
                </span>
              </div>

              {/* PAUL */}

              <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-300">
                    All-time leader
                  </p>

                  <p className="mt-1 text-4xl font-black tracking-tight md:text-5xl">
                    Paul
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <RecordTag>
                      Tarporley 2025 - Day 1
                    </RecordTag>

                    <RecordTag>
                      Tarporley 2025 - Day 2
                    </RecordTag>

                    <RecordTag>
                      Carden Park 2026
                    </RecordTag>
                  </div>
                </div>

                <div className="self-end text-left sm:text-right">
                  <p className="text-7xl font-black leading-none text-lime-300">
                    3
                  </p>

                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-green-200">
                    Long Drive wins
                  </p>
                </div>
              </div>

              {/* WRIGHTY */}

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div>
                  <p className="font-black text-white">
                    Wrighty
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                    Carden Park 2026
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-lime-300">
                    1
                  </span>

                  <span className="ml-1 text-[8px] font-black uppercase tracking-wider text-green-200">
                    win
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* EVENT WINS */}

          <div className="relative overflow-hidden rounded-[1.8rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="absolute -right-3 -top-7 text-[120px] opacity-[0.045]">
              🏆
            </div>

            <div className="relative">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">
                Event Wins
              </span>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black text-green-950">
                    Paul
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Most event victories
                  </p>
                </div>

                <p className="text-6xl font-black leading-none text-green-900">
                  2
                </p>
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                {eventWins[0].events.map((event) => (
                  <div
                    key={event}
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs">
                      🏆
                    </span>

                    <span className="text-xs font-black text-slate-700">
                      {event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CLOSEST TO THE PIN
      ====================================================== */}

      <section className="mt-8">
        <div className="overflow-hidden rounded-[1.8rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  Precision Records
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950 md:text-4xl">
                  🎯 Closest to the Pin
                </h2>

                <p className="mt-2 max-w-lg text-xs font-semibold leading-5 text-slate-500">
                  Eight different winners so far. Nobody has managed
                  to become the first two-time champion.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {closestToPinWinners.map((winner, index) => (
              <div
                key={winner.player}
                className={`p-4 md:p-5 ${
                  index % 2 === 0
                    ? "border-r border-slate-100"
                    : ""
                } border-b border-slate-100 md:border-r md:[&:nth-child(4n)]:border-r-0`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-black text-green-950">
                      {winner.player}
                    </p>

                    <p className="mt-1 text-[10px] font-bold leading-4 text-slate-400">
                      {winner.event}
                    </p>
                  </div>

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs">
                    🎯
                  </span>
                </div>

                <p className="mt-3 text-[8px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  1 victory
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          ATTENDANCE
      ====================================================== */}

      <section className="mt-8">
        <SectionHeading
          eyebrow="The Roll Call"
          title="Trips attended."
          description="Every player, grouped by how many Swift Tees weekends they've joined."
        />

        <div className="space-y-2">
          {attendanceGroups.map((group) => (
            <AttendanceProgress
              key={group.trips}
              trips={group.trips}
              players={group.players}
              maxTrips={5}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 px-1">
          <span className="text-sm">
            👥
          </span>

          <p className="text-[10px] font-semibold text-slate-500">
            <strong className="font-black text-green-950">
              18 different players
            </strong>{" "}
            across five Swift Tees weekends up to and including Carden Park 2026.
          </p>
        </div>
      </section>

      {/* ======================================================
          STABLEFORD TOP 10
      ====================================================== */}

      <section className="mt-8">
        <SectionHeading
          eyebrow="Scoring Records"
          title="Top 10 Stableford Scores"
          description="The ten highest individual Stableford scores recorded in Swift Tees competition."
        />

        {/* RECORD */}

        <div className="mb-3 overflow-hidden rounded-[1.8rem] bg-[#07140f] p-5 text-white shadow-lg">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-lime-300">
                Current Record
              </p>

              <p className="mt-2 text-3xl font-black">
                Paul
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                Carden Park 2026 · Nicklaus
              </p>
            </div>

            <div className="text-right">
              <p className="text-6xl font-black leading-none text-lime-300">
                41
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-green-200">
                points
              </p>
            </div>
          </div>
        </div>

        <StablefordTopTen rows={bestStableford} />
      </section>

      {/* ======================================================
          CLOSING
      ====================================================== */}

      <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#06140f] px-6 py-10 text-center text-white shadow-lg">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border-[35px] border-white/[0.025]" />

        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-300">
            Swift Tees
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-[1.05] tracking-tight md:text-5xl">
            Records are there
            <span className="block text-lime-300">
              to be broken.
            </span>
          </p>

          <p className="mx-auto mt-3 max-w-md text-xs font-semibold leading-5 text-slate-400">
            Every trip adds another chapter.
          </p>
        </div>
      </section>

      {/* MOBILE NAV CLEARANCE */}

      <div className="h-52 md:hidden" />
    </PageContainer>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-3xl font-black tracking-[-0.03em] text-green-950">
        {title}
      </h2>

      <p className="mt-1 max-w-xl text-xs font-semibold leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   RECORD TAG
============================================================ */

function RecordTag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-1.5 text-[10px] font-black text-green-100">
      🏆 {children}
    </span>
  );
}

/* ============================================================
   ATTENDANCE PROGRESS
============================================================ */

function AttendanceProgress({
  trips,
  players,
  maxTrips,
}: {
  trips: number;
  players: string[];
  maxTrips: number;
}) {
  const percentage = (trips / maxTrips) * 100;

  return (
    <div className="overflow-hidden rounded-[1.4rem] bg-white shadow-sm ring-1 ring-slate-200">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* COUNT */}

          <div className="flex w-14 shrink-0 flex-col items-center">
            <span className="text-3xl font-black leading-none text-green-950">
              {trips}
            </span>

            <span className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
              {trips === 1 ? "trip" : "trips"}
            </span>
          </div>

          {/* CONTENT */}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black leading-6 text-green-950">
              {players.map((player, index) => (
                <span key={player}>
                  {player}

                  {index < players.length - 1 && (
                    <span className="mx-1.5 font-normal text-slate-300">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </p>

            {/* PROGRESS */}

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-900"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <div className="mt-1 flex justify-between">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Attendance
              </span>

              <span className="text-[9px] font-black text-green-800">
                {trips} / {maxTrips}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STABLEFORD
============================================================ */

function StablefordTopTen({
  rows,
}: {
  rows: StablefordRound[];
}) {
  const topTen = rows
    .filter((row) => row.points > 0)
    .slice()
    .sort(
      (a, b) =>
        b.points - a.points ||
        a.name.localeCompare(b.name)
    )
    .slice(0, 10);

  return (
    <div className="overflow-hidden rounded-[1.8rem] bg-white shadow-sm ring-1 ring-slate-200">
      <div className="grid grid-cols-[34px_1fr_auto] bg-[#07140f] px-4 py-2.5 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 md:grid-cols-[50px_1fr_220px_80px]">
        <div>#</div>

        <div>Player</div>

        <div className="hidden md:block">
          Round
        </div>

        <div className="text-right">
          Pts
        </div>
      </div>

      {topTen.map((round, index) => (
        <div
          key={`${round.name}-${round.event}-${round.course}-${index}`}
          className={`grid grid-cols-[34px_1fr_auto] items-center gap-2 border-b border-slate-100 px-4 py-2.5 last:border-b-0 md:grid-cols-[50px_1fr_220px_80px] ${
            index === 0
              ? "bg-lime-50"
              : index < 3
              ? "bg-[#fbfbf8]"
              : "bg-white"
          }`}
        >
          <div>
            <StablefordPosition position={index + 1} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-green-950">
              {round.name}
            </p>

            <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400 md:hidden">
              {round.event} · {round.course}
            </p>
          </div>

          <div className="hidden md:block">
            <p className="text-[11px] font-bold text-slate-600">
              {round.event}
            </p>

            <p className="text-[9px] font-semibold text-slate-400">
              {round.course}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`text-xl font-black ${
                index === 0
                  ? "text-green-950"
                  : "text-green-800"
              }`}
            >
              {round.points}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StablefordPosition({
  position,
}: {
  position: number;
}) {
  if (position === 1) {
    return <span className="text-base">🥇</span>;
  }

  if (position === 2) {
    return <span className="text-base">🥈</span>;
  }

  if (position === 3) {
    return <span className="text-base">🥉</span>;
  }

  return (
    <span className="text-[11px] font-black text-slate-400">
      {position}
    </span>
  );
}