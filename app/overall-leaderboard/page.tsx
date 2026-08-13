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
              onwards. Total points decide the standings, with
              average points showing who&apos;s making the most of
              every round.
            </p>
          </div>

          {/* SUMMARY */}
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
          <div className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Current Leader
            </p>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-black text-green-950">
                  🥇 {leader.playerName}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {leader.roundsPlayed} round
                  {leader.roundsPlayed === 1 ? "" : "s"} played
                </p>
              </div>

              <div className="text-right">
                <p className="text-4xl font-black leading-none text-green-900">
                  {leader.totalPoints}
                </p>

                <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-400">
                  points
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Best Average
            </p>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-black text-green-950">
                  🎯 {bestAveragePlayer.playerName}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Across {bestAveragePlayer.roundsPlayed} round
                  {bestAveragePlayer.roundsPlayed === 1 ? "" : "s"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-4xl font-black leading-none text-green-900">
                  {bestAveragePlayer.averagePoints.toFixed(1)}
                </p>

                <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-400">
                  avg pts
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          OVERALL STANDINGS
      ====================================================== */}
      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              Season Standings
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
              The table
            </h2>
          </div>

          <p className="hidden text-xs font-semibold text-slate-500 sm:block">
            Ranked by total Stableford points
          </p>
        </div>

        {standings.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-4xl">
              🏌️
            </p>

            <p className="mt-3 text-xl font-black text-green-950">
              No results yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add results to the overall_results table and they&apos;ll
              appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
            {/* DESKTOP HEADER */}
            <div className="hidden grid-cols-[70px_1.5fr_100px_110px_110px_100px_100px] bg-[#07111f] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 md:grid">
              <div>Pos</div>
              <div>Player</div>
              <div className="text-center">Played</div>
              <div className="text-center">Total</div>
              <div className="text-center">Average</div>
              <div className="text-center">Best</div>
              <div className="text-center">Events</div>
            </div>

            <div className="divide-y divide-slate-100">
              {standings.map((player) => (
                <div
                  key={player.playerName}
                  className={`${
                    player.pos === 1
                      ? "bg-amber-50/60"
                      : player.pos <= 3
                      ? "bg-slate-50/60"
                      : "bg-white"
                  }`}
                >
                  {/* MOBILE */}
                  <div className="p-4 md:hidden">
                    <div className="flex items-start gap-3">
                      <PositionBadge position={player.pos} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-black text-green-950">
                              {player.playerName}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {player.roundsPlayed} played
                              {" • "}
                              {player.eventsPlayed} event
                              {player.eventsPlayed === 1 ? "" : "s"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-3xl font-black leading-none text-green-900">
                              {player.totalPoints}
                            </p>

                            <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                              total pts
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <MiniStat
                            label="Average"
                            value={player.averagePoints.toFixed(1)}
                          />

                          <MiniStat
                            label="Best Round"
                            value={`${player.bestRound} pts`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden grid-cols-[70px_1.5fr_100px_110px_110px_100px_100px] items-center px-4 py-4 md:grid">
                    <div>
                      <PositionBadge position={player.pos} />
                    </div>

                    <div>
                      <p className="font-black text-green-950">
                        {player.playerName}
                      </p>
                    </div>

                    <div className="text-center font-bold text-slate-600">
                      {player.roundsPlayed}
                    </div>

                    <div className="text-center">
                      <span className="text-xl font-black text-green-900">
                        {player.totalPoints}
                      </span>
                    </div>

                    <div className="text-center font-black text-slate-700">
                      {player.averagePoints.toFixed(1)}
                    </div>

                    <div className="text-center font-bold text-slate-600">
                      {player.bestRound}
                    </div>

                    <div className="text-center font-bold text-slate-600">
                      {player.eventsPlayed}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ======================================================
          ROUND HISTORY
      ====================================================== */}
      <section className="mt-10">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            Permanent Record
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-green-950">
            Round history
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Every individual Stableford round that contributes to
            the overall standings. Open a round to see exactly where
            everyone&apos;s points came from.
          </p>
        </div>

        <div className="space-y-4">
          {roundGroups.map((round) => {
            const isOpen = Boolean(openRounds[round.key]);

            const winner = round.results[0];
            const second = round.results[1];
            const third = round.results[2];

            return (
              <div
                key={round.key}
                className="overflow-hidden rounded-[1.8rem] bg-white shadow-sm ring-1 ring-slate-200"
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
                          <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-green-900">
                            {round.eventName}
                          </span>

                          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Round {round.roundNumber}
                          </span>
                        </div>

                        <h3 className="mt-3 text-2xl font-black tracking-tight text-green-950">
                          {round.courseName ?? "Course"}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {formatDate(round.eventDate)}
                          {" • "}
                          {round.results.length} players
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-green-950 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ↓
                      </div>
                    </div>

                    {/* PODIUM PREVIEW */}
                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
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

                    <p className="mt-4 text-xs font-black text-green-800">
                      {isOpen
                        ? "Hide full results ↑"
                        : "View full results ↓"}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 px-3 py-3 md:px-5 md:py-5">
                    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                      <div className="grid grid-cols-[55px_1fr_80px] bg-[#07111f] px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-300">
                        <div>Pos</div>
                        <div>Player</div>
                        <div className="text-right">Pts</div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {round.results.map((result, index) => (
                          <div
                            key={result.id}
                            className={`grid grid-cols-[55px_1fr_80px] items-center px-4 py-3 ${
                              index === 0
                                ? "bg-amber-50"
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
          EXPLANATION
      ====================================================== */}
      <section className="mt-8 rounded-[1.8rem] bg-green-950 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-300">
          How it works
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Every point counts.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-green-100">
          The overall table is ranked by total individual
          Stableford points. Average points per round are shown
          alongside the total so players who attend fewer weekends
          can still compare their scoring level fairly.
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
   SMALL COMPONENTS
============================================================ */

function HeaderStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-2xl font-black text-lime-300 md:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function PositionBadge({
  position,
}: {
  position: number;
}) {
  const icon =
    position === 1
      ? "🥇"
      : position === 2
      ? "🥈"
      : position === 3
      ? "🥉"
      : null;

  if (icon) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-slate-200">
        {icon}
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700">
      {position}
    </div>
  );
}

function SmallPosition({
  position,
}: {
  position: number;
}) {
  if (position === 1) return <span className="text-lg">🥇</span>;
  if (position === 2) return <span className="text-lg">🥈</span>;
  if (position === 3) return <span className="text-lg">🥉</span>;

  return (
    <span className="text-sm font-black text-slate-500">
      {position}
    </span>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-100 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-800">
        {value}
      </p>
    </div>
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
    <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-lg">
          {medal}
        </span>

        <span className="truncate text-sm font-black text-green-950">
          {player}
        </span>
      </div>

      <span className="ml-3 shrink-0 font-black text-green-900">
        {points}
      </span>
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