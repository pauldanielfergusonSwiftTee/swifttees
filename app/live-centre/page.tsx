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

type Moment = {
  icon: string;
  title: string;
  text: string;
  rarity: "common" | "rare" | "major";
};

type BattleCard = {
  icon: string;
  label: string;
  title: string;
  text: string;
};

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

function getClosestBattle(leaderboard: LeaderboardRow[]) {
  let bestBattle: { a: LeaderboardRow; b: LeaderboardRow; gap: number } | null =
    null;

  for (let i = 0; i < leaderboard.length - 1; i++) {
    const a = leaderboard[i];
    const b = leaderboard[i + 1];
    const gap = Math.abs(a.points - b.points);

    if (!bestBattle || gap < bestBattle.gap) {
      bestBattle = { a, b, gap };
    }
  }

  return bestBattle;
}

function buildLiveStory(
  leaderboard: LeaderboardRow[],
  teamStandings: TeamStanding[]
) {
  const leader = leaderboard[0];
  const second = leaderboard[1];
  const teamLeader = teamStandings[0];
  const secondTeam = teamStandings[1];

  if (!leader) return "Waiting for the first scores to land.";

  const playerGap = second ? leader.points - second.points : 0;
  const teamGap = secondTeam ? teamLeader.points - secondTeam.points : 0;

  const biggestMover = leaderboard.find(
    (player) => player.movement.icon === "🚀" || player.movement.icon === "👑"
  );

  if (leader.movement.icon === "👑") {
    return `👑 ${leader.name} has taken the lead on ${leader.points} points.`;
  }

  if (second && playerGap <= 1) {
    return `⚔️ ${leader.name} leads ${second.name} by just ${
      playerGap || 0
    } point. This is properly tight.`;
  }

  if (secondTeam && teamGap <= 2) {
    return `🥊 ${teamLeader.team} lead ${secondTeam.team} by ${teamGap} points in the team race.`;
  }

  if (biggestMover) {
    return `${biggestMover.movement.icon} ${biggestMover.name}: ${biggestMover.movement.text}. The leaderboard is moving.`;
  }

  return `👑 ${leader.name} leads on ${leader.points} points. ${
    teamLeader?.team ?? "The leading team"
  } are currently top of the team race.`;
}

function buildBattleCards(
  leaderboard: LeaderboardRow[]
): BattleCard[] {
  const cards: BattleCard[] = [];
  const leader = leaderboard[0];
  const second = leaderboard[1];
  const closestBattle = getClosestBattle(leaderboard);

  if (closestBattle) {
    cards.push({
      icon: "⚔️",
      label: "Battle of the Day",
      title: `${closestBattle.a.name} vs ${closestBattle.b.name}`,
      text:
        closestBattle.gap === 0
          ? "Level on points. Nothing between them."
          : `Just ${closestBattle.gap} point${
              closestBattle.gap === 1 ? "" : "s"
            } separates them.`,
    });
  }

  if (leader) {
    cards.push({
      icon: "👑",
      label: "Current Leader",
      title: leader.name,
      text: `${leader.name} leads on ${leader.points} points.`,
    });
  }

  const biggestClimber = leaderboard.find(
    (player) => player.movement.icon === "🚀" || player.movement.icon === "▲"
  );

  if (biggestClimber) {
    cards.push({
      icon: biggestClimber.movement.icon,
      label: "Biggest Climber",
      title: biggestClimber.name,
      text: biggestClimber.movement.text,
    });
  }

  if (leader && second) {
    const gap = leader.points - second.points;

    cards.push({
      icon: "👀",
      label: "One to Watch",
      title: second.name,
      text:
        gap === 0
          ? `${second.name} is tied with ${leader.name}.`
          : `${second.name} is ${gap} behind ${leader.name}.`,
    });
  }

  return cards.slice(0, 4);
}

function normaliseBonusType(type: string) {
  const value = String(type ?? "").toLowerCase();

  if (value.includes("longest")) return "Longest Drive";
  if (value.includes("nearest") || value.includes("closest")) {
    return "Nearest Pin";
  }

  return type || "Bonus";
}

function buildMoments(
  leaderboard: LeaderboardRow[],
  teamStandings: TeamStanding[],
  bonusWinners: any[]
): Moment[] {
  const moments: Moment[] = [];
  const leader = leaderboard[0];
  const second = leaderboard[1];
  const topTeam = teamStandings[0];
  const secondTeam = teamStandings[1];

  if (leader?.movement.icon === "👑") {
    moments.push({
      icon: "👑",
      title: "Lead Change",
      text: `${leader.name} has moved into the overall lead on ${leader.points} points.`,
      rarity: "major",
    });
  }

  if (leader && second && leader.points - second.points <= 1) {
    moments.push({
      icon: "⚔️",
      title: "Battle Alert",
      text: `${leader.name} and ${second.name} are separated by just ${
        leader.points - second.points
      } point.`,
      rarity: "rare",
    });
  }

  leaderboard
    .filter((player) => player.movement.icon === "🚀")
    .slice(0, 2)
    .forEach((player) => {
      moments.push({
        icon: "🚀",
        title: "Big Climber",
        text: `${player.name} is charging up the leaderboard. ${player.movement.text}.`,
        rarity: "rare",
      });
    });

  if (topTeam && secondTeam) {
    const gap = topTeam.points - secondTeam.points;

    if (gap <= 2) {
      moments.push({
        icon: "🥊",
        title: "Team Race Tight",
        text: `${topTeam.team} lead ${secondTeam.team} by only ${gap} point${
          gap === 1 ? "" : "s"
        }.`,
        rarity: "rare",
      });
    }
  }

  bonusWinners
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
        new Date(a.updated_at ?? a.created_at ?? 0).getTime()
    )
    .slice(0, 8)
    .forEach((bonus: any) => {
      if (!bonus.winner_player_name) return;

      const bonusType = normaliseBonusType(bonus.bonus_type);

      moments.push({
        icon: "🎯",
        title: bonusType,
        text: `${bonus.winner_player_name} wins ${bonusType}${
          bonus.hole ? ` on hole ${bonus.hole}` : ""
        }.`,
        rarity: "rare",
      });
    });

  const finishedPlayers = leaderboard.filter((player) => player.through >= 18);

  finishedPlayers.slice(0, 3).forEach((player, index) => {
    moments.push({
      icon: index === 0 ? "🏁" : "✅",
      title: index === 0 ? "First Player Finished" : "Round Complete",
      text: `${player.name} has finished the round on ${player.points} points.`,
      rarity: index === 0 ? "major" : "rare",
    });
  });

  if (leader && second && leader.points - second.points >= 5) {
    moments.push({
      icon: "💪",
      title: "Leader Pulling Away",
      text: `${leader.name} has opened up a ${leader.points - second.points} point lead at the top.`,
      rarity: "rare",
    });
  }

  if (!moments.length && leader) {
    moments.push({
      icon: "⛳",
      title: "Live Centre Active",
      text: `${leader.name} currently leads on ${leader.points} points. More moments will appear as the round develops.`,
      rarity: "common",
    });
  }

  return moments.slice(0, 15);
}

function formatWhatsAppMoment(moment: Moment) {
  return `🚨 ${moment.title.toUpperCase()}

${moment.icon} ${moment.text}
`;
}

export default function LiveCentrePage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([]);
  const [liveStory, setLiveStory] = useState("Waiting for live scores...");
  const [battleCards, setBattleCards] = useState<BattleCard[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const previousPositionsRef = useRef<Record<number, number>>({});

  async function copyMoment(moment: Moment, index: number) {
    const text = formatWhatsAppMoment(moment);

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (error) {
      console.error("Could not copy moment:", error);
    }
  }

  async function loadLeaderboard() {
    const [players, scores, scrambleScores, bonusWinners, tournamentSetup] =
      await Promise.all([
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
      const scrambleThrough = scrambleThroughByPlayerId[Number(player.id)] ?? 0;

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

    setLeaderboard(rowsWithPositions);
    setTeamStandings(sortedTeams);
    setLiveStory(buildLiveStory(rowsWithPositions, sortedTeams));
    setBattleCards(buildBattleCards(rowsWithPositions));
    setMoments(buildMoments(rowsWithPositions, sortedTeams, bonusWinners));
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("live-centre-v2-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
        },
        () => {
          setTimeout(() => {
            loadLeaderboard();
          }, 200);
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
          setTimeout(() => {
            loadLeaderboard();
          }, 200);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bonus_winners",
        },
        () => {
          setTimeout(() => {
            loadLeaderboard();
          }, 200);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Realtime subscription error:", err);
        }

        console.log("Live Centre realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <section className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-green-300">
          🔥 Swift Tees Live
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Live Centre Beta
        </h1>

      
      </section>

      <section className="mt-3 rounded-3xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-wide text-green-700">
          🚨 Breaking
        </p>

        <p className="mt-1 text-lg font-black leading-snug text-green-950">
          {liveStory}
        </p>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-xl font-black text-green-950">🥊 Team Race</h2>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {teamStandings.map((team) => (
            <div
              key={team.team}
              className="rounded-xl bg-slate-50 px-2 py-3 text-center"
            >
              <div className="text-lg">{team.icon}</div>

              <div className="text-[10px] font-black uppercase text-green-950">
                {team.team}
              </div>

              <div className="mt-1 text-xl font-black leading-none text-green-950">
                {team.points}
              </div>

              <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                {progressText(team.courseLabel, team.through)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-green-950">
            🏆 Live Leaderboard
          </h2>

          <span className="animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
            ● LIVE
          </span>
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
                      ? `👑 Leader • ${progressText(
                          player.courseLabel,
                          player.through
                        )}`
                      : progressText(player.courseLabel, player.through)}
                  </p>
                </div>
              </div>

              <p className="min-w-8 text-right text-lg font-black text-green-950">
                {player.points}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3">
          <h2 className="text-xl font-black text-green-950">
            ⚔️ Current Battles
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            Auto-generated from live scores
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {battleCards.map((card, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-green-700">
                {card.icon} {card.label}
              </p>

              <p className="mt-1 text-base font-black text-green-950">
                {card.title}
              </p>

              <p className="mt-1 text-xs font-bold leading-5 text-slate-600">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-green-950">
              🎙️ Moments Feed
            </h2>

            <p className="text-xs font-semibold text-slate-400">
              Rare moments only — ready to paste into WhatsApp
            </p>
          </div>
        </div>

        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {moments.map((moment, index) => (
            <div
              key={`${moment.title}-${index}`}
              className={`rounded-2xl border border-l-4 p-3 transition-all ${
                moment.rarity === "major"
                  ? "border-yellow-300 bg-yellow-50"
                  : moment.rarity === "rare"
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-green-700">
                    {moment.icon} {moment.title}
                  </p>

                  <p className="mt-1 text-sm font-black leading-snug text-green-950">
                    {moment.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyMoment(moment, index)}
                  className="shrink-0 rounded-full bg-green-950 px-3 py-1.5 text-[10px] font-black text-white"
                >
                  {copiedIndex === index ? "Copied ✅" : "📋 WhatsApp"}
                </button>
              </div>
            </div>
          ))}
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