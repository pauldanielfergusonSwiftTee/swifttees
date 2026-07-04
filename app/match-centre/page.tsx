"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { getPlayers } from "@/lib/players";
import {
  getScores,
  getScrambleScores,
  getBonusWinners,
} from "@/lib/scores";
import { getTournamentSetupForUI } from "@/lib/tournaments";
import { supabase } from "@/lib/supabase";

const EVENT_SLUG = "carden-park-2026";

type Movement = {
  icon: string;
  text: string;
};

type LeaderboardRow = {
  pos: number;
  id: number;
  name: string;
  team: string;
  points: number;
  through: number;
  courseLabel: string;
  movement: Movement;
  highlight: string;
};

type TeamStanding = {
  team: string;
  points: number;
  through: number;
  courseLabel: string;
  icon: string;
};

const commentary = [
  {
    time: "2 mins ago",
    text: "🤣 Adam's 309-yard drive has now entered official Swift Tees folklore.",
  },
  {
    time: "5 mins ago",
    text: "🔥 Gav's birdie on 7 cuts Paul's lead to a single point.",
  },
  {
    time: "8 mins ago",
    text: "⚔️ Wrighty and Liam remain inseparable heading into the toughest stretch.",
  },
  {
    time: "12 mins ago",
    text: "🎂 Stu is quietly hanging around mid-table. Birthday pressure clearly not getting to him yet.",
  },
];

function movementStyle(icon: string) {
  if (icon === "▲" || icon === "🚀") return "text-green-700";
  if (icon === "▼" || icon === "📉") return "text-red-600";
  if (icon === "👑") return "text-yellow-600";
  return "text-slate-400";
}

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  if (team === "White") return "bg-white border border-slate-400";
  return "bg-slate-300";
}

function courseShortName(course: string) {
  return course?.replace(" Course", "") || "Live";
}

function progressText(courseLabel: string, through: number) {
  if (through >= 18) return `${courseLabel} • Finished ✅`;
  return `${courseLabel} • Thru ${through}`;
}

function getRoundNumber(round: any) {
  return Number(round.roundNumber ?? round.round_number ?? round.id);
}

function getGroupNumber(group: any) {
  return Number(group.groupNumber ?? group.group_number ?? group.id);
}

function getCurrentRoundInfo(
  tournamentSetup: any,
  scores: any[],
  scrambleScores: any[]
) {
  const allRows = [
    ...scores.map((score: any) => ({
      round_number: score.round_number,
      hole_number: score.hole_number,
      updated_at: score.updated_at,
    })),
    ...scrambleScores.map((score: any) => ({
      round_number: score.round_number,
      hole_number: score.hole_number,
      updated_at: score.updated_at,
    })),
  ];

  const latestRow = allRows
    .filter((row: any) => row.round_number)
    .sort(
      (a: any, b: any) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime()
    )[0];

  const fallbackRound = tournamentSetup?.rounds?.[0];

  const currentRound =
    tournamentSetup?.rounds?.find(
      (round: any) => getRoundNumber(round) === Number(latestRow?.round_number)
    ) ?? fallbackRound;

  return {
    roundNumber: getRoundNumber(currentRound),
    courseLabel: courseShortName(currentRound?.course),
  };
}

export default function MatchCentrePage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([]);
  const previousPositionsRef = useRef<Record<number, number>>({});

  async function loadLeaderboard() {
    const [
  players,
  scores,
  scrambleScores,
  bonusWinners,
  tournamentSetup,
] = await Promise.all([
  getPlayers(),
  getScores(EVENT_SLUG),
  getScrambleScores(EVENT_SLUG),
  getBonusWinners(EVENT_SLUG),
  getTournamentSetupForUI(),
]);

    const currentRoundInfo = getCurrentRoundInfo(
      tournamentSetup,
      scores,
      scrambleScores
    );

    const stablefordScores = scores.filter(
      (score: any) => score.score_type === "stableford" && score.player_id
    );

    const scramblePointsByPlayerId: Record<number, number> = {};
    const scrambleThroughByPlayerId: Record<number, number> = {};
const bonusPointsByPlayerName: Record<string, number> = {};

bonusWinners.forEach((bonus: any) => {
  if (!bonus.winner_player_name) return;

  bonusPointsByPlayerName[bonus.winner_player_name] =
    (bonusPointsByPlayerName[bonus.winner_player_name] ?? 0) +
    Number(bonus.points ?? 0);
});

    scrambleScores.forEach((scrambleScore: any) => {
      const roundNumber = Number(scrambleScore.round_number);
      const groupNumber = Number(scrambleScore.group_number);
      const pairNumber = Number(scrambleScore.pair_number);
      const holeNumber = Number(scrambleScore.hole_number);
      const scramblePoints = Number(scrambleScore.points ?? 0);

      const round = tournamentSetup.rounds?.find(
        (round: any) => getRoundNumber(round) === roundNumber
      );

      const group = round?.groups?.find(
        (group: any) => getGroupNumber(group) === groupNumber
      );

      const pair = group?.pairs?.find(
        (pair: any) => Number(pair.pairNumber) === pairNumber
      );

      const playerIds = [pair?.player1_id, pair?.player2_id].filter(Boolean);

      playerIds.forEach((playerId: any) => {
        scramblePointsByPlayerId[Number(playerId)] =
          (scramblePointsByPlayerId[Number(playerId)] ?? 0) + scramblePoints;

        if (roundNumber === currentRoundInfo.roundNumber) {
          scrambleThroughByPlayerId[Number(playerId)] = Math.max(
            scrambleThroughByPlayerId[Number(playerId)] ?? 0,
            holeNumber
          );
        }
      });
    });

    const rows = players.map((player: any) => {
      const playerScores = stablefordScores.filter(
        (score: any) => Number(score.player_id) === Number(player.id)
      );

      const stablefordPoints = playerScores.reduce(
        (total: number, score: any) => total + Number(score.points ?? 0),
        0
      );

      const currentRoundPlayerScores = playerScores.filter(
        (score: any) =>
          Number(score.round_number) === Number(currentRoundInfo.roundNumber)
      );

      const stablefordThrough =
        currentRoundPlayerScores.length > 0
          ? Math.max(
              ...currentRoundPlayerScores.map((score: any) =>
                Number(score.hole_number)
              )
            )
          : 0;

      const scramblePoints = scramblePointsByPlayerId[Number(player.id)] ?? 0;
      const bonusPoints = bonusPointsByPlayerName[player.name] ?? 0;
      const scrambleThrough =
        scrambleThroughByPlayerId[Number(player.id)] ?? 0;

      return {
        id: player.id,
        name: player.name,
        team: player.team || "",
        points: stablefordPoints + scramblePoints + bonusPoints,
        through: Math.max(stablefordThrough, scrambleThrough),
        courseLabel: currentRoundInfo.courseLabel,
        movement: {
          icon: "—",
          text: "No movement",
        },
        highlight: "",
      };
    });

    rows.sort((a, b) => b.points - a.points || b.through - a.through);

    const previousPositions = previousPositionsRef.current;

    const rowsWithPositions = rows.map((player, index) => {
      const newPosition = index + 1;
      const oldPosition = previousPositions[player.id];

      let movement = {
        icon: "—",
        text: "No movement",
      };

      if (oldPosition) {
        const placesMoved = oldPosition - newPosition;

        if (newPosition === 1 && oldPosition !== 1) {
          movement = {
            icon: "👑",
            text: "Took the lead",
          };
        } else if (placesMoved >= 3) {
          movement = {
            icon: "🚀",
            text: `Up ${placesMoved}`,
          };
        } else if (placesMoved > 0) {
          movement = {
            icon: "▲",
            text: `Up ${placesMoved}`,
          };
        } else if (placesMoved <= -3) {
          movement = {
            icon: "📉",
            text: `Down ${Math.abs(placesMoved)}`,
          };
        } else if (placesMoved < 0) {
          movement = {
            icon: "▼",
            text: `Down ${Math.abs(placesMoved)}`,
          };
        }
      }

      return {
        ...player,
        pos: newPosition,
        movement,
      };
    });

    setLeaderboard(rowsWithPositions);

    previousPositionsRef.current = Object.fromEntries(
      rowsWithPositions.map((player) => [player.id, player.pos])
    );

    const teams = rowsWithPositions.reduce<Record<string, TeamStanding>>(
      (acc, player) => {
        const teamName = player.team || "No Team";

        if (!acc[teamName]) {
          acc[teamName] = {
            team: teamName,
            points: 0,
            through: 0,
            courseLabel: player.courseLabel,
            icon: "",
          };
        }

        acc[teamName].points += player.points;

        return acc;
      },
      {}
    );

    Object.values(teams).forEach((team) => {
      const teamPlayers = rowsWithPositions.filter(
        (player) => (player.team || "No Team") === team.team
      );

      team.through =
        teamPlayers.length > 0
          ? Math.min(...teamPlayers.map((player) => player.through))
          : 0;

      team.courseLabel = currentRoundInfo.courseLabel;
    });

    const sortedTeams = Object.values(teams)
      .sort((a, b) => b.points - a.points)
      .map((team, index) => ({
        ...team,
        icon: index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉",
      }));

    setTeamStandings(sortedTeams);
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("match-centre-scores-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
        },
        () => {
          loadLeaderboard();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scramble_scores",
        },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Realtime subscription error:", err);
        }

        console.log("Match Centre realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <section className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-green-300">
          🔥 Match Hub - Carden Park
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Leaderboards
        </h1>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {teamStandings.map((team) => (
            <div
              key={team.team}
              className="rounded-xl bg-slate-50 py-2 text-center"
            >
              <div className="text-base">{team.icon}</div>

              <div className="text-[10px] font-black uppercase text-green-950">
                {team.team}
              </div>

              <div className="text-lg font-black leading-none text-green-950">
                {team.points}
              </div>

              <div className="mt-0.5 text-[10px] font-semibold text-slate-900">
                {progressText(team.courseLabel, team.through)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-green-700">
            🚨 BREAKING NEWS
          </p>

          <p className="mt-0.5 text-sm font-black leading-snug text-green-950">
            Gav's birdie on 7 cuts Paul's lead to one point.
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-green-950">🎙️ Live Feed</h2>
            <p className="text-[10px] text-slate-400">
              Updates instantly as scores are entered
            </p>
          </div>

          <span className="animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
            ● LIVE
          </span>
        </div>

        <div className="mt-2 space-y-2">
          {commentary.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-xl bg-slate-50 px-3 py-2"
            >
              <span className="min-w-14 text-[10px] font-bold text-slate-400">
                {item.time}
              </span>

              <p className="text-xs leading-5 text-slate-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-green-950">
            🏆 Live Leaderboard
          </h2>
        </div>

        <div className="space-y-2">
          {leaderboard.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${
                player.pos === 1
                  ? "border border-yellow-300 bg-yellow-50"
                  : "bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-950 text-sm font-black text-white">
                  {player.pos}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${teamDot(player.team)}`}
                    />

                    <p className="text-base font-black text-green-950">
                      {player.name}
                    </p>

                    {player.movement.icon !== "—" && (
                      <span
                        title={player.movement.text}
                        className={`text-base font-black ${movementStyle(
                          player.movement.icon
                        )}`}
                      >
                        {player.movement.icon}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-500">
                    {player.pos === 1
                      ? `🔥 Current Leader • ${progressText(
                          player.courseLabel,
                          player.through
                        )}`
                      : progressText(player.courseLabel, player.through)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                {player.highlight && (
                  <span className="text-base">{player.highlight}</span>
                )}

                <p className="min-w-8 text-lg font-black text-green-950">
                  {player.points}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-black text-green-950">
          ⚔️ Current Battle
        </h2>

        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-green-700">
            Battle of the Moment
          </p>

          <p className="mt-1 text-xl font-black text-green-950">Paul vs Gav</p>

          <p className="mt-1 text-sm font-bold text-slate-600">
            Just 1 point separates them heading into the next stretch.
          </p>
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-black text-green-950">📝 Live Scoring</h2>

        <p className="mt-1 text-sm text-slate-600">
          For nominated scorers only. Enter hole-by-hole scores for your group.
        </p>

        <Link
          href="/events/carden-park-2026/live-leaderboard/live-scoring"
          className="mt-3 flex w-full items-center justify-center rounded-2xl bg-green-700 px-5 py-3.5 text-base font-black text-white"
        >
          Enter Scoring →
        </Link>
      </section>
    </PageContainer>
  );
}