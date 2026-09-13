"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/lib/supabase";

type StablefordRound = {
  name: string;
  points: number;
  grossScore: number;
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

type TeamWin = {
  player: string;
  wins: number;
  event: string;
};

type AchievementRow = {
  event_slug: string;
  event_name: string;
  event_date: string | null;
  player_id: number | null;
  player_name: string;
  achievement_type: string;
  round_number: number | null;
  course_name: string | null;
  detail: string | null;
};

type AttendanceRow = {
  event_slug: string;
  event_name: string;
  event_date: string | null;
  player_id: number | null;
  player_name: string;
};

type BaselineRow = {
  player_name: string;
  legacy_trips: number;
};

type OverallResultRow = {
  event_name: string;
  event_date: string | null;
  round_number: number;
  course_name: string | null;
  player_name: string;
  stableford_points: number;
  gross_score: number | null;
};

type AchievementSummary = {
  player: string;
  wins: number;
  events: string[];
};

function achievementEventLabel(row: AchievementRow) {
  if (row.detail) {
    return `${row.event_name} — ${row.detail}`;
  }

  if (row.round_number) {
    return `${row.event_name} — Round ${row.round_number}`;
  }

  return row.event_name;
}

function summariseAchievements(
  rows: AchievementRow[],
  achievementType: string
): AchievementSummary[] {
  const grouped = new Map<string, AchievementSummary>();

  rows
    .filter((row) => row.achievement_type === achievementType)
    .forEach((row) => {
      const current = grouped.get(row.player_name) ?? {
        player: row.player_name,
        wins: 0,
        events: [],
      };

      current.wins += 1;
      current.events.push(achievementEventLabel(row));
      grouped.set(row.player_name, current);
    });

  return Array.from(grouped.values()).sort(
    (a, b) =>
      b.wins - a.wins ||
      a.player.localeCompare(b.player)
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function HallOfFamePage() {
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [baselines, setBaselines] = useState<BaselineRow[]>([]);
  const [overallResults, setOverallResults] = useState<OverallResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHallOfFame() {
      setLoading(true);
      setLoadError("");

      const [
        achievementsResult,
        attendanceResult,
        baselinesResult,
        overallResultsResult,
      ] = await Promise.all([
        supabase
          .from("event_achievements")
          .select(
            "event_slug,event_name,event_date,player_id,player_name,achievement_type,round_number,course_name,detail"
          ),
        supabase
          .from("event_attendance")
          .select(
            "event_slug,event_name,event_date,player_id,player_name"
          ),
        supabase
          .from("player_history_baseline")
          .select("player_name,legacy_trips"),
        supabase
          .from("overall_results")
          .select(
            "event_name,event_date,round_number,course_name,player_name,stableford_points,gross_score"
          ),
      ]);

      if (cancelled) return;

      const error =
        achievementsResult.error ||
        attendanceResult.error ||
        baselinesResult.error ||
        overallResultsResult.error;

      if (error) {
        console.error("Hall of Fame load failed:", error);
        setLoadError(error.message);
        setLoading(false);
        return;
      }

      setAchievements(
        (achievementsResult.data ?? []) as AchievementRow[]
      );
      setAttendance(
        (attendanceResult.data ?? []) as AttendanceRow[]
      );
      setBaselines(
        (baselinesResult.data ?? []) as BaselineRow[]
      );
      setOverallResults(
        (overallResultsResult.data ?? []) as OverallResultRow[]
      );
      setLoading(false);
    }

    void loadHallOfFame();

    return () => {
      cancelled = true;
    };
  }, []);

  const attendanceGroups = useMemo<AttendanceGroup[]>(() => {
    const totals = new Map<string, number>();

    baselines.forEach((row) => {
      totals.set(
        row.player_name,
        Number(row.legacy_trips) || 0
      );
    });

    attendance.forEach((row) => {
      totals.set(
        row.player_name,
        (totals.get(row.player_name) ?? 0) + 1
      );
    });

    const grouped = new Map<number, string[]>();

    totals.forEach((trips, player) => {
      if (trips <= 0) return;

      const players = grouped.get(trips) ?? [];
      players.push(player);
      grouped.set(trips, players);
    });

    return Array.from(grouped.entries())
      .map(([trips, players]) => ({
        trips,
        players: players.sort((a, b) =>
          a.localeCompare(b)
        ),
      }))
      .sort((a, b) => b.trips - a.trips);
  }, [attendance, baselines]);

  const closestToPinWinners = useMemo<ClosestPinWinner[]>(
    () =>
      achievements
        .filter(
          (row) => row.achievement_type === "closest_to_pin"
        )
        .map((row) => ({
          player: row.player_name,
          event: achievementEventLabel(row),
        })),
    [achievements]
  );

  const eventWins = useMemo(
    () => summariseAchievements(achievements, "individual_win"),
    [achievements]
  );

  const teamWins = useMemo<TeamWin[]>(
    () =>
      summariseAchievements(achievements, "team_win").map(
        (row) => ({
          player: row.player,
          wins: row.wins,
          event: row.events.join(" · "),
        })
      ),
    [achievements]
  );

  const longestDriveRecords = useMemo(
    () => summariseAchievements(achievements, "longest_drive"),
    [achievements]
  );

  const bestStableford = useMemo<StablefordRound[]>(
    () =>
      overallResults
        .filter((row) => Number(row.stableford_points) > 0)
        .map((row) => ({
          name: row.player_name,
          points: Number(row.stableford_points),
          grossScore: Number(row.gross_score ?? 0),
          event: row.event_name,
          course: row.course_name || "Course",
        }))
        .sort(
          (a, b) =>
            b.points - a.points ||
            a.name.localeCompare(b.name)
        ),
    [overallResults]
  );

  const playerCount = useMemo(() => {
    const players = new Set<string>();

    baselines.forEach((row) => {
      if (Number(row.legacy_trips) > 0) {
        players.add(row.player_name);
      }
    });

    attendance.forEach((row) => {
      players.add(row.player_name);
    });

    return players.size;
  }, [attendance, baselines]);

  const latestEventName = useMemo(() => {
    const datedEvents = [
      ...attendance.map((row) => ({
        name: row.event_name,
        date: row.event_date,
      })),
      ...overallResults.map((row) => ({
        name: row.event_name,
        date: row.event_date,
      })),
      ...achievements.map((row) => ({
        name: row.event_name,
        date: row.event_date,
      })),
    ]
      .filter((row) => row.date)
      .sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      );

    return datedEvents[0]?.name ?? "latest recorded event";
  }, [achievements, attendance, overallResults]);

  const maxTrips = Math.max(
    1,
    ...attendanceGroups.map((group) => group.trips)
  );

  const stablefordRecord = bestStableford[0] ?? null;

  if (loading) {
    return (
      <PageContainer className="bg-[#f2f0e9] text-slate-900">
        <div className="rounded-[2rem] bg-[#06140f] p-8 text-white shadow-xl">
          <p className="text-sm font-black text-lime-300">
            Loading Hall of Fame...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer className="bg-[#f2f0e9] text-slate-900">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6">
          <p className="font-black text-red-900">
            Hall of Fame data could not be loaded.
          </p>
          <p className="mt-2 text-sm font-semibold text-red-700">
            {loadError}
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="bg-[#f2f0e9] text-slate-900">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[#06140f] text-white shadow-xl md:min-h-[470px]">
        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/carden-park.jpg')",
          }}
        />

        {/* PHOTO TREATMENT */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#04110c] via-[#06140f]/88 to-[#06140f]/18" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#04110c]/90 via-transparent to-black/10" />

        <div className="absolute inset-0 bg-green-950/10 mix-blend-multiply" />

        {/* DECORATIVE DETAIL */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.04]" />

        {/* CONTENT */}
        <div className="relative z-10 flex min-h-[390px] flex-col justify-between p-6 md:min-h-[470px] md:p-10">
          <div>
            <a
              href="/"
              className="text-sm font-black text-lime-300 transition hover:text-lime-200"
            >
              ← Back to home
            </a>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-lime-300 backdrop-blur-sm">
              <span>🏛️</span>
              Swift Tees Record Book
            </div>

            <h1 className="mt-5 text-5xl font-black leading-[0.86] tracking-[-0.055em] drop-shadow-lg md:text-8xl">
              Hall of
              <span className="block text-lime-300">
                Fame.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm font-semibold leading-6 text-white/80 md:text-base">
              The records, winners and milestones that make up
              Swift Tees history.
            </p>
          </div>

          {/* PARTICIPANTS STRIP */}
          <div className="mt-8">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 shadow-lg backdrop-blur-md">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-300 text-lg text-green-950">
                👥
              </div>

              <div>
                <p className="text-sm font-black text-white">
                  {playerCount} Participants so far...
                </p>

                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.13em] text-white/55">
                  Through to {latestEventName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN HONOURS
      ====================================================== */}

      <section className="mt-8">
        <SectionHeading
          eyebrow="The Major Honours"
          title="Winning matters most."
          description="The biggest records in Swift Tees history."
        />

        {/* ======================================================
            EVENT WINS — MAIN FEATURE
        ====================================================== */}

        <div className="relative overflow-hidden rounded-[2rem] bg-[#06140f] p-6 text-white shadow-xl md:p-8">
          {/* BACKGROUND DECORATION */}
          <div className="pointer-events-none absolute -right-10 -top-14 text-[210px] opacity-[0.045]">
            🏆
          </div>

          <div className="pointer-events-none absolute bottom-[-90px] left-[30%] h-64 w-64 rounded-full border-[45px] border-white/[0.025]" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-lime-300 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-green-950">
                🏆 Event Wins
              </span>

              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-300">
                Main Honour
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">
                  All-time leader
                </p>

                <p className="mt-1 text-5xl font-black tracking-tight md:text-7xl">
                  {eventWins[0]?.player ?? "—"}
                </p>

                <p className="mt-2 text-sm font-semibold text-white/65">
                  Most individual Swift Tees event victories
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(eventWins[0]?.events ?? []).map((event) => (
                    <span
                      key={event}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-[11px] font-black text-white"
                    >
                      <span>🏆</span>
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-8xl font-black leading-none text-lime-300 md:text-9xl">
                  {eventWins[0]?.wins ?? 0}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-green-200">
                  Event wins
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            TEAM WINS — SECOND MAIN FEATURE
        ====================================================== */}

        <div className="mt-3 overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  Team Championships
                </p>

                <h3 className="mt-1 text-3xl font-black tracking-tight text-green-950 md:text-4xl">
                  🏆 Team Wins
                </h3>

                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Team championship records begin from Carden Park 2026.
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-950 text-2xl md:flex">
                🏆
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {teamWins.map((winner, index) => (
              <div
                key={`${winner.player}-${winner.event}-${index}`}
                className={`relative p-5 md:p-6 ${
                  index % 2 === 0
                    ? "border-r border-slate-100"
                    : ""
                } border-b border-slate-100 md:border-r md:border-b-0 md:[&:nth-child(4n)]:border-r-0`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-2xl font-black text-green-950">
                      {winner.player}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      {winner.event}
                    </p>
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-sm">
                    🏆
                  </span>
                </div>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-black leading-none text-green-900">
                    {winner.wins}
                  </span>

                  <span className="pb-1 text-[8px] font-black uppercase tracking-[0.16em] text-emerald-700">
                    team win
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          SECONDARY RECORDS
      ====================================================== */}

      <section className="mt-8">
        <SectionHeading
          eyebrow="Competition Records"
          title="More names in the book."
          description="The side contests and individual records built up across the trips."
        />

        {/* LONGEST DRIVE */}

        <div className="overflow-hidden rounded-[1.8rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
            <div className="relative overflow-hidden bg-[#071b13] p-5 text-white md:p-6">
              <div className="pointer-events-none absolute -right-5 -top-10 text-[130px] opacity-[0.055]">
                🚀
              </div>

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-300">
                      Power Records
                    </p>

                    <h3 className="mt-1 text-2xl font-black">
                      🚀 Longest Drive
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-5xl font-black leading-none text-lime-300">
                      {longestDriveRecords[0]?.wins ?? 0}
                    </p>

                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-green-200">
                      wins
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-300">
                    All-time leader
                  </p>

                  <p className="mt-1 text-4xl font-black">
                    {longestDriveRecords[0]?.player ?? "—"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(longestDriveRecords[0]?.events ?? []).map((event) => (
                      <RecordTag key={event}>
                        {event}
                      </RecordTag>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 md:p-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Also on the board
                </p>

                <p className="mt-1 text-3xl font-black text-green-950">
                  {longestDriveRecords[1]?.player ?? "—"}
                </p>

                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  {longestDriveRecords[1]?.events[0] ?? "No other winner yet"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-5xl font-black leading-none text-green-900">
                  {longestDriveRecords[1]?.wins ?? 0}
                </p>

                <p className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-emerald-700">
                  win
                </p>
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
                  {new Set(
                    closestToPinWinners.map((winner) => winner.player)
                  ).size} different winners so far.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {closestToPinWinners.map((winner, index) => (
              <div
                key={`${winner.player}-${winner.event}-${index}`}
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
          STABLEFORD TOP 10
      ====================================================== */}

      <section className="mt-8">
        <SectionHeading
          eyebrow="Scoring Records"
          title="Top 10 Stableford Scores"
          description="The ten highest individual Stableford scores recorded in Swift Tees competition."
        />

        {/* CURRENT RECORD */}

        <div className="mb-3 overflow-hidden rounded-[1.8rem] bg-[#07140f] p-5 text-white shadow-lg">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-lime-300">
                Current Record
              </p>

              <p className="mt-2 text-3xl font-black">
                {stablefordRecord?.name ?? "—"}
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                {stablefordRecord
                  ? `${stablefordRecord.event} · ${stablefordRecord.course}`
                  : "No recorded round"}
              </p>

              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">
                {stablefordRecord?.grossScore
                  ? `${stablefordRecord.grossScore} shots`
                  : "Gross score unavailable"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-6xl font-black leading-none text-lime-300">
                {stablefordRecord?.points ?? "—"}
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-green-200">
                Stableford pts
              </p>
            </div>
          </div>
        </div>

        <StablefordTopTen rows={bestStableford} />
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
              maxTrips={maxTrips}
            />
          ))}
        </div>
      </section>

      
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
          <div className="flex w-14 shrink-0 flex-col items-center">
            <span className="text-3xl font-black leading-none text-green-950">
              {trips}
            </span>

            <span className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
              {trips === 1 ? "trip" : "trips"}
            </span>
          </div>

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
   STABLEFORD TOP 10
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
      {/* DESKTOP HEADER */}

      <div className="hidden grid-cols-[45px_1fr_190px_80px_70px] bg-[#07140f] px-4 py-2.5 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 md:grid">
        <div>#</div>
        <div>Player</div>
        <div>Round</div>
        <div className="text-right">Score</div>
        <div className="text-right">Pts</div>
      </div>

      {/* MOBILE HEADER */}

      <div className="grid grid-cols-[32px_1fr_48px_48px] bg-[#07140f] px-3 py-2.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400 md:hidden">
        <div>#</div>
        <div>Player</div>
        <div className="text-right">Score</div>
        <div className="text-right">Pts</div>
      </div>

      {topTen.map((round, index) => (
        <div
          key={`${round.name}-${round.event}-${round.course}-${index}`}
          className={`border-b border-slate-100 last:border-b-0 ${
            index === 0
              ? "bg-lime-50"
              : index < 3
              ? "bg-[#fbfbf8]"
              : "bg-white"
          }`}
        >
          {/* MOBILE */}

          <div className="grid grid-cols-[32px_1fr_48px_48px] items-center gap-1 px-3 py-2.5 md:hidden">
            <div>
              <StablefordPosition position={index + 1} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-green-950">
                {round.name}
              </p>

              <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400">
                {round.event} · {round.course}
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-slate-600">
                {round.grossScore}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`text-lg font-black ${
                  index === 0
                    ? "text-green-950"
                    : "text-green-800"
                }`}
              >
                {round.points}
              </span>
            </div>
          </div>

          {/* DESKTOP */}

          <div className="hidden grid-cols-[45px_1fr_190px_80px_70px] items-center gap-2 px-4 py-2.5 md:grid">
            <div>
              <StablefordPosition position={index + 1} />
            </div>

            <div>
              <p className="text-sm font-black text-green-950">
                {round.name}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-600">
                {round.event}
              </p>

              <p className="text-[9px] font-semibold text-slate-400">
                {round.course}
              </p>
            </div>

            <div className="text-right text-sm font-black text-slate-600">
              {round.grossScore}
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
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   STABLEFORD POSITION
============================================================ */

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