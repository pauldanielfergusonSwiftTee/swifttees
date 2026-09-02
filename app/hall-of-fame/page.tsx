"use client";

import { useMemo, useState } from "react";
import PageContainer from "@/components/PageContainer";

type RecordRow = {
  name: string;
  value: number;
};

type StablefordRound = {
  name: string;
  points: number;
  event: string;
  course: string;
};

/* ============================================================
   MASTER DATA

   Update these arrays after each Swift Tees event.
   Only add players once they have actually recorded something.
============================================================ */

const headlineRecords = [
  {
    icon: "🚀",
    eyebrow: "Long Drive King",
    name: "Paul",
    value: "3",
    label: "wins",
    note: "Biggest hitter in Swift Tees history.",
  },
  {
    icon: "🎯",
    eyebrow: "Pin Seeker",
    name: "Stu",
    value: "3",
    label: "wins",
    note: "Most Closest to the Pin victories.",
  },
  {
    icon: "🏌️",
    eyebrow: "Most Trips",
    name: "Carl",
    value: "8",
    label: "weekends",
    note: "Elite commitment to the cause.",
  },
];

/* ============================================================
   DEMO CAREER DATA FOR NOW
============================================================ */

const eventWins: RecordRow[] = [
  { name: "Paul", value: 3 },
  { name: "Carl", value: 2 },
  { name: "Stu", value: 2 },
  { name: "Ian", value: 1 },
  { name: "Adam", value: 1 },
  { name: "Wrighty", value: 1 },
  { name: "Gav", value: 1 },
];

const podiums: RecordRow[] = [
  { name: "Paul", value: 6 },
  { name: "Stu", value: 5 },
  { name: "Carl", value: 4 },
  { name: "Adam", value: 3 },
  { name: "Ian", value: 2 },
  { name: "Wrighty", value: 2 },
  { name: "Gav", value: 2 },
  { name: "Liam", value: 1 },
  { name: "Dan", value: 1 },
  { name: "Painy", value: 1 },
];

const longestDrive: RecordRow[] = [
  { name: "Paul", value: 3 },
  { name: "Wrighty", value: 1 },
  { name: "Gav", value: 1 },
];

const nearestPin: RecordRow[] = [
  { name: "Stu", value: 3 },
  { name: "Ian", value: 2 },
  { name: "Carl", value: 1 },
  { name: "Wrighty", value: 1 },
  { name: "Paul", value: 1 },
];

const tripsAttended: RecordRow[] = [
  { name: "Carl", value: 8 },
  { name: "Paul", value: 7 },
  { name: "Stu", value: 7 },
  { name: "Ian", value: 6 },
  { name: "Liam", value: 6 },
  { name: "Wrighty", value: 5 },
  { name: "Gav", value: 5 },
  { name: "Adam", value: 4 },
  { name: "Dan", value: 4 },
  { name: "Painy", value: 3 },
  { name: "Phil", value: 3 },
  { name: "Taz", value: 2 },
];

const drivers: RecordRow[] = [
  { name: "Paul", value: 4 },
  { name: "Stu", value: 3 },
  { name: "Carl", value: 2 },
  { name: "Ian", value: 1 },
  { name: "Wrighty", value: 1 },
];

/* ============================================================
   REAL CARDEN PARK STABLEFORD DATA
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

export default function HallOfFamePage() {
  return (
    <PageContainer className="bg-[#f3f1eb] text-slate-900">
      {/* ======================================================
          HERO
      ====================================================== */}
      <section className="overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-lg">
        <div className="p-6 md:p-9">
          <a
            href="/"
            className="text-sm font-black text-lime-300 transition hover:text-lime-200"
          >
            ← Back to home
          </a>

          <div className="mt-6">
            <div className="inline-flex rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
              🏛️ Swift Tees Record Book
            </div>

            <h1 className="mt-4 text-5xl font-black leading-none tracking-tight md:text-7xl">
              Hall of
              <span className="block text-lime-300">
                Fame.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-300 md:text-lg">
              The permanent Swift Tees record book. Wins, records,
              trips and the people who somehow agreed to drive.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          HEADLINE HOLDERS
      ====================================================== */}
      <section className="mt-4 grid gap-3 md:grid-cols-3">
        {headlineRecords.map((record) => (
          <div
            key={record.eyebrow}
            className="relative overflow-hidden rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="absolute -right-3 -top-6 text-[100px] opacity-[0.06]">
              {record.icon}
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              {record.eyebrow}
            </p>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-black text-green-950 md:text-3xl">
                  {record.name}
                </p>

                <p className="mt-1 max-w-[220px] text-xs font-semibold leading-5 text-slate-500">
                  {record.note}
                </p>
              </div>

              <div className="text-right">
                <p className="text-5xl font-black leading-none text-green-900">
                  {record.value}
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  {record.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ======================================================
          CAREER TABLES
      ====================================================== */}
      <section className="mt-7">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            Career Records
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            The all-time tables
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Top five shown by default. Open any table to see the
            complete historical standings.
          </p>
        </div>

        <div className="grid items-start gap-3 md:grid-cols-2">
          <ExpandableRecordTable
            icon="🏆"
            title="Event Wins"
            subtitle="Most individual event or round victories"
            rows={eventWins}
            valueLabel="wins"
          />

          <ExpandableRecordTable
            icon="🥈"
            title="Podium Finishes"
            subtitle="Most top-three finishes"
            rows={podiums}
            valueLabel="podiums"
          />

          <ExpandableRecordTable
            icon="🚀"
            title="Longest Drive"
            subtitle="The official Swift Tees power rankings"
            rows={longestDrive}
            valueLabel="wins"
            accent
          />

          <ExpandableRecordTable
            icon="🎯"
            title="Closest to the Pin"
            subtitle="Precision when it actually matters"
            rows={nearestPin}
            valueLabel="wins"
          />

          <ExpandableRecordTable
            icon="🏌️"
            title="Trips Attended"
            subtitle="Commitment, loyalty and questionable priorities"
            rows={tripsAttended}
            valueLabel="trips"
          />
        </div>
      </section>

      {/* ======================================================
          DRIVERS
      ====================================================== */}
      <section className="mt-6 overflow-hidden rounded-[1.8rem] bg-green-950 text-white shadow-lg">
        <div className="grid gap-4 p-5 md:grid-cols-[0.9fr_1.3fr] md:p-7">
          <div>
            <div className="inline-flex rounded-full bg-lime-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">
              🚗 The Real Heroes
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Behind the wheel.
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-green-100">
              Recognition for those who sacrificed beers, sleep and
              dignity to get everybody there and back.
            </p>
          </div>

          <DriverTable rows={drivers} />
        </div>
      </section>

      {/* ======================================================
          BEST STABLEFORD - TOP 10 ONLY
      ====================================================== */}
      <section className="mt-7">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            Scoring Records
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            Top 10 Stableford rounds
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            The ten highest individual Stableford scores recorded
            in Swift Tees competition.
          </p>
        </div>

        <StablefordTopTen rows={bestStableford} />
      </section>

      {/* ======================================================
          CLOSING
      ====================================================== */}
      <section className="mt-7 overflow-hidden rounded-[2rem] bg-[#07111f] px-6 py-9 text-center text-white">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-lime-300">
          Swift Tees
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight md:text-5xl">
          Records are there
          <span className="block text-lime-300">
            to be broken.
          </span>
        </p>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
          Preferably on the golf course. But history suggests
          otherwise.
        </p>
      </section>

      {/* EXTRA MOBILE NAV / PWA SPACE */}
      <div className="h-52 md:hidden" />
    </PageContainer>
  );
}

/* ============================================================
   COMPACT EXPANDABLE RECORD TABLE
============================================================ */

function ExpandableRecordTable({
  icon,
  title,
  subtitle,
  rows,
  valueLabel,
  accent = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  rows: RecordRow[];
  valueLabel: string;
  accent?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const sortedRows = useMemo(
    () =>
      rows
        .filter((row) => row.value > 0)
        .slice()
        .sort(
          (a, b) =>
            b.value - a.value ||
            a.name.localeCompare(b.name)
        ),
    [rows]
  );

  const visibleRows = expanded
    ? sortedRows
    : sortedRows.slice(0, 5);

  const maxValue = Math.max(
    ...sortedRows.map((row) => row.value),
    1
  );

  return (
    <div
      className={`overflow-hidden rounded-[1.6rem] shadow-sm ring-1 ${
        accent
          ? "bg-[#07111f] text-white ring-slate-900"
          : "bg-white text-slate-900 ring-slate-200"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-start gap-3 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
            accent
              ? "bg-lime-300 text-slate-950"
              : "bg-green-100"
          }`}
        >
          {icon}
        </div>

        <div>
          <h3
            className={`text-xl font-black leading-tight ${
              accent ? "text-white" : "text-green-950"
            }`}
          >
            {title}
          </h3>

          <p
            className={`mt-0.5 text-xs leading-5 ${
              accent ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* ROWS */}
      <div
        className={`border-t ${
          accent ? "border-white/10" : "border-slate-100"
        }`}
      >
        {visibleRows.map((row, index) => {
          const width = Math.max(
            18,
            (row.value / maxValue) * 100
          );

          return (
            <div
              key={row.name}
              className={`px-4 py-2.5 ${
                index !== visibleRows.length - 1
                  ? accent
                    ? "border-b border-white/10"
                    : "border-b border-slate-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <RankIcon position={index + 1} />

                <span
                  className={`min-w-0 flex-1 truncate text-sm font-black ${
                    accent
                      ? "text-white"
                      : "text-green-950"
                  }`}
                >
                  {row.name}
                </span>

                <div className="shrink-0">
                  <span
                    className={`text-lg font-black ${
                      accent
                        ? "text-lime-300"
                        : "text-green-900"
                    }`}
                  >
                    {row.value}
                  </span>

                  <span className="ml-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                    {valueLabel}
                  </span>
                </div>
              </div>

              {/* COMPARISON BAR */}
              <div
                className={`ml-8 mt-1.5 h-3 overflow-hidden rounded-full ${
                  accent
                    ? "bg-white/10"
                    : "bg-slate-100"
                }`}
              >
                <div
                  className={`h-full rounded-full ${
                    accent
                      ? "bg-lime-300"
                      : index === 0
                      ? "bg-green-900"
                      : "bg-green-600"
                  }`}
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPAND */}
      {sortedRows.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={`flex w-full items-center justify-center gap-2 border-t px-4 py-3 text-xs font-black transition ${
            accent
              ? "border-white/10 text-lime-300 hover:bg-white/5"
              : "border-slate-100 text-green-800 hover:bg-green-50"
          }`}
        >
          {expanded ? (
            <>
              Show top 5 ↑
            </>
          ) : (
            <>
              View full table
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] ${
                  accent
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {sortedRows.length}
              </span>
              ↓
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   DRIVERS
============================================================ */

function DriverTable({
  rows,
}: {
  rows: RecordRow[];
}) {
  const [expanded, setExpanded] = useState(false);

  const sorted = rows
    .filter((row) => row.value > 0)
    .slice()
    .sort(
      (a, b) =>
        b.value - a.value ||
        a.name.localeCompare(b.name)
    );

  const visible = expanded
    ? sorted
    : sorted.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-[1.3rem] bg-white/10 ring-1 ring-white/10">
      {visible.map((player, index) => (
        <div
          key={player.name}
          className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 last:border-b-0"
        >
          <div className="flex items-center gap-2">
            <RankIcon position={index + 1} />

            <span className="text-sm font-black">
              {player.name}
            </span>
          </div>

          <div>
            <span className="text-xl font-black text-lime-300">
              {player.value}
            </span>

            <span className="ml-1 text-[8px] font-black uppercase tracking-wider text-green-200">
              drives
            </span>
          </div>
        </div>
      ))}

      {sorted.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-center border-t border-white/10 px-4 py-3 text-xs font-black text-lime-300"
        >
          {expanded
            ? "Show top 5 ↑"
            : `View all drivers (${sorted.length}) ↓`}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   STABLEFORD - FIXED TOP 10
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
    <div className="overflow-hidden rounded-[1.7rem] bg-white shadow-sm ring-1 ring-slate-200">
      <div className="grid grid-cols-[38px_1fr_auto] bg-[#07111f] px-3 py-2.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-300 md:grid-cols-[55px_1fr_200px_90px] md:px-5">
        <div>#</div>
        <div>Player</div>

        <div className="hidden md:block">
          Event
        </div>

        <div className="text-right">
          Points
        </div>
      </div>

      {topTen.map((round, index) => (
        <div
          key={`${round.name}-${round.event}-${round.course}-${index}`}
          className={`grid grid-cols-[38px_1fr_auto] items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0 md:grid-cols-[55px_1fr_200px_90px] md:px-5 ${
            index === 0
              ? "bg-amber-50"
              : "bg-white"
          }`}
        >
          <div>
            <CompactPosition position={index + 1} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-green-950">
              {round.name}
            </p>

            <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400 md:hidden">
              {round.event} • {round.course}
            </p>
          </div>

          <div className="hidden md:block">
            <p className="text-xs font-black text-slate-700">
              {round.event}
            </p>

            <p className="text-[10px] text-slate-400">
              {round.course}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black leading-none text-green-900">
              {round.points}
            </span>

            <span className="ml-1 text-[8px] font-black uppercase text-slate-400">
              pts
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   POSITION ICONS
============================================================ */

function RankIcon({
  position,
}: {
  position: number;
}) {
  if (position === 1) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
        🥇
      </span>
    );
  }

  if (position === 2) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
        🥈
      </span>
    );
  }

  if (position === 3) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm">
        🥉
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
      {position}
    </span>
  );
}

function CompactPosition({
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
    <span className="text-xs font-black text-slate-500">
      {position}
    </span>
  );
}