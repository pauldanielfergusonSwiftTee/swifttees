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

type ScoringRow = {
  name: string;
  eagles: number;
  birdies: number;
  holeInOnes: number;
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

/* DEMO DATA FOR NOW */

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

const playersPlayer: RecordRow[] = [
  { name: "Taz", value: 2 },
  { name: "Stu", value: 1 },
  { name: "Carl", value: 1 },
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

/* Carden Park values here are real from the recorded Stableford round */

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

/* DEMO SCORING DATA FOR LAYOUT */

const scoringAchievements: ScoringRow[] = [
  { name: "Paul", eagles: 0, birdies: 6, holeInOnes: 0 },
  { name: "Ian", eagles: 1, birdies: 4, holeInOnes: 0 },
  { name: "Stu", eagles: 0, birdies: 3, holeInOnes: 0 },
  { name: "Adam", eagles: 0, birdies: 3, holeInOnes: 0 },
  { name: "Wrighty", eagles: 0, birdies: 2, holeInOnes: 0 },
  { name: "Carl", eagles: 0, birdies: 2, holeInOnes: 0 },
  { name: "Gav", eagles: 0, birdies: 1, holeInOnes: 0 },
  { name: "Liam", eagles: 0, birdies: 1, holeInOnes: 0 },
  { name: "Dan", eagles: 0, birdies: 1, holeInOnes: 0 },
  { name: "Painy", eagles: 1, birdies: 0, holeInOnes: 0 },
];

export default function HallOfFamePage() {
  return (
    <PageContainer className="bg-[#f3f1eb] text-slate-900">
      {/* ======================================================
          HERO
      ====================================================== */}
      <section className="overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-lg">
        <div className="p-6 md:p-10">
          <a
            href="/"
            className="text-sm font-black text-lime-300 transition hover:text-lime-200"
          >
            ← Back to home
          </a>

          <div className="mt-7">
            <div className="inline-flex rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
              🏛️ Swift Tees Record Book
            </div>

            <h1 className="mt-5 text-5xl font-black leading-none tracking-tight md:text-7xl">
              Hall of
              <span className="block text-lime-300">
                Fame.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-300 md:text-lg">
              The permanent Swift Tees record book. Wins, records,
              trips, scoring achievements and the people who somehow
              agreed to drive.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          HEADLINE HOLDERS
      ====================================================== */}
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {headlineRecords.map((record) => (
          <div
            key={record.eyebrow}
            className="relative overflow-hidden rounded-[1.8rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="absolute -right-3 -top-6 text-[110px] opacity-[0.06]">
              {record.icon}
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {record.eyebrow}
            </p>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-black text-green-950">
                  {record.name}
                </p>

                <p className="mt-2 max-w-[220px] text-sm font-semibold leading-5 text-slate-500">
                  {record.note}
                </p>
              </div>

              <div className="text-right">
                <p className="text-6xl font-black leading-none text-green-900">
                  {record.value}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
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
      <section className="mt-9">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            Career Records
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            The all-time tables
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Top five shown by default. Open any table to see the
            complete historical standings.
          </p>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-2">
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
            icon="⭐"
            title="Players' Player"
            subtitle="Voted for by the people who were actually there"
            rows={playersPlayer}
            valueLabel="awards"
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
      <section className="mt-8 overflow-hidden rounded-[2rem] bg-green-950 text-white shadow-lg">
        <div className="grid gap-6 p-6 md:grid-cols-[0.9fr_1.3fr] md:p-8">
          <div>
            <div className="inline-flex rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
              🚗 The Real Heroes
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Behind the wheel.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-green-100">
              Recognition for those who sacrificed beers, sleep and
              dignity to get everybody there and back.
            </p>
          </div>

          <DriverTable rows={drivers} />
        </div>
      </section>

      {/* ======================================================
          BEST STABLEFORD
      ====================================================== */}
      <section className="mt-9">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            Scoring Records
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            Best Stableford rounds
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Every recorded individual round can live here permanently.
            Top five are shown first.
          </p>
        </div>

        <StablefordTable rows={bestStableford} />
      </section>

      {/* ======================================================
          SCORING ACHIEVEMENTS
      ====================================================== */}
      <section className="mt-9">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            Shot Making
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            Scoring achievements
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Eagles, birdies and the hole-in-one column waiting for
            somebody to finally fill it.
          </p>
        </div>

        <ScoringTable rows={scoringAchievements} />

        <p className="mt-3 text-xs font-semibold italic text-slate-500">
          * Detailed scoring records only count from the point
          official hole-by-hole tracking began.
        </p>
      </section>

      {/* ======================================================
          CLOSING
      ====================================================== */}
      <section className="mt-9 overflow-hidden rounded-[2rem] bg-[#07111f] px-6 py-10 text-center text-white">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-lime-300">
          Swift Tees
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-3xl font-black leading-tight md:text-5xl">
          Records are there
          <span className="block text-lime-300">
            to be broken.
          </span>
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400">
          Preferably on the golf course. But history suggests
          otherwise.
        </p>
      </section>

      <div className="h-32 md:hidden" />
    </PageContainer>
  );
}

/* ============================================================
   EXPANDABLE RECORD TABLE
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
      className={`overflow-hidden rounded-[1.8rem] shadow-sm ring-1 ${
        accent
          ? "bg-[#07111f] text-white ring-slate-900"
          : "bg-white text-slate-900 ring-slate-200"
      }`}
    >
      <div className="p-5">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
            accent
              ? "bg-lime-300 text-slate-950"
              : "bg-green-100"
          }`}
        >
          {icon}
        </div>

        <h3
          className={`mt-4 text-2xl font-black ${
            accent ? "text-white" : "text-green-950"
          }`}
        >
          {title}
        </h3>

        <p
          className={`mt-1 text-sm ${
            accent ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      </div>

      <div
        className={`border-t ${
          accent ? "border-white/10" : "border-slate-100"
        }`}
      >
        {visibleRows.map((row, index) => {
          const width = Math.max(
            22,
            (row.value / maxValue) * 100
          );

          return (
            <div
              key={row.name}
              className={`px-5 py-4 ${
                index !== visibleRows.length - 1
                  ? accent
                    ? "border-b border-white/10"
                    : "border-b border-slate-100"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <RankIcon position={index + 1} />

                  <span
                    className={`truncate font-black ${
                      accent
                        ? "text-white"
                        : "text-green-950"
                    }`}
                  >
                    {row.name}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-xl font-black ${
                      accent
                        ? "text-lime-300"
                        : "text-green-900"
                    }`}
                  >
                    {row.value}
                  </span>

                  <span className="ml-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    {valueLabel}
                  </span>
                </div>
              </div>

              <div
                className={`mt-3 h-7 overflow-hidden rounded-lg ${
                  accent
                    ? "bg-white/10"
                    : "bg-slate-100"
                }`}
              >
                <div
                  className={`flex h-full items-center justify-end rounded-lg px-2 ${
                    accent
                      ? "bg-lime-300 text-slate-950"
                      : index === 0
                      ? "bg-green-900 text-white"
                      : "bg-green-700 text-white"
                  }`}
                  style={{
                    width: `${width}%`,
                  }}
                >
                  <span className="text-[10px] font-black">
                    {row.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedRows.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={`flex w-full items-center justify-center gap-2 border-t px-5 py-4 text-sm font-black transition ${
            accent
              ? "border-white/10 text-lime-300 hover:bg-white/5"
              : "border-slate-100 text-green-800 hover:bg-green-50"
          }`}
        >
          {expanded ? (
            <>
              Show top 5
              <span>↑</span>
            </>
          ) : (
            <>
              View full table
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {sortedRows.length}
              </span>
              <span>↓</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   DRIVER TABLE
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

  const visible = expanded ? sorted : sorted.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-[1.5rem] bg-white/10 ring-1 ring-white/10">
      {visible.map((player, index) => (
        <div
          key={player.name}
          className="flex items-center justify-between border-b border-white/10 px-5 py-4 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <RankIcon position={index + 1} />

            <span className="font-black">
              {player.name}
            </span>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-lime-300">
              {player.value}
            </span>

            <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-green-200">
              drives
            </span>
          </div>
        </div>
      ))}

      {sorted.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-center gap-2 border-t border-white/10 px-5 py-4 text-sm font-black text-lime-300 transition hover:bg-white/5"
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
   STABLEFORD TABLE
============================================================ */

function StablefordTable({
  rows,
}: {
  rows: StablefordRound[];
}) {
  const [expanded, setExpanded] = useState(false);

  const sorted = rows
    .filter((row) => row.points > 0)
    .slice()
    .sort(
      (a, b) =>
        b.points - a.points ||
        a.name.localeCompare(b.name)
    );

  const visible = expanded ? sorted : sorted.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
      <div className="hidden grid-cols-[70px_1fr_220px_120px] bg-[#07111f] px-6 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-300 md:grid">
        <div>Pos</div>
        <div>Player</div>
        <div>Event</div>
        <div className="text-right">
          Points
        </div>
      </div>

      {visible.map((round, index) => (
        <div
          key={`${round.name}-${round.event}-${round.course}-${index}`}
          className={`grid grid-cols-[50px_1fr_auto] items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid-cols-[70px_1fr_220px_120px] md:px-6 ${
            index === 0 ? "bg-amber-50" : ""
          }`}
        >
          <div>
            <RankIcon position={index + 1} />
          </div>

          <div>
            <p className="font-black text-green-950">
              {round.name}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500 md:hidden">
              {round.event} • {round.course}
            </p>
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-black text-slate-700">
              {round.event}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {round.course}
            </p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-green-900">
              {round.points}
            </span>

            <span className="ml-1 text-xs font-black uppercase text-slate-400">
              pts
            </span>
          </div>
        </div>
      ))}

      {sorted.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-5 py-4 text-sm font-black text-green-800 transition hover:bg-green-50"
        >
          {expanded
            ? "Show top 5 rounds ↑"
            : `View all recorded rounds (${sorted.length}) ↓`}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   SCORING TABLE
============================================================ */

function ScoringTable({
  rows,
}: {
  rows: ScoringRow[];
}) {
  const [expanded, setExpanded] = useState(false);

  const sorted = rows
    .filter(
      (player) =>
        player.eagles > 0 ||
        player.birdies > 0 ||
        player.holeInOnes > 0
    )
    .slice()
    .sort(
      (a, b) =>
        b.holeInOnes - a.holeInOnes ||
        b.eagles - a.eagles ||
        b.birdies - a.birdies ||
        a.name.localeCompare(b.name)
    );

  const visible = expanded ? sorted : sorted.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
      <div className="grid grid-cols-[1fr_62px_62px_62px] bg-[#07111f] px-4 py-3 text-[8px] font-black uppercase tracking-[0.12em] text-slate-300 sm:grid-cols-[1fr_90px_90px_90px]">
        <div>Player</div>

        <div className="text-center">
          🦅 Eagle
        </div>

        <div className="text-center">
          🐦 Birdie
        </div>

        <div className="text-center">
          ⛳ HIO
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {visible.map((player) => (
          <div
            key={player.name}
            className="grid grid-cols-[1fr_62px_62px_62px] items-center px-4 py-4 sm:grid-cols-[1fr_90px_90px_90px]"
          >
            <div className="font-black text-green-950">
              {player.name}
            </div>

            <StatCell value={player.eagles} />
            <StatCell value={player.birdies} />
            <StatCell value={player.holeInOnes} />
          </div>
        ))}
      </div>

      {sorted.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-5 py-4 text-sm font-black text-green-800 transition hover:bg-green-50"
        >
          {expanded
            ? "Show top 5 ↑"
            : `View full scoring table (${sorted.length}) ↓`}
        </button>
      )}
    </div>
  );
}

function StatCell({
  value,
}: {
  value: number;
}) {
  return (
    <div className="text-center">
      <span
        className={`inline-flex min-w-[32px] items-center justify-center rounded-lg px-2 py-1 text-sm font-black ${
          value > 0
            ? "bg-green-100 text-green-900"
            : "text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   RANK ICON
============================================================ */

function RankIcon({
  position,
}: {
  position: number;
}) {
  if (position === 1) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
        🥇
      </span>
    );
  }

  if (position === 2) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
        🥈
      </span>
    );
  }

  if (position === 3) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg">
        🥉
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
      {position}
    </span>
  );
}