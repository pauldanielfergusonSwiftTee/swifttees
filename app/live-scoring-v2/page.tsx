"use client";

import { useCallback, useEffect, useState } from "react";
import {
  saveHoleScores,
  deleteHoleScores,
  saveBonusWinner,
  getScores,
  getScrambleScores,
  getBonusWinners,
} from "@/lib/scores";

import { calculateStablefordPoints } from "@/lib/stableford";
import { supabase } from "@/lib/supabase";
import { useActiveTournament } from "../hooks/useActiveTournament";


function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  if (team === "White") return "bg-white border border-slate-400";
  return "bg-slate-300 border border-slate-400";
}

function getBonusHoleNumber(bonus: any) {
  return Number(bonus.hole ?? bonus.holeNumber ?? bonus.hole_number);
}

function getBonusType(bonus: any) {
  return bonus.type ?? bonus.bonusType ?? bonus.bonus_type ?? "Bonus";
}

export default function LiveScoringPage() {
  const [tournamentSetup, setTournamentSetup] = useState<any>(null);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [hole, setHole] = useState(1);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bonusWinners, setBonusWinners] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
const { tournament, loading } = useActiveTournament();
const EVENT_SLUG = tournament?.slug ?? "";
  const loadScoringPageData = useCallback(async () => {
    try {
      if (!tournament) return;
console.log("ACTIVE TOURNAMENT PLAYERS:", tournament.players);
const setup = {
  ...tournament,
  rounds: tournament.rounds?.map((round: any) => ({
    ...round,
    id: round.roundNumber,
    day: `Round ${round.roundNumber}`,
    course: round.courseName,
    format: round.format === "scramble" ? "scramblePairs" : "stableford",
    groups: [
      {
        id: 1,
        groupNumber: 1,
        name: "All Players",
        teeTime: "",
        players: tournament.players?.map((player: any) => ({
  player_id: player.id,
  name: player.name,
  team: player.eventTeam,

  eventHandicap:
    player.stablefordHandicap ??
    player.eventHandicap ??
    0,

  stablefordHandicap:
    player.stablefordHandicap ??
    player.eventHandicap ??
    0,

  scrambleHandicap:
    player.scrambleHandicap ??
    0,
})),
        pairs: [],
      },
    ],
  })),
};
      setTournamentSetup(setup);

      const firstRound = setup.rounds?.[0];

if (firstRound && !roundId) {
  setRoundId(firstRound.id);
}

if (firstRound && !selectedGroupId) {
  setSelectedGroupId(firstRound.groups?.[0]?.id ?? 1);
}

      const savedScores = await getScores(EVENT_SLUG);
      const savedScrambleScores = await getScrambleScores(EVENT_SLUG);
      const savedBonuses = await getBonusWinners(EVENT_SLUG);

      const loadedScores: Record<string, number> = {};

      savedScores.forEach((row: any) => {
        const round = setup.rounds.find(
          (r: any) => Number(r.roundNumber ?? r.id) === Number(row.round_number)
        );

        if (!round) return;

        const group = round.groups.find(
          (g: any) => Number(g.groupNumber ?? g.id) === Number(row.group_number)
        );

        if (!group) return;

        const player = group.players?.find(
          (p: any) => Number(p.player_id) === Number(row.player_id)
        );

        if (!player) return;

        loadedScores[`${round.id}-${group.id}-${row.hole_number}-${player.name}`] =
          row.gross_score;
      });

      savedScrambleScores.forEach((row: any) => {
        const round = setup.rounds.find(
          (r: any) => Number(r.roundNumber ?? r.id) === Number(row.round_number)
        );

        if (!round) return;

        const group = round.groups.find(
          (g: any) => Number(g.groupNumber ?? g.id) === Number(row.group_number)
        );

        if (!group) return;

        const pair = group.pairs?.find(
          (p: any) => Number(p.pairNumber) === Number(row.pair_number)
        );

        if (!pair) return;

        loadedScores[`${round.id}-${group.id}-${row.hole_number}-${pair.id}`] =
          row.gross_score;
      });

      const loadedBonuses: Record<string, string> = {};

      savedBonuses.forEach((row: any) => {
        const round = setup.rounds.find(
          (r: any) => Number(r.roundNumber ?? r.id) === Number(row.round_number)
        );

        if (!round) return;

        const winnerName = String(row.winner_player_name ?? "")
          .trim()
          .toLowerCase();

        const winnerPlayer = round.groups
          .flatMap((group: any) => group.players)
          .find(
            (player: any) =>
              String(player.name ?? "").trim().toLowerCase() === winnerName
          );

        if (winnerPlayer?.player_id) {
          loadedBonuses[`${round.id}-${row.hole}`] = String(
            winnerPlayer.player_id
          );
        }
      });

      setScores(loadedScores);
      setBonusWinners(loadedBonuses);
    } catch (error) {
      console.error("Could not load scoring page data:", error);
    }
}, [tournament, EVENT_SLUG]);

  useEffect(() => {
  if (!loading && tournament) {
    loadScoringPageData();
  }
}, [loading, tournament, loadScoringPageData]);

  useEffect(() => {
    const channel = supabase
      .channel("live-scoring-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores" },
        () => setTimeout(loadScoringPageData, 200)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scramble_scores" },
        () => setTimeout(loadScoringPageData, 200)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bonus_winners" },
        () => setTimeout(loadScoringPageData, 200)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadScoringPageData]);

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
      No active tournament selected. Go to Setup V2 and set one active.
    </main>
  );
}

if (!tournamentSetup || !roundId || !selectedGroupId) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
      Loading tournament setup...
    </main>
  );
}

  const currentRound = tournamentSetup.rounds.find(
    (round: any) => round.id === roundId
  );

  const selectedGroup = currentRound.groups.find(
    (group: any) => group.id === selectedGroupId
  );

  const isScramble = currentRound.format === "scramblePairs";
  const currentHole = currentRound.holes.find((item: any) => item.hole === hole);

  const roundBonusHoles =
    currentRound.bonusHoles ??
    currentRound.bonus_holes ??
    currentRound.bonuses ??
    [];

  const bonusHole = roundBonusHoles.find(
    (bonus: any) => getBonusHoleNumber(bonus) === hole
  );

  const allRoundPlayers = currentRound.groups
    .flatMap((group: any) => group.players)
    .filter((player: any) => player?.player_id);

  const uniqueRoundPlayers = Array.from(
    new Map(
      allRoundPlayers.map((player: any) => [String(player.player_id), player])
    ).values()
  );

  function getPlayerNameById(playerId: string) {
    const foundPlayer = uniqueRoundPlayers.find(
      (player: any) => String(player.player_id) === String(playerId)
    ) as any;

    return foundPlayer?.name ?? "";
  }

  function validPlayerId(playerId: any) {
    return Number.isInteger(Number(playerId)) && String(playerId) !== "undefined";
  }

  function scoreKey(id: string, holeNumber = hole) {
    return `${roundId}-${selectedGroupId}-${holeNumber}-${id}`;
  }

  function bonusKey(holeNumber = hole) {
    return `${roundId}-${holeNumber}`;
  }

  function getScore(id: string) {
    return scores[scoreKey(id)] || 0;
  }

  function changeScore(id: string, amount: number) {
    const key = scoreKey(id);
    const currentScore = scores[key] || 0;
    const newScore = Math.max(0, currentScore + amount);

    setScores((current) => {
      const updated = { ...current };

      if (newScore === 0) {
        delete updated[key];
      } else {
        updated[key] = newScore;
      }

      return updated;
    });
  }

  function setScore(id: string, value: string) {
    const key = scoreKey(id);
    const numberValue = Number(value);

    setScores((current) => {
      const updated = { ...current };

      if (!value || numberValue <= 0) {
        delete updated[key];
      } else {
        updated[key] = numberValue;
      }

      return updated;
    });
  }

  function setBonusWinner(playerId: string) {
    setBonusWinners((current) => ({
      ...current,
      [bonusKey()]: playerId,
    }));
  }

  function getBonusWinner(holeNumber = hole) {
    return bonusWinners[bonusKey(holeNumber)] || "";
  }

  async function saveHole() {
    setIsSaving(true);
    setSavedMessage("");

    try {
      let rowsToSave: any[] = [];
      let rowsToDelete: any[] = [];

      if (isScramble) {
        rowsToSave =
          selectedGroup.pairs
            ?.map((pair: any) => {
              const grossScore = getScore(pair.id);

              if (!grossScore) {
                rowsToDelete.push({
                  event_slug: EVENT_SLUG,
                  round_number: currentRound.roundNumber ?? currentRound.id,
                  hole_number: hole,
                  group_number: selectedGroup.groupNumber ?? selectedGroup.id,
                  pair_number: pair.pairNumber,
                });

                return null;
              }

              return {
                event_slug: EVENT_SLUG,
                round_number: currentRound.roundNumber ?? currentRound.id,
                player_id: null,
                hole_number: hole,
                gross_score: grossScore,
                group_number: selectedGroup.groupNumber ?? selectedGroup.id,
                pair_number: pair.pairNumber,
                score_type: "scramblePairs",
                points: calculateStablefordPoints(
                  grossScore,
                  currentHole.par,
                  currentHole.strokeIndex,
                  pair.finalHandicap
                ),
                event_handicap: pair.finalHandicap,
              };
            })
            .filter(Boolean) ?? [];
      } else {
        rowsToSave = selectedGroup.players
          .map((player: any) => {
            const grossScore = getScore(player.name);

            if (!grossScore) {
              if (validPlayerId(player.player_id)) {
                rowsToDelete.push({
                  event_slug: EVENT_SLUG,
                  round_number: currentRound.roundNumber ?? currentRound.id,
                  player_id: player.player_id,
                  hole_number: hole,
                });
              }

              return null;
            }

            if (!validPlayerId(player.player_id)) return null;

            return {
              event_slug: EVENT_SLUG,
              round_number: currentRound.roundNumber ?? currentRound.id,
              player_id: player.player_id,
              hole_number: hole,
              gross_score: grossScore,
              group_number: selectedGroup.groupNumber ?? selectedGroup.id,
              pair_number: null,
              score_type: "stableford",
              points: calculateStablefordPoints(
                grossScore,
                currentHole.par,
                currentHole.strokeIndex,
                player.eventHandicap
              ),
              event_handicap: player.eventHandicap,
            };
          })
          .filter(Boolean);
      }

      if (rowsToDelete.length > 0) {
        await deleteHoleScores(rowsToDelete);
      }

      if (rowsToSave.length > 0) {
        await saveHoleScores(rowsToSave);
      }

      if (bonusHole && getBonusWinner()) {
        await saveBonusWinner({
          event_slug: EVENT_SLUG,
          round_number: currentRound.roundNumber ?? currentRound.id,
          hole,
          bonus_type: getBonusType(bonusHole),
          winner_player_name: getPlayerNameById(getBonusWinner()),
          points: bonusHole.points ?? 0,
        });
      }

      const bonusMessage =
        bonusHole && getBonusWinner()
          ? ` Bonus winner: ${getPlayerNameById(getBonusWinner())}.`
          : "";

      const formatMessage = isScramble ? "scramble scores" : "scorecards";

      setSavedMessage(
        `${currentRound.day} ${currentRound.course} — Hole ${hole} ${formatMessage} saved.${bonusMessage}`
      );

      if (hole < 18) {
        setTimeout(() => {
          setHole((current) => current + 1);
          setSavedMessage("");
        }, 800);
      }
    } catch (error: any) {
      console.error(error);
      setSavedMessage(
        `❌ Could not save hole ${hole}. ${error.message || "Please try again."}`
      );
    } finally {
      setIsSaving(false);
    }
  }

  function holeHasScores(holeNumber: number) {
    if (isScramble) {
      return selectedGroup.pairs?.some(
        (pair: any) => scores[scoreKey(pair.id, holeNumber)]
      );
    }

    return selectedGroup.players.some(
      (player: any) => scores[scoreKey(player.name, holeNumber)]
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 pb-64 text-slate-900 md:p-8 md:pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3">
          <h1 className="text-2xl font-black text-green-950">
            {currentRound.course} • {selectedGroup.name}
          </h1>
        </div>

        <div className="mb-3 space-y-2">
          {tournamentSetup.rounds.length > 1 && (
  <div className="flex flex-wrap justify-center gap-3">
    {tournamentSetup.rounds.map((round: any) => (
              <button
                key={round.id}
                onClick={() => {
                  setRoundId(round.id);
                  setSelectedGroupId(round.groups?.[0]?.id ?? null);
                  setHole(1);
                  setSavedMessage("");
                }}
                className={`rounded-2xl border p-2 text-center font-black ${
                  roundId === round.id
                    ? "border-green-900 bg-green-950 text-white"
                    : "border-slate-200 bg-white text-green-950"
                }`}
              >
                <span className="block text-sm">{round.course}</span>
                <span className="mt-1 block text-[11px] opacity-80">
                  {round.day} •{" "}
                  {round.format === "scramblePairs"
                    ? "Scramble"
                    : "Stableford"}
                </span>
              </button>
                       ))}
          </div>
)}

          {currentRound.groups.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3">
            {currentRound.groups.map((group: any) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setSavedMessage("");
                }}
                className={`rounded-2xl border p-2 text-center font-black ${
                  selectedGroupId === group.id
                    ? "border-green-900 bg-green-950 text-white"
                    : "border-slate-200 bg-white text-green-950"
                }`}
              >
                <span className="block text-sm">{group.name}</span>
                <span className="mt-1 block text-[11px] opacity-80">
                  {group.teeTime}
                </span>
              </button>
                      ))}
          </div>
          )}
        </div>

        <section className="rounded-3xl border border-green-900 bg-green-950 p-3 text-white shadow-sm">
          <div className="mb-3 text-center">
            <h2 className="text-4xl font-black leading-none">
              {currentRound.course.replace(" Course", "")} - Hole {hole}
            </h2>

            <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-white/10 px-3 py-1">
                Par {currentHole.par}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1">
                SI {currentHole.strokeIndex}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1">
                {currentHole.yards} yds
              </span>
            </div>

            <div className="mt-3 grid grid-cols-9 gap-1.5">
              {currentRound.holes.map((item: any) => {
                const holeNumber = item.hole;
                const hasScores = holeHasScores(holeNumber);
                const hasBonus = roundBonusHoles.some(
                  (bonus: any) => getBonusHoleNumber(bonus) === holeNumber
                );

                return (
                  <button
                    key={holeNumber}
                    onClick={() => {
                      setHole(holeNumber);
                      setSavedMessage("");
                    }}
                    className={`relative rounded-lg border py-2 text-sm font-black ${
                      hole === holeNumber
                        ? "border-white bg-white text-green-950"
                        : hasScores
                        ? "border-green-400 bg-green-500 text-white"
                        : "border-white/20 bg-white/10 text-white"
                    }`}
                  >
                    <span>{holeNumber}</span>

                    {hasBonus && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-300 text-[9px] font-black text-green-950 ring-1 ring-white">
                        ⭐
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {bonusHole && (
              <div className="mt-3 rounded-2xl bg-yellow-300 px-3 py-2 text-sm font-black text-green-950">
                <p>
                  ⭐ Bonus Hole • {getBonusType(bonusHole)}
                  {bonusHole.points ? ` • ${bonusHole.points} pts` : ""}
                </p>

                <select
                  value={getBonusWinner()}
                  onChange={(e) => setBonusWinner(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-yellow-500 bg-white px-3 py-2 font-black text-green-950"
                >
                  <option value="">Select bonus winner</option>

                  {uniqueRoundPlayers.map((player: any) => (
                    <option key={player.player_id} value={String(player.player_id)}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {!isScramble &&
              selectedGroup.players.map((player: any) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-white p-2.5 text-green-950"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${teamDot(
                        player.team
                      )}`}
                    />

                    <div className="min-w-0">
                      <label className="block truncate text-lg font-black">
                        {player.name}
                      </label>

                      <p className="text-xs font-bold text-slate-500">
                        {player.team || "No Team"} • HCP{" "}
                        {player.eventHandicap}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => changeScore(player.name, -1)}
                      className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-xl font-black"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={getScore(player.name) || ""}
                      onChange={(e) => setScore(player.name, e.target.value)}
                      className="w-14 rounded-xl border border-slate-300 px-2 py-1.5 text-center text-2xl font-black"
                      placeholder="-"
                    />

                    <button
                      onClick={() => changeScore(player.name, 1)}
                      className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-xl font-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

            {isScramble &&
              selectedGroup.pairs?.map((pair: any) => (
                <div
                  key={pair.id}
                  className="rounded-2xl bg-white p-2.5 text-green-950"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-green-700">
                        👥 Pair {pair.pairNumber}
                      </p>

                      <p className="truncate text-lg font-black text-green-950">
                        {pair.player1} + {pair.player2}
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {pair.finalHandicap} HCP
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => changeScore(pair.id, -1)}
                        className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-xl font-black"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={getScore(pair.id) || ""}
                        onChange={(e) => setScore(pair.id, e.target.value)}
                        className="w-14 rounded-xl border border-slate-300 px-2 py-1.5 text-center text-2xl font-black"
                        placeholder="-"
                      />

                      <button
                        onClick={() => changeScore(pair.id, 1)}
                        className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 text-xl font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {savedMessage && (
            <p className="mt-3 rounded-xl bg-green-600 px-3 py-2 text-center text-sm font-bold">
              {savedMessage.startsWith("❌")
                ? savedMessage
                : `✅ ${savedMessage}`}
            </p>
          )}
        </section>

        <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <button
            onClick={saveHole}
            disabled={isSaving}
            className="w-full rounded-2xl bg-green-700 px-5 py-3.5 text-lg font-black text-white shadow-sm disabled:opacity-60"
          >
            {isSaving
              ? "Saving..."
              : isScramble
              ? `Save Hole ${hole} Scramble Scores`
              : `Save Hole ${hole} Scorecards`}
          </button>

          <div className="mt-2 grid grid-cols-1 gap-2">
            <a
              href="/match-centre"
              className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-green-950 shadow-sm transition hover:border-green-700"
            >
              🏆 Leaderboard
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}