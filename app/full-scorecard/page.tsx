"use client";

import { useCallback, useEffect, useState } from "react";
import { getScores, getScrambleScores, getBonusWinners } from "@/lib/scores";
import { calculateStablefordPoints } from "@/lib/stableford";
import { supabase } from "@/lib/supabase";
import { useActiveTournament } from "../hooks/useActiveTournament";

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  if (team === "White") return "bg-white border border-slate-400";
  if (team === "Red") return "bg-red-500";
  return "bg-slate-300 border border-slate-400";
}

function getBonusHoleNumber(bonus: any) {
  return Number(bonus.hole ?? bonus.holeNumber ?? bonus.hole_number);
}

function GolfScoreMarker({
  gross,
  par,
  size = "normal",
}: {
  gross: number;
  par: number;
  size?: "small" | "normal";
}) {
  const boxSize = size === "small" ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-sm";

  if (!gross) {
    return (
      <span
        className={`flex ${boxSize} items-center justify-center font-bold text-slate-300`}
      >
        –
      </span>
    );
  }

  const relative = gross - par;

  if (relative <= -2) {
    return (
      <span
        className={`relative flex ${boxSize} items-center justify-center rounded-full border-2 border-emerald-700 bg-emerald-50 font-black text-emerald-800`}
      >
        <span className="absolute inset-[3px] rounded-full border border-emerald-500" />
        <span className="relative z-10">{gross}</span>
      </span>
    );
  }

  if (relative === -1) {
    return (
      <span
        className={`flex ${boxSize} items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-50 font-black text-emerald-800`}
      >
        {gross}
      </span>
    );
  }

  if (relative === 0) {
    return (
      <span
        className={`flex ${boxSize} items-center justify-center font-black text-slate-900`}
      >
        {gross}
      </span>
    );
  }

  if (relative === 1) {
    return (
      <span
        className={`flex ${boxSize} items-center justify-center border-2 border-slate-500 bg-white font-black text-slate-800`}
      >
        {gross}
      </span>
    );
  }

  return (
    <span
      className={`relative flex ${boxSize} items-center justify-center border-2 border-slate-700 bg-white font-black text-slate-900`}
    >
      <span className="absolute inset-[3px] border border-slate-400" />
      <span className="relative z-10">{gross}</span>
    </span>
  );
}

export default function LiveScorecardsPage() {
  const [tournamentSetup, setTournamentSetup] = useState<any>(null);
  const [roundId, setRoundId] = useState<number | string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bonusWinners, setBonusWinners] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { tournament, loading } = useActiveTournament();
  const EVENT_SLUG = tournament?.slug ?? "";

  const loadScorecardData = useCallback(async () => {
    try {
      if (!tournament) return;

      const setup = {
        ...tournament,
        rounds:
          tournament.rounds?.map((round: any, roundIndex: number) => ({
            ...round,
            id: round.roundNumber ?? round.id ?? roundIndex + 1,
            roundNumber: round.roundNumber ?? round.id ?? roundIndex + 1,
            day:
              round.day ??
              `Round ${round.roundNumber ?? round.id ?? roundIndex + 1}`,
            course: round.course ?? round.courseName ?? "Course",
            format:
              round.format === "scramble" ||
              round.format === "scramblePairs"
                ? "scramblePairs"
                : "stableford",
            holes: round.holes ?? [],
            groups:
              round.groups?.map((group: any, groupIndex: number) => ({
                ...group,
                id: group.id ?? group.groupNumber ?? groupIndex + 1,
                groupNumber:
                  group.groupNumber ?? group.id ?? groupIndex + 1,
                name: group.name ?? `Group ${groupIndex + 1}`,
                players:
                  group.players?.length
                    ? group.players
                    : tournament.players?.map((player: any) => ({
                        player_id: player.id,
                        name: player.name,
                        team: player.eventTeam ?? "",
                        eventHandicap:
                          player.stablefordHandicap ??
                          player.eventHandicap ??
                          0,
                        stablefordHandicap:
                          player.stablefordHandicap ??
                          player.eventHandicap ??
                          0,
                      })) ?? [],
                pairs:
                  group.pairs?.map((pair: any, pairIndex: number) => {
                    const player1 = tournament.players?.find(
                      (player: any) =>
                        Number(player.id) === Number(pair.player1_id)
                    );

                    const player2 = tournament.players?.find(
                      (player: any) =>
                        Number(player.id) === Number(pair.player2_id)
                    );

                    return {
                      ...pair,
                      id:
                        pair.id ??
                        `${round.roundNumber ?? roundIndex + 1}-${
                          group.groupNumber ?? groupIndex + 1
                        }-${pair.pairNumber ?? pairIndex + 1}`,
                      pairNumber: pair.pairNumber ?? pairIndex + 1,
                      player1: pair.player1 ?? player1?.name ?? "",
                      player2: pair.player2 ?? player2?.name ?? "",
                      finalHandicap:
                        pair.finalHandicap ?? pair.calculatedHandicap ?? 0,
                    };
                  }) ?? [],
              })) ?? [],
          })) ?? [],
      };

      setTournamentSetup(setup);
      setRoundId((current) => current ?? setup.rounds?.[0]?.id ?? null);

      const [savedScores, savedScrambleScores, savedBonuses] =
        await Promise.all([
          getScores(EVENT_SLUG),
          getScrambleScores(EVENT_SLUG),
          getBonusWinners(EVENT_SLUG),
        ]);

      const loadedScores: Record<string, number> = {};

      savedScores.forEach((row: any) => {
        const round = setup.rounds.find(
          (item: any) =>
            Number(item.roundNumber ?? item.id) === Number(row.round_number)
        );

        if (!round) return;

        const group = round.groups.find(
          (item: any) =>
            Number(item.groupNumber ?? item.id) === Number(row.group_number)
        );

        if (!group) return;

        const player = group.players?.find(
          (item: any) => Number(item.player_id) === Number(row.player_id)
        );

        if (!player) return;

        loadedScores[
          `${round.id}-${group.id}-${row.hole_number}-${player.name}`
        ] = Number(row.gross_score);
      });

      savedScrambleScores.forEach((row: any) => {
        const round = setup.rounds.find(
          (item: any) =>
            Number(item.roundNumber ?? item.id) === Number(row.round_number)
        );

        if (!round) return;

        const group = round.groups.find(
          (item: any) =>
            Number(item.groupNumber ?? item.id) === Number(row.group_number)
        );

        if (!group) return;

        const pair = group.pairs?.find(
          (item: any) =>
            Number(item.pairNumber) === Number(row.pair_number)
        );

        if (!pair) return;

        loadedScores[
          `${round.id}-${group.id}-${row.hole_number}-${pair.id}`
        ] = Number(row.gross_score);
      });

      setScores(loadedScores);
      setBonusWinners(savedBonuses ?? []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Could not load scorecard data:", error);
    }
  }, [tournament, EVENT_SLUG]);

  useEffect(() => {
    if (!loading && tournament) {
      loadScorecardData();
    }
  }, [loading, tournament, loadScorecardData]);

  useEffect(() => {
    const channel = supabase
      .channel("live-scorecards-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores" },
        () => setTimeout(loadScorecardData, 200)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scramble_scores" },
        () => setTimeout(loadScorecardData, 200)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bonus_winners" },
        () => setTimeout(loadScorecardData, 200)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadScorecardData]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
        Loading active tournament...
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
        No active tournament selected.
      </main>
    );
  }

  if (!tournamentSetup || !roundId) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
        Loading scorecards...
      </main>
    );
  }

  const currentRound =
    tournamentSetup.rounds.find(
      (round: any) => String(round.id) === String(roundId)
    ) ?? tournamentSetup.rounds[0];

  const isScramble = currentRound.format === "scramblePairs";

  const roundBonusHoles =
    currentRound.bonusHoles ??
    currentRound.bonus_holes ??
    currentRound.bonuses ??
    [];

  function scoreKeyFor(
    groupId: string | number,
    id: string,
    holeNumber: number
  ) {
    return `${currentRound.id}-${groupId}-${holeNumber}-${id}`;
  }

  const scorecardRows = (() => {
    const holes = currentRound.holes ?? [];

    if (isScramble) {
      return currentRound.groups.flatMap((group: any) =>
        (group.pairs ?? []).map((pair: any) => {
          const holeScores = holes.map((holeItem: any) => {
            const gross =
              scores[
                scoreKeyFor(
                  group.id,
                  pair.id,
                  Number(holeItem.hole)
                )
              ] ?? 0;

            const points = gross
              ? calculateStablefordPoints(
                  gross,
                  Number(holeItem.par),
                  Number(holeItem.strokeIndex),
                  Number(pair.finalHandicap ?? 0)
                )
              : 0;

            return {
              hole: Number(holeItem.hole),
              par: Number(holeItem.par),
              strokeIndex: Number(holeItem.strokeIndex),
              gross,
              points,
            };
          });

          return {
            id: `${group.id}-${pair.id}`,
            label: `${pair.player1} + ${pair.player2}`,
            team: "",
            completed: holeScores.filter((item: any) => item.gross > 0)
              .length,
            holeScores,
            grossTotal: holeScores.reduce(
              (total: number, item: any) => total + (item.gross || 0),
              0
            ),
            pointsTotal: holeScores.reduce(
              (total: number, item: any) => total + (item.points || 0),
              0
            ),
          };
        })
      );
    }

    const seenPlayers = new Set<string>();

    return currentRound.groups.flatMap((group: any) =>
      (group.players ?? [])
        .filter((player: any) => {
          const id = String(player.player_id ?? player.name);

          if (seenPlayers.has(id)) return false;

          seenPlayers.add(id);
          return true;
        })
        .map((player: any) => {
          const handicap = Number(
            player.eventHandicap ?? player.stablefordHandicap ?? 0
          );

          const holeScores = holes.map((holeItem: any) => {
            const gross =
              scores[
                scoreKeyFor(
                  group.id,
                  player.name,
                  Number(holeItem.hole)
                )
              ] ?? 0;

            const points = gross
              ? calculateStablefordPoints(
                  gross,
                  Number(holeItem.par),
                  Number(holeItem.strokeIndex),
                  handicap
                )
              : 0;

            return {
              hole: Number(holeItem.hole),
              par: Number(holeItem.par),
              strokeIndex: Number(holeItem.strokeIndex),
              gross,
              points,
            };
          });

          return {
            id: String(player.player_id ?? player.name),
            label: player.name,
            team: player.team ?? "",
            completed: holeScores.filter((item: any) => item.gross > 0)
              .length,
            holeScores,
            grossTotal: holeScores.reduce(
              (total: number, item: any) => total + (item.gross || 0),
              0
            ),
            pointsTotal: holeScores.reduce(
              (total: number, item: any) => total + (item.points || 0),
              0
            ),
          };
        })
    );
  })();

  const rankedRows = [...scorecardRows].sort((a, b) => {
    if (b.pointsTotal !== a.pointsTotal) {
      return b.pointsTotal - a.pointsTotal;
    }

    if (b.completed !== a.completed) {
      return b.completed - a.completed;
    }

    if (!a.grossTotal) return 1;
    if (!b.grossTotal) return -1;

    return a.grossTotal - b.grossTotal;
  });

  const frontNinePar = (currentRound.holes ?? [])
    .filter((item: any) => Number(item.hole) <= 9)
    .reduce(
      (total: number, item: any) => total + Number(item.par ?? 0),
      0
    );

  const backNinePar = (currentRound.holes ?? [])
    .filter((item: any) => Number(item.hole) >= 10)
    .reduce(
      (total: number, item: any) => total + Number(item.par ?? 0),
      0
    );

  const totalPar = frontNinePar + backNinePar;

  const currentRoundBonuses = bonusWinners.filter(
    (bonus: any) =>
      Number(bonus.round_number) ===
      Number(currentRound.roundNumber ?? currentRound.id)
  );

  return (
    <main className="min-h-screen bg-slate-100 p-3 pb-32 text-slate-900 md:p-8 md:pb-16">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-green-700">
            ⛳ Swift Tees
          </p>

          <h1 className="mt-1 text-3xl font-black text-green-950">
            {tournament.name}
          </h1>

          <p className="mt-1 text-sm font-bold text-slate-500">
            Live Round Scorecards
          </p>
        </header>

        {tournamentSetup.rounds.length > 1 && (
          <div
            className="mb-3 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${tournamentSetup.rounds.length}, minmax(0, 1fr))`,
            }}
          >
            {tournamentSetup.rounds.map((round: any) => (
              <button
                key={round.id}
                onClick={() => setRoundId(round.id)}
                className={`min-w-0 rounded-2xl border p-2.5 text-center font-black transition ${
                  String(roundId) === String(round.id)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className="block truncate text-sm">
                  {round.course}
                </span>

                <span className="mt-1 block text-[10px] opacity-75">
                  {round.day} •{" "}
                  {round.format === "scramblePairs"
                    ? "Scramble"
                    : "Stableford"}
                </span>
              </button>
            ))}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 p-4 text-white">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Official scorecard
                </p>

                <h2 className="mt-1 truncate text-2xl font-black">
                  {currentRound.course}
                </h2>

                <p className="mt-1 text-xs font-bold text-white/70">
                  {currentRound.day} •{" "}
                  {isScramble ? "Scramble Pairs" : "Stableford"} • Par{" "}
                  {totalPar}
                </p>
              </div>

              {lastUpdated && (
                <div className="shrink-0 text-right">
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/50">
                    Updated
                  </p>

                  <p className="text-xs font-black">
                    {lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white px-3 py-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <GolfScoreMarker gross={2} par={4} size="small" />
                <span>Eagle+</span>
              </div>

              <div className="flex items-center gap-2">
                <GolfScoreMarker gross={3} par={4} size="small" />
                <span>Birdie</span>
              </div>

              <div className="flex items-center gap-2">
                <GolfScoreMarker gross={4} par={4} size="small" />
                <span>Par</span>
              </div>

              <div className="flex items-center gap-2">
                <GolfScoreMarker gross={5} par={4} size="small" />
                <span>Bogey</span>
              </div>

              <div className="flex items-center gap-2">
                <GolfScoreMarker gross={6} par={4} size="small" />
                <span>Double+</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto overscroll-x-contain">
            <div className="min-w-max">
              <div className="sticky top-0 z-30 flex border-b border-slate-300 bg-slate-100">
                <div className="sticky left-0 z-40 flex w-[136px] shrink-0 items-center border-r border-slate-300 bg-slate-100 px-2 py-2 shadow-[4px_0_8px_rgba(15,23,42,0.08)]">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                      Pos
                    </p>

                    <p className="text-xs font-black text-slate-900">
                      {isScramble ? "Pair" : "Player"}
                    </p>
                  </div>
                </div>

                {(currentRound.holes ?? []).map((holeItem: any) => {
                  const hasBonus = roundBonusHoles.some(
                    (bonus: any) =>
                      getBonusHoleNumber(bonus) ===
                      Number(holeItem.hole)
                  );

                  return (
                    <div
                      key={holeItem.hole}
                      className="w-[48px] shrink-0 border-r border-slate-300 bg-slate-100 px-0.5 py-1.5 text-center"
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="text-xs font-black text-slate-900">
                          {holeItem.hole}
                        </span>

                        {hasBonus && (
                          <span
                            className="text-[8px] text-slate-500"
                            title="Bonus hole"
                          >
                            ★
                          </span>
                        )}
                      </div>

                      <p className="text-[8px] font-bold text-slate-500">
                        P{holeItem.par}
                      </p>

                      <p className="text-[7px] font-bold text-slate-400">
                        SI{holeItem.strokeIndex}
                      </p>
                    </div>
                  );
                })}

                <div className="w-[52px] shrink-0 border-r border-slate-300 bg-slate-200 px-1 py-2 text-center">
                  <p className="text-[10px] font-black text-slate-900">
                    OUT
                  </p>

                  <p className="text-[8px] font-bold text-slate-500">
                    {frontNinePar}
                  </p>
                </div>

                <div className="w-[52px] shrink-0 border-r border-slate-300 bg-slate-200 px-1 py-2 text-center">
                  <p className="text-[10px] font-black text-slate-900">
                    IN
                  </p>

                  <p className="text-[8px] font-bold text-slate-500">
                    {backNinePar}
                  </p>
                </div>

                <div className="w-[58px] shrink-0 border-r border-slate-300 bg-slate-200 px-1 py-2 text-center">
                  <p className="text-[10px] font-black text-slate-900">
                    GROSS
                  </p>
                </div>

                <div className="w-[58px] shrink-0 bg-slate-900 px-1 py-2 text-center">
                  <p className="text-[10px] font-black text-white">
                    PTS
                  </p>
                </div>
              </div>

              {rankedRows.map((row: any, index: number) => {
                const frontGross = row.holeScores
                  .filter((item: any) => item.hole <= 9)
                  .reduce(
                    (total: number, item: any) =>
                      total + (item.gross || 0),
                    0
                  );

                const backGross = row.holeScores
                  .filter((item: any) => item.hole >= 10)
                  .reduce(
                    (total: number, item: any) =>
                      total + (item.gross || 0),
                    0
                  );

                const position = row.completed > 0 ? index + 1 : "–";

                return (
                  <div
                    key={row.id}
                    className="flex border-b border-slate-200 last:border-b-0"
                  >
                    <div className="sticky left-0 z-20 flex w-[136px] shrink-0 items-center gap-1.5 border-r border-slate-200 bg-white px-2 py-2 shadow-[4px_0_8px_rgba(15,23,42,0.08)]">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-black text-slate-900">
                        {position}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          {!isScramble && row.team && (
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${teamDot(
                                row.team
                              )}`}
                            />
                          )}

                          <p className="truncate text-[11px] font-black text-slate-900">
                            {row.label}
                          </p>
                        </div>

                        <div className="mt-1 flex items-center gap-1">
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-1 py-0.5 text-[8px] font-black text-slate-700">
                            {row.pointsTotal} pts
                          </span>

                          <span className="truncate text-[8px] font-black text-slate-500">
                            {row.completed === 18
                              ? "Complete"
                              : `Thru ${row.completed}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {row.holeScores.map((item: any) => {
                      const hasBonus = roundBonusHoles.some(
                        (bonus: any) =>
                          getBonusHoleNumber(bonus) === item.hole
                      );

                      return (
                        <div
                          key={item.hole}
                          className={`flex w-[48px] shrink-0 items-center justify-center border-r border-slate-200 px-0.5 py-1.5 ${
                            hasBonus ? "bg-slate-50" : "bg-white"
                          }`}
                        >
                          <GolfScoreMarker
                            gross={item.gross}
                            par={item.par}
                          />
                        </div>
                      );
                    })}

                    <div className="flex w-[52px] shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 px-1 py-2 text-sm font-black text-slate-900">
                      {frontGross || "–"}
                    </div>

                    <div className="flex w-[52px] shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 px-1 py-2 text-sm font-black text-slate-900">
                      {backGross || "–"}
                    </div>

                    <div className="flex w-[58px] shrink-0 items-center justify-center border-r border-slate-200 bg-white px-1 py-2 text-base font-black text-slate-900">
                      {row.grossTotal || "–"}
                    </div>

                    <div className="flex w-[58px] shrink-0 items-center justify-center bg-slate-900 px-1 py-2 text-lg font-black text-white">
                      {row.pointsTotal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-center text-[10px] font-bold text-slate-500">
              Swipe left for every hole. Player or pair name and running
              points remain fixed.
            </p>
          </div>
        </section>

        {currentRoundBonuses.length > 0 && (
          <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              ★ Round bonus winners
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {currentRoundBonuses.map((bonus: any, index: number) => (
                <div
                  key={`${bonus.hole}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <p className="text-xs font-black text-slate-600">
                    Hole {bonus.hole} • {bonus.bonus_type}
                  </p>

                  <p className="mt-0.5 text-sm font-black text-slate-950">
                    {bonus.winner_player_name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-5 border-t border-slate-200 pt-5">
          <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="/live-centre"
              className="flex min-h-20 flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center shadow-sm transition hover:bg-emerald-100"
            >
              <span className="text-sm font-black text-emerald-800">
                🏆 Leaderboard
              </span>

              <span className="mt-1 text-[11px] font-semibold text-emerald-700/70">
                Follow the live event
              </span>
            </a>

            <a
              href="/live-scoring-v2"
              className="flex min-h-20 flex-col items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3 text-center shadow-sm transition hover:bg-blue-100"
            >
              <span className="text-sm font-black text-blue-800">
                📝 Enter Scores
              </span>

              <span className="mt-1 text-[11px] font-semibold text-blue-700/70">
                Add live hole scores
              </span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
