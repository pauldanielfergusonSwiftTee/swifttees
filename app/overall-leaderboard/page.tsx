"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/lib/supabase";

type OverallResult = {
  id: number;
  event_slug: string;
  event_name: string;
  event_date: string | null;
  round_number: number;
  course_name: string | null;
  player_id: number | null;
  player_name: string;
  stableford_points: number;
  created_at: string;
};

type StandingRow = {
  pos: number;
  playerName: string;
  totalPoints: number;
  roundsPlayed: number;
  averagePoints: number;
  bestRound: number;
  eventsPlayed: number;
};

type RoundGroup = {
  key: string;
  eventSlug: string;
  eventName: string;
  eventDate: string | null;
  roundNumber: number;
  courseName: string | null;
  results: OverallResult[];
};

export default function OverallLeaderboardPage() {
  const [results, setResults] = useState<OverallResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRounds, setOpenRounds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadResults() {
      setLoading(true);

      const { data, error } = await supabase
        .from("overall_results")
        .select("*")
        .order("event_date", { ascending: false })
        .order("round_number", { ascending: false });

      if (error) {
        console.error("Could not load overall results:", error);
        setResults([]);
        setLoading(false);
        return;
      }

      setResults((data ?? []) as OverallResult[]);
      setLoading(false);
    }

    loadResults();
  }, []);

  const standings = useMemo<StandingRow[]>(() => {
    const byPlayer: Record<
      string,
      {
        totalPoints: number;
        roundsPlayed: number;
        bestRound: number;
        events: Set<string>;
      }
    > = {};

    results.forEach((result) => {
      const name = result.player_name;

      if (!byPlayer[name]) {
        byPlayer[name] = {
          totalPoints: 0,
          roundsPlayed: 0,
          bestRound: 0,
          events: new Set<string>(),
        };
      }

      byPlayer[name].totalPoints += Number(
        result.stableford_points ?? 0
      );

      byPlayer[name].roundsPlayed += 1;

      byPlayer[name].bestRound = Math.max(
        byPlayer[name].bestRound,
        Number(result.stableford_points ?? 0)
      );

      byPlayer[name].events.add(result.event_slug);
    });

    return Object.entries(byPlayer)
      .map(([playerName, stats]) => ({
        playerName,
        totalPoints: stats.totalPoints,
        roundsPlayed: stats.roundsPlayed,
        averagePoints:
          stats.roundsPlayed > 0
            ? stats.totalPoints / stats.roundsPlayed
            : 0,
        bestRound: stats.bestRound,
        eventsPlayed: stats.events.size,
      }))
      .sort(
        (a, b) =>
          b.totalPoints - a.totalPoints ||
          b.averagePoints - a.averagePoints ||
          b.bestRound - a.bestRound ||
          a.playerName.localeCompare(b.playerName)
      )
      .map((row, index) => ({
        ...row,
        pos: index + 1,
      }));
  }, [results]);

  const roundGroups = useMemo<RoundGroup[]>(() => {
    const groups: Record<string, RoundGroup> = {};

    results.forEach((result) => {
      const key = `${result.event_slug}-${result.round_number}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          eventSlug: result.event_slug,
          eventName: result.event_name,
          eventDate: result.event_date,
          roundNumber: result.round_number,
          courseName: result.course_name,
          results: [],
        };
      }

      groups[key].results.push(result);
    });

    return Object.values(groups)
      .map((group) => ({
        ...group,
        results: group.results
          .slice()
          .sort(
            (a, b) =>
              Number(b.stableford_points) -
                Number(a.stableford_points) ||
              a.player_name.localeCompare(b.player_name)
          ),
      }))
      .sort((a, b) => {
        const dateA = a.eventDate
          ? new Date(`${a.eventDate}T12:00:00`).getTime()
          : 0;

        const dateB = b.eventDate
          ? new Date(`${b.eventDate}T12:00:00`).getTime()
          : 0;

        return (
          dateB - dateA ||
          b.roundNumber - a.roundNumber
        );
      });
  }, [results]);

  const totalRounds = roundGroups.length;
  const totalPlayers = standings.length;

  const totalStablefordPoints = results.reduce(
    (total, result) =>
      total + Number(result.stableford_points ?? 0),
    0
  );

  const overallAverage =
    results.length > 0
      ? totalStablefordPoints / results.length
      : 0;

  const leader = standings[0];

  const bestAveragePlayer = standings
    .slice()
    .sort(
      (a, b) =>
        b.averagePoints - a.averagePoints ||
        b.totalPoints - a.totalPoints
    )[0];

  function toggleRound(key: string) {
    setOpenRounds((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  if (loading) {
    return (
      <PageContainer className="bg-[#f3f1eb] text-slate-900">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-800" />

            <p className="mt-4 font-black text-green-950">
              Loading Swift Tees standings...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="bg-[#f3f1eb] text-slate-900">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-lg">
        <div className="p-6 md:p-9">
          <Link
            href="/"
            className="text-sm font-black text-lime-300 transition hover:text-lime-200"
          >
            ← Back to home
          </Link>

          <div className="mt-7">
            <div className="inline-flex rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
              🏆 Official Standings
            </div>

            <h1 className="mt-5 text-4xl font-black leading-none tracking-tight md:text-6xl">
              Overall
              <span className="block text-lime-300">
                Leaderboard.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-300 md:text-lg">
              Individual Stableford points from Carden Park 2026
              onwards. Every round adds to the season total.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <HeaderStat
              value={String(totalPlayers)}
              label="Players"
            />

            <HeaderStat
              value={String(totalRounds)}
              label="Rounds"
            />

            <HeaderStat
              value={String(totalStablefordPoints)}
              label="Total Points"
            />

            <HeaderStat
              value={overallAverage.toFixed(1)}
              label="Avg Score"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          QUICK LEADERS
      ====================================================== */}

      {standings.length > 0 && (
        <section className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">
              Current Leader
            </p>

            <div className="mt-3 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-2xl font-black text-green-950">
                  🥇 {leader.playerName}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {leader.roundsPlayed} round
                  {leader.roundsPlayed === 1 ? "" : "s"} played
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-4xl font-black leading-none text-green-900">
                  {leader.totalPoints}
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  points
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">
              Best Average
            </p>

            <div className="mt-3 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-2xl font-black text-green-950">
                  🎯 {bestAveragePlayer.playerName}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Across {bestAveragePlayer.roundsPlayed} round
                  {bestAveragePlayer.roundsPlayed === 1 ? "" : "s"}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-4xl font-black leading-none text-green-900">
                  {bestAveragePlayer.averagePoints.toFixed(1)}
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  avg pts
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          SEASON STANDINGS
      ====================================================== */}

      <section className="mt-7">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
            Season Standings
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <h2 className="text-3xl font-black tracking-[-0.03em] text-green-950">
              The table
            </h2>

            <p className="pb-1 text-[10px] font-bold text-slate-400">
              Total Stableford pts
            </p>
          </div>
        </div>

        {standings.length === 0 ? (
          <div className="rounded-[1.5rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-4xl">
              🏌️
            </p>

            <p className="mt-3 text-xl font-black text-green-950">
              No results yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Results will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.6rem] bg-white shadow-sm ring-1 ring-slate-200">
            {/* MOBILE TABLE HEADER */}

            <div className="grid grid-cols-[42px_1fr_62px] items-center bg-[#07140f] px-3 py-2.5 md:hidden">
              <div className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                Pos
              </div>

              <div className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                Player
              </div>

              <div className="text-right text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                Pts
              </div>
            </div>

            {/* DESKTOP TABLE HEADER */}

            <div className="hidden grid-cols-[70px_1.4fr_100px_110px_110px_100px_100px] items-center bg-[#07140f] px-5 py-3 md:grid">
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Pos
              </div>

              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Player
              </div>

              <div className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Played
              </div>

              <div className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Total
              </div>

              <div className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Average
              </div>

              <div className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Best
              </div>

              <div className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Events
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {standings.map((player) => (
                <div
                  key={player.playerName}
                  className={
                    player.pos === 1
                      ? "bg-[#fffdf2]"
                      : player.pos === 2
                      ? "bg-slate-50/80"
                      : player.pos === 3
                      ? "bg-orange-50/30"
                      : "bg-white"
                  }
                >
                  {/* MOBILE */}

                  <div className="md:hidden">
                    <div className="grid grid-cols-[42px_1fr_62px] items-center px-3 pb-0.5 pt-2.5">
                      <div>
                        <TablePosition position={player.pos} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-black leading-none text-green-950">
                          {player.playerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black leading-none tracking-tight text-green-900">
                          {player.totalPoints}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-[42px_1fr_62px] px-3 pb-2">
                      <div />

                      <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <span>
                          {player.roundsPlayed} played
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span>
                          Avg {player.averagePoints.toFixed(1)}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span>
                          Best {player.bestRound}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[7px] font-black uppercase tracking-[0.13em] text-slate-400">
                          total pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP */}

                  <div className="hidden grid-cols-[70px_1.4fr_100px_110px_110px_100px_100px] items-center px-5 py-4 md:grid">
                    <div>
                      <TablePosition position={player.pos} />
                    </div>

                    <div>
                      <p className="text-base font-black text-green-950">
                        {player.playerName}
                      </p>
                    </div>

                    <div className="text-center text-sm font-bold text-slate-600">
                      {player.roundsPlayed}
                    </div>

                    <div className="text-center">
                      <span className="text-2xl font-black text-green-900">
                        {player.totalPoints}
                      </span>
                    </div>

                    <div className="text-center text-sm font-black text-slate-700">
                      {player.averagePoints.toFixed(1)}
                    </div>

                    <div className="text-center text-sm font-bold text-slate-600">
                      {player.bestRound}
                    </div>

                    <div className="text-center text-sm font-bold text-slate-600">
                      {player.eventsPlayed}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-center text-[9px] font-bold leading-4 text-slate-400">
                Ranked by total points · Average and best round used as
                tie-breakers
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================
          ROUND HISTORY
      ====================================================== */}

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
            Permanent Record
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-[-0.03em] text-green-950">
            Round history
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Every individual Stableford round that contributes to the
            overall standings. Open a round to see the full results.
          </p>
        </div>

        <div className="space-y-3">
          {roundGroups.map((round) => {
            const isOpen = Boolean(openRounds[round.key]);

            const winner = round.results[0];
            const second = round.results[1];
            const third = round.results[2];

            return (
              <div
                key={round.key}
                className="overflow-hidden rounded-[1.6rem] bg-white shadow-sm ring-1 ring-slate-200"
              >
                <button
                  type="button"
                  onClick={() => toggleRound(round.key)}
                  className="w-full text-left"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-green-900">
                            {round.eventName}
                          </span>

                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                            Round {round.roundNumber}
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-black tracking-tight text-green-950 md:text-2xl">
                          {round.courseName ?? "Course"}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {formatDate(round.eventDate)}
                          {" • "}
                          {round.results.length} players
                        </p>
                      </div>

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-green-950 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ↓
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50">
                      {winner && (
                        <PodiumPreview
                          medal="🥇"
                          player={winner.player_name}
                          points={winner.stableford_points}
                        />
                      )}

                      {second && (
                        <PodiumPreview
                          medal="🥈"
                          player={second.player_name}
                          points={second.stableford_points}
                        />
                      )}

                      {third && (
                        <PodiumPreview
                          medal="🥉"
                          player={third.player_name}
                          points={third.stableford_points}
                        />
                      )}
                    </div>

                    <p className="mt-4 text-[10px] font-black text-green-800">
                      {isOpen
                        ? "Hide full results ↑"
                        : "View full results ↓"}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 p-3 md:p-5">
                    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                      <div className="grid grid-cols-[50px_1fr_60px] bg-[#07140f] px-3 py-2.5">
                        <div className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Pos
                        </div>

                        <div className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Player
                        </div>

                        <div className="text-right text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Pts
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {round.results.map((result, index) => (
                          <div
                            key={result.id}
                            className={`grid grid-cols-[50px_1fr_60px] items-center px-3 py-3 ${
                              index === 0
                                ? "bg-[#fffdf2]"
                                : "bg-white"
                            }`}
                          >
                            <div>
                              <SmallPosition position={index + 1} />
                            </div>

                            <div className="font-black text-green-950">
                              {result.player_name}
                            </div>

                            <div className="text-right text-lg font-black text-green-900">
                              {result.stableford_points}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="mt-8 overflow-hidden rounded-[1.7rem] bg-green-950 p-6 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-300">
          How it works
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Every point counts.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-green-100">
          The overall table is ranked by total individual Stableford
          points. Average points per round are shown alongside the total
          so players who attend fewer weekends can still compare their
          scoring level.
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-green-200">
          Scramble points, team points and bonus competitions do not
          count towards these standings.
        </p>
      </section>

      <div className="h-32 md:hidden" />
    </PageContainer>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function HeaderStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <p className="text-2xl font-black text-lime-300 md:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function TablePosition({
  position,
}: {
  position: number;
}) {
  if (position === 1) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm">
        🥇
      </div>
    );
  }

  if (position === 2) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm">
        🥈
      </div>
    );
  }

  if (position === 3) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-sm">
        🥉
      </div>
    );
  }

  return (
    <span className="pl-2 text-sm font-black text-slate-400">
      {position}
    </span>
  );
}

function SmallPosition({
  position,
}: {
  position: number;
}) {
  if (position === 1) return <span className="text-base">🥇</span>;
  if (position === 2) return <span className="text-base">🥈</span>;
  if (position === 3) return <span className="text-base">🥉</span>;

  return (
    <span className="text-xs font-black text-slate-500">
      {position}
    </span>
  );
}

function PodiumPreview({
  medal,
  player,
  points,
}: {
  medal: string;
  player: string;
  points: number;
}) {
  return (
    <div className="min-w-0 px-2 py-3 text-center md:px-4">
      <p className="text-base">
        {medal}
      </p>

      <p className="mt-1 truncate text-[10px] font-black text-green-950 md:text-sm">
        {player}
      </p>

      <p className="mt-0.5 text-xs font-black text-green-800 md:text-sm">
        {points}
      </p>
    </div>
  );
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "Date not recorded";

  const date = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}