"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/lib/supabase";

/* ============================================================
   TYPES
============================================================ */

type StablefordRound = {
  name: string;
  points: number;
  grossScore: number | null;
  event: string;
  course: string;
};

type AttendanceGroup = {
  trips: number;
  players: string[];
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

type RecordsTab =
  | "stableford"
  | "gross"
  | "closest"
  | "drive";

/* ============================================================
   HELPERS
============================================================ */

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

function tiedPosition(
  rows: AchievementSummary[],
  index: number
) {
  const wins = rows[index].wins;

  const firstIndex = rows.findIndex(
    (row) => row.wins === wins
  );

  return firstIndex + 1;
}

function isTied(
  rows: AchievementSummary[],
  index: number
) {
  return rows.some(
    (row, otherIndex) =>
      otherIndex !== index &&
      row.wins === rows[index].wins
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function HallOfFamePage() {
  const [achievements, setAchievements] = useState<
    AchievementRow[]
  >([]);

  const [attendance, setAttendance] = useState<
    AttendanceRow[]
  >([]);

  const [baselines, setBaselines] = useState<
    BaselineRow[]
  >([]);

  const [overallResults, setOverallResults] = useState<
    OverallResultRow[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ============================================================
     LOAD DATA
  ============================================================ */

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

  /* ============================================================
     ATTENDANCE
  ============================================================ */

  const attendanceGroups =
    useMemo<AttendanceGroup[]>(() => {
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

  /* ============================================================
     MAJOR HONOURS
  ============================================================ */

  const eventWins = useMemo(
    () =>
      summariseAchievements(
        achievements,
        "individual_win"
      ),
    [achievements]
  );

  const teamWins = useMemo(
    () =>
      summariseAchievements(
        achievements,
        "team_win"
      ),
    [achievements]
  );

  /* ============================================================
     RECORDS
  ============================================================ */

  const closestToPinRecords = useMemo(
    () =>
      summariseAchievements(
        achievements,
        "closest_to_pin"
      ),
    [achievements]
  );

  const longestDriveRecords = useMemo(
    () =>
      summariseAchievements(
        achievements,
        "longest_drive"
      ),
    [achievements]
  );

  /* ============================================================
     STABLEFORD
  ============================================================ */

  const bestStableford =
    useMemo<StablefordRound[]>(
      () =>
        overallResults
          .filter(
            (row) =>
              Number(row.stableford_points) > 0
          )
          .map((row) => ({
            name: row.player_name,
            points: Number(
              row.stableford_points
            ),
            grossScore:
              row.gross_score == null
                ? null
                : Number(row.gross_score),
            event: row.event_name,
            course:
              row.course_name || "Course",
          }))
          .sort(
            (a, b) =>
              b.points - a.points ||
              a.name.localeCompare(b.name)
          ),
      [overallResults]
    );

  const lowestGross =
    useMemo<StablefordRound[]>(
      () =>
        bestStableford
          .filter(
            (row) =>
              row.grossScore !== null &&
              row.grossScore > 0
          )
          .slice()
          .sort(
            (a, b) =>
              Number(a.grossScore) -
                Number(b.grossScore) ||
              b.points - a.points ||
              a.name.localeCompare(b.name)
          ),
      [bestStableford]
    );

  /* ============================================================
     PLAYER COUNT
  ============================================================ */

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

  const maxTrips = Math.max(
    1,
    ...attendanceGroups.map(
      (group) => group.trips
    )
  );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <PageContainer className="bg-[#f2f2f7] text-slate-900">
        <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
          <p className="text-sm font-bold text-green-950">
            Loading Hall of Fame...
          </p>
        </div>
      </PageContainer>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (loadError) {
    return (
      <PageContainer className="bg-[#f2f2f7] text-slate-900">
        <div className="rounded-[24px] bg-red-50 p-5 ring-1 ring-red-100">
          <p className="font-bold text-red-900">
            Hall of Fame data could not be loaded.
          </p>

          <p className="mt-2 text-sm text-red-700">
            {loadError}
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="bg-[#f2f2f7] text-slate-900">
      {/* ======================================================
          COMPACT HERO
      ====================================================== */}

      <section className="relative min-h-[285px] overflow-hidden rounded-[28px] bg-[#06140f] text-white shadow-sm md:min-h-[350px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/carden-park.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#04110c] via-[#06140f]/85 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#04110c]/80 via-transparent to-black/10" />

        <div className="relative z-10 flex min-h-[285px] flex-col p-5 md:min-h-[350px] md:p-8">
          <a
            href="/"
            className="inline-flex min-h-[32px] w-fit items-center text-sm font-bold text-lime-300"
          >
            ‹ Home
          </a>

          <div className="mt-auto pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300">
              Swift Tees Record Book
            </p>

            <h1 className="mt-2 text-[48px] font-black leading-[0.88] tracking-[-0.055em] md:text-7xl">
              Hall of
              <span className="block text-lime-300">
                Fame.
              </span>
            </h1>

            <p className="mt-3 max-w-sm text-[13px] font-medium leading-5 text-white/70">
              The records and winners of Swift Tees.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAJOR HONOURS
      ====================================================== */}

      <section className="mt-6">
        <IOSSectionHeading
          eyebrow="Major Honours"
          title="The winners"
        />

        {/* TEAM WINS */}

        <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-[15px] font-bold text-slate-500">
              Team Wins
            </h3>

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-800">
              🏆 Championship
            </span>
          </div>

          {teamWins.length > 0 ? (
            <div className="grid grid-cols-2 border-t border-slate-100 md:grid-cols-4">
              {teamWins.map((winner, index) => (
                <div
                  key={`${winner.player}-${index}`}
                  className={`
                    min-w-0 px-4 py-4
                    ${
                      index % 2 === 0
                        ? "border-r border-slate-100"
                        : ""
                    }
                    ${
                      index < teamWins.length - 2
                        ? "border-b border-slate-100 md:border-b-0"
                        : ""
                    }
                    md:border-r
                    md:border-slate-100
                    md:last:border-r-0
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[18px] font-black tracking-tight text-green-950">
                        {winner.player}
                      </p>

                      <div className="mt-1.5 space-y-0.5">
                        {winner.events.map(
                          (event, eventIndex) => (
                            <p
                              key={`${event}-${eventIndex}`}
                              className="text-[10px] font-semibold leading-4 text-slate-400"
                            >
                              {event}
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-baseline gap-1">
                      <span className="text-[28px] font-black leading-none text-green-950">
                        {winner.wins}
                      </span>

                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        {winner.wins === 1
                          ? "win"
                          : "wins"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptySmall text="No team wins recorded yet." />
          )}
        </div>

        {/* INDIVIDUAL WINS */}

        <div className="mt-3 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-[15px] font-bold text-slate-500">
              Individual Wins
            </h3>

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-800">
              🏆 Events
            </span>
          </div>

          {eventWins.length > 0 ? (
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {eventWins.map((winner, index) => (
                <div
                  key={`${winner.player}-${index}`}
                  className={`flex items-center justify-between gap-4 px-5 ${
                    index === 0
                      ? "min-h-[94px] bg-[#f7fced] py-4"
                      : "min-h-[76px] py-3"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full ${
                        index === 0
                          ? "h-9 w-9 bg-lime-300 text-base"
                          : "h-8 w-8 bg-slate-100 text-xs font-bold text-slate-500"
                      }`}
                    >
                      {index === 0
                        ? "🏆"
                        : index + 1}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`font-black tracking-[-0.03em] text-green-950 ${
                          index === 0
                            ? "text-[30px] leading-8"
                            : "text-xl"
                        }`}
                      >
                        {winner.player}
                      </p>

                      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                        {winner.events.map(
                          (event, eventIndex) => (
                            <span
                              key={`${event}-${eventIndex}`}
                              className="text-[10px] font-semibold leading-4 text-slate-400"
                            >
                              {event}
                              {eventIndex <
                              winner.events.length - 1
                                ? " •"
                                : ""}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`font-black leading-none text-green-950 ${
                        index === 0
                          ? "text-[38px]"
                          : "text-[30px]"
                      }`}
                    >
                      {winner.wins}
                    </span>

                    <span className="ml-1.5 text-[10px] font-bold uppercase text-slate-400">
                      {winner.wins === 1
                        ? "win"
                        : "wins"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptySmall text="No individual wins recorded yet." />
          )}
        </div>
      </section>

      {/* ======================================================
          RECORDS CENTRE
      ====================================================== */}

      <section className="mt-7">
        <IOSSectionHeading
          eyebrow="Record Book"
          title="Records Centre"
        />

        <RecordsCentre
          stableford={bestStableford}
          gross={lowestGross}
          closest={closestToPinRecords}
          drives={longestDriveRecords}
        />
      </section>

      {/* ======================================================
          ATTENDANCE
      ====================================================== */}

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
              Roll Call
            </p>

            <h2 className="mt-0.5 text-[28px] font-black tracking-[-0.04em] text-green-950">
              Trips attended
            </h2>
          </div>

          <div className="shrink-0 rounded-[14px] bg-green-950 px-3 py-2 text-center text-white shadow-sm">
            <p className="text-[22px] font-black leading-none text-lime-300">
              {playerCount}
            </p>

            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white/60">
              Participants
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
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

      {/* ======================================================
          CLOSING
      ====================================================== */}

      <section className="relative mt-7 overflow-hidden rounded-[28px] bg-[#06140f] px-6 py-9 text-center text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-lime-300">
          Swift Tees
        </p>

        <p className="mt-2 text-3xl font-black tracking-[-0.04em]">
          Records are there
          <span className="block text-lime-300">
            to be broken.
          </span>
        </p>
      </section>

      <div className="h-52 md:hidden" />
    </PageContainer>
  );
}

/* ============================================================
   RECORDS CENTRE
============================================================ */

function RecordsCentre({
  stableford,
  gross,
  closest,
  drives,
}: {
  stableford: StablefordRound[];
  gross: StablefordRound[];
  closest: AchievementSummary[];
  drives: AchievementSummary[];
}) {
  const [activeTab, setActiveTab] =
    useState<RecordsTab>("stableford");

  const tabs: {
    id: RecordsTab;
    label: string;
  }[] = [
    {
      id: "stableford",
      label: "Stableford",
    },
    {
      id: "gross",
      label: "Lowest",
    },
    {
      id: "closest",
      label: "CTP",
    },
    {
      id: "drive",
      label: "Drives",
    },
  ];

  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/[0.04]">
      {/* iOS SEGMENTED CONTROL */}

      <div className="p-3 pb-2">
        <div
          role="tablist"
          className="grid grid-cols-4 gap-1 rounded-[14px] bg-[#e9e9ee] p-[3px]"
        >
          {tabs.map((tab) => {
            const active =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`
                  relative min-w-0 rounded-[11px]
                  px-0.5 py-2.5 text-center
                  text-[12px] font-bold
                  transition-all duration-200
                  ${
                    active
                      ? "bg-white text-green-950 shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
                      : "text-slate-500 active:bg-slate-200"
                  }
                `}
              >
                {tab.label}

                {active && (
                  <span className="absolute bottom-[4px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-green-800" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STABLEFORD */}

      {activeTab === "stableford" && (
        <div>
          <RecordContext
            title="Top 10 Stableford"
            description="Highest individual Stableford rounds."
          />

          {stableford[0] && (
            <RecordHero
              player={stableford[0].name}
              value={stableford[0].points}
              unit="pts"
              sub={`${stableford[0].grossScore ?? "—"} shots · ${stableford[0].event}`}
            />
          )}

          <RoundLeaderboard
            rows={stableford.slice(0, 10)}
            mode="stableford"
          />
        </div>
      )}

      {/* LOWEST GROSS */}

      {activeTab === "gross" && (
        <div>
          <RecordContext
            title="Lowest Gross"
            description="Lowest 18-hole gross scores."
          />

          {gross[0] && (
            <RecordHero
              player={gross[0].name}
              value={
                gross[0].grossScore ?? "—"
              }
              unit="shots"
              sub={`${gross[0].points} pts · ${gross[0].event}`}
            />
          )}

          <RoundLeaderboard
            rows={gross.slice(0, 10)}
            mode="gross"
          />
        </div>
      )}

      {/* CLOSEST PIN */}

      {activeTab === "closest" && (
        <div>
          <RecordContext
            title="Closest to the Pin"
            description="Players ranked by CTP wins."
          />

          <AchievementLeaderboard
            rows={closest.slice(0, 10)}
            singular="win"
            plural="wins"
          />
        </div>
      )}

      {/* LONGEST DRIVE */}

      {activeTab === "drive" && (
        <div>
          <RecordContext
            title="Longest Drive"
            description="Players ranked by Longest Drive wins."
          />

          <AchievementLeaderboard
            rows={drives.slice(0, 10)}
            singular="win"
            plural="wins"
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RECORD CONTEXT
============================================================ */

function RecordContext({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 pb-3 pt-2">
      <h3 className="text-[22px] font-black tracking-[-0.035em] text-green-950">
        {title}
      </h3>

      <p className="mt-0.5 text-[12px] font-medium text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   RECORD HERO
============================================================ */

function RecordHero({
  player,
  value,
  unit,
  sub,
}: {
  player: string;
  value: number | string;
  unit: string;
  sub: string;
}) {
  return (
    <div className="mx-3 mb-3 overflow-hidden rounded-[18px] bg-[#07140f] px-5 py-4 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-300">
            Record
          </p>

          <p className="mt-1 text-[28px] font-black leading-none tracking-[-0.035em]">
            {player}
          </p>

          <p className="mt-2 truncate text-[10px] font-medium text-white/50">
            {sub}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[46px] font-black leading-none text-lime-300">
            {value}
          </p>

          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">
            {unit}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROUND LEADERBOARD
============================================================ */

function RoundLeaderboard({
  rows,
  mode,
}: {
  rows: StablefordRound[];
  mode: "stableford" | "gross";
}) {
  if (!rows.length) {
    return (
      <EmptySmall text="No rounds recorded yet." />
    );
  }

  return (
    <div className="border-t border-slate-100">
      {/* MOBILE COLUMN TITLES */}

      <div className="grid grid-cols-[34px_1fr_55px_50px] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 md:hidden">
        <div>#</div>
        <div>Player</div>

        <div className="text-right">
          Score
        </div>

        <div className="text-right">
          Pts
        </div>
      </div>

      {/* DESKTOP TITLES */}

      <div className="hidden grid-cols-[50px_1fr_220px_90px_80px] px-5 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 md:grid">
        <div>#</div>
        <div>Player</div>
        <div>Round</div>

        <div className="text-right">
          Score
        </div>

        <div className="text-right">
          Pts
        </div>
      </div>

      {rows.map((round, index) => (
        <div
          key={`${mode}-${round.name}-${round.event}-${round.course}-${index}`}
          className={`border-t border-slate-100 ${
            index === 0
              ? "bg-[#f7fced]"
              : "bg-white"
          }`}
        >
          {/* MOBILE */}

          <div className="grid min-h-[62px] grid-cols-[34px_1fr_55px_50px] items-center gap-1 px-4 py-2.5 md:hidden">
            <Rank position={index + 1} />

            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-green-950">
                {round.name}
              </p>

              <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
                {round.event} · {round.course}
              </p>
            </div>

            <div
              className={`text-right font-black ${
                mode === "gross"
                  ? "text-[18px] text-green-950"
                  : "text-[15px] text-slate-500"
              }`}
            >
              {round.grossScore ?? "—"}
            </div>

            <div
              className={`text-right font-black ${
                mode === "stableford"
                  ? "text-[20px] text-green-950"
                  : "text-[15px] text-slate-500"
              }`}
            >
              {round.points}
            </div>
          </div>

          {/* DESKTOP */}

          <div className="hidden min-h-[62px] grid-cols-[50px_1fr_220px_90px_80px] items-center gap-2 px-5 py-2.5 md:grid">
            <Rank position={index + 1} />

            <p className="text-[15px] font-bold text-green-950">
              {round.name}
            </p>

            <div>
              <p className="text-[11px] font-semibold text-slate-600">
                {round.event}
              </p>

              <p className="text-[9px] text-slate-400">
                {round.course}
              </p>
            </div>

            <div
              className={`text-right font-black ${
                mode === "gross"
                  ? "text-lg text-green-950"
                  : "text-sm text-slate-500"
              }`}
            >
              {round.grossScore ?? "—"}
            </div>

            <div
              className={`text-right font-black ${
                mode === "stableford"
                  ? "text-xl text-green-950"
                  : "text-sm text-slate-500"
              }`}
            >
              {round.points}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ACHIEVEMENT LEADERBOARD
============================================================ */

function AchievementLeaderboard({
  rows,
  singular,
  plural,
}: {
  rows: AchievementSummary[];
  singular: string;
  plural: string;
}) {
  if (!rows.length) {
    return (
      <EmptySmall text="No records recorded yet." />
    );
  }

  return (
    <div className="border-t border-slate-100">
      {rows.map((row, index) => {
        const position = tiedPosition(
          rows,
          index
        );

        const tied = isTied(rows, index);

        return (
          <div
            key={`${row.player}-${index}`}
            className={`grid min-h-[68px] grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${
              position === 1
                ? "bg-[#f7fced]"
                : "bg-white"
            }`}
          >
            <div className="text-[12px] font-black text-slate-400">
              {tied
                ? `T${position}`
                : position}
            </div>

            <div className="min-w-0">
              <p className="text-[16px] font-black text-green-950">
                {row.player}
              </p>

              <div className="mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5">
                {row.events.map(
                  (event, eventIndex) => (
                    <span
                      key={`${event}-${eventIndex}`}
                      className="text-[9px] font-medium text-slate-400"
                    >
                      {event}
                      {eventIndex <
                        row.events.length - 1
                        ? " ·"
                        : ""}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[28px] font-black leading-none text-green-950">
                {row.wins}
              </span>

              <span className="ml-1 text-[9px] font-bold uppercase text-slate-400">
                {row.wins === 1
                  ? singular
                  : plural}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   RANK
============================================================ */

function Rank({
  position,
}: {
  position: number;
}) {
  if (position === 1) {
    return (
      <span className="text-[18px]">
        🥇
      </span>
    );
  }

  if (position === 2) {
    return (
      <span className="text-[18px]">
        🥈
      </span>
    );
  }

  if (position === 3) {
    return (
      <span className="text-[18px]">
        🥉
      </span>
    );
  }

  return (
    <span className="text-[12px] font-bold text-slate-400">
      {position}
    </span>
  );
}

/* ============================================================
   IOS SECTION HEADING
============================================================ */

function IOSSectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-3 px-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
        {eyebrow}
      </p>

      <h2 className="mt-0.5 text-[28px] font-black tracking-[-0.04em] text-green-950">
        {title}
      </h2>
    </div>
  );
}

/* ============================================================
   ATTENDANCE
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
  const percentage =
    (trips / maxTrips) * 100;

  return (
    <div className="overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-start gap-3 p-4">
        <div className="flex w-[48px] shrink-0 flex-col items-center justify-center rounded-[15px] bg-[#f2f2f7] py-2">
          <span className="text-[28px] font-black leading-none text-green-950">
            {trips}
          </span>

          <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {trips === 1
              ? "trip"
              : "trips"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex max-w-full flex-wrap gap-1.5">
            {players.map((player) => (
              <span
                key={player}
                className="max-w-full break-words rounded-[9px] bg-green-50 px-2.5 py-1.5 text-[12px] font-bold leading-4 text-green-950"
              >
                {player}
              </span>
            ))}
          </div>

          <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-green-900 transition-all"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL EMPTY STATE
============================================================ */

function EmptySmall({
  text,
}: {
  text: string;
}) {
  return (
    <div className="border-t border-slate-100 px-5 py-6 text-center">
      <p className="text-[13px] font-medium text-slate-400">
        {text}
      </p>
    </div>
  );
}