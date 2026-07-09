"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { getPlayers } from "@/lib/players";
import { useActiveTournament } from "../hooks/useActiveTournament";
import {
  getScores,
  getScrambleScores,
  getBonusWinners,
} from "@/lib/scores";

import { supabase } from "@/lib/supabase";
import { getLiveMoments, saveLiveMoment } from "@/lib/liveMoments";

function getPositionStorageKey(eventSlug: string) {
  return `swift-tees-${eventSlug}-live-centre-positions`;
}
let EVENT_SLUG = "";
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
  movement: Movement;
  bonusIcons: string[];
  liveIcon: string;
};

type TeamStanding = {
  team: string;
  points: number;
  through: number;
  icon: string;
};

type Moment = {
  icon: string;
  title: string;
  text: string;
  rarity: "common" | "rare" | "major";
};

type LiveMomentRow = Moment & {
  id?: number;
  event_slug: string;
  moment_key: string;
  moment_type: string;
  player_id?: number | null;
  player_name?: string | null;
  team?: string | null;
  round_number?: number | null;
  hole_number?: number | null;
  created_at?: string;
};

type LatestScrambleInfo = {
  playerIds: number[];
  pairNames: string;
  icon: string;
  holeNumber: number;
  points: number;
  roundNumber: number;
};

function movementStyle(icon: string) {
  if (icon === "▲") return "text-green-700";
  if (icon === "▼") return "text-red-600";
  return "text-slate-400";
}

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  if (team === "White") return "bg-white border border-slate-400";
  return "bg-slate-300";
}

function progressText(through: number) {
  if (through >= 18) return "✅ Complete";
  return `Thru ${through}`;
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
      updated_at: score.updated_at,
    })),
    ...scrambleScores.map((score: any) => ({
      round_number: score.round_number,
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
    round: currentRound,
    roundNumber: getRoundNumber(currentRound),
  };
}

function getHolePar(round: any, holeNumber: number) {
  const hole = round?.holes?.find(
    (hole: any) =>
      Number(hole.hole ?? hole.number ?? hole.hole_number) === holeNumber
  );

  return Number(hole?.par ?? 0);
}

function getScoreIconFromGross(gross: number, par: number) {
  if (!par || !gross) return "";

  const scoreToPar = gross - par;

  if (scoreToPar <= -2) return "🦅";
  if (scoreToPar === -1) return "🐦";

  return "";
}

function normaliseBonusType(type: string) {
  const value = String(type ?? "").toLowerCase();

  if (value.includes("longest")) return "Longest Drive";
  if (value.includes("nearest") || value.includes("closest")) return "Nearest Pin";

  return type || "Bonus";
}

function bonusIconForType(type: string) {
  const value = String(type ?? "").toLowerCase();

  if (value.includes("longest")) return "🚀";
  if (value.includes("nearest") || value.includes("closest")) return "🎯";

  return "";
}

function getStoredPositions(eventSlug: string) {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(getPositionStorageKey(eventSlug)) ?? "{}");
  } catch {
    return {};
  }
}

function saveStoredPositions(
  rows: LeaderboardRow[],
  eventSlug: string
) {
  if (typeof window === "undefined") return;

  const positions = Object.fromEntries(
    rows.map((player) => [player.id, player.pos])
  );

  localStorage.setItem(
  getPositionStorageKey(eventSlug),
  JSON.stringify(positions)
);
}

function getLatestStablefordScore(scores: any[]) {
  return scores
    .filter((score: any) => score.score_type === "stableford" && score.player_id)
    .sort(
      (a: any, b: any) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime()
    )[0];
}

function getLatestScrambleScore(scrambleScores: any[]) {
  return scrambleScores
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime()
    )[0];
}

function getPairInfoForScrambleScore(
  scrambleScore: any,
  tournamentSetup: any,
  players: any[]
) {
  if (!scrambleScore) {
    return {
      playerIds: [],
      pairNames: "",
      round: null,
    };
  }

  const roundNumber = Number(scrambleScore.round_number);
  const groupNumber = Number(scrambleScore.group_number);
  const pairNumber = Number(scrambleScore.pair_number);

  const round = tournamentSetup.rounds?.find(
    (round: any) => getRoundNumber(round) === roundNumber
  );

  const group = round?.groups?.find(
    (group: any) => getGroupNumber(group) === groupNumber
  );

  const pair = group?.pairs?.find(
    (pair: any) => Number(pair.pairNumber) === pairNumber
  );

  const playerIds = [pair?.player1_id, pair?.player2_id]
    .map((id: any) => Number(id))
    .filter(Boolean);

  const pairNames = playerIds
    .map((id: number) => players.find((player: any) => Number(player.id) === id)?.name)
    .filter(Boolean)
    .join(" & ");

  return {
    playerIds,
    pairNames,
    round,
  };
}

function getLatestScrambleInfo(
  latestScrambleScore: any,
  tournamentSetup: any,
  players: any[]
): LatestScrambleInfo | null {
  if (!latestScrambleScore) return null;

  const holeNumber = Number(latestScrambleScore.hole_number);
  const gross = Number(latestScrambleScore.gross_score ?? 0);
  const points = Number(latestScrambleScore.points ?? 0);
  const roundNumber = Number(latestScrambleScore.round_number);

  const pairInfo = getPairInfoForScrambleScore(
    latestScrambleScore,
    tournamentSetup,
    players
  );

  if (!pairInfo.pairNames) return null;

  const par = getHolePar(pairInfo.round, holeNumber);
  const icon = getScoreIconFromGross(gross, par);

  return {
    playerIds: pairInfo.playerIds,
    pairNames: pairInfo.pairNames,
    icon,
    holeNumber,
    points,
    roundNumber,
  };
}

function formatPlaceMovement(oldPosition: number | undefined, newPosition: number) {
  if (!oldPosition) {
    return {
      icon: "➖",
      text: "No movement",
    };
  }

  const placesMoved = Number(oldPosition) - newPosition;

  if (placesMoved > 0) {
    return {
      icon: "▲",
      text: `Up ${placesMoved}`,
    };
  }

  if (placesMoved < 0) {
    return {
      icon: "▼",
      text: `Down ${Math.abs(placesMoved)}`,
    };
  }

  return {
    icon: "➖",
    text: "No movement",
  };
}

function getMovementAmount(movement: Movement) {
  const number = Number(movement.text.replace("Up ", "").replace("Down ", ""));
  return Number.isFinite(number) ? number : 0;
}

function buildTeams(rows: LeaderboardRow[]) {
  const teams = rows.reduce<Record<string, TeamStanding>>((acc, player) => {
    const teamName = player.team || "No Team";

    if (!acc[teamName]) {
      acc[teamName] = {
        team: teamName,
        points: 0,
        through: 0,
        icon: "",
      };
    }

    acc[teamName].points += player.points;

    return acc;
  }, {});

  Object.values(teams).forEach((team) => {
    const teamPlayers = rows.filter(
      (player) => (player.team || "No Team") === team.team
    );

    team.through =
      teamPlayers.length > 0
        ? Math.min(...teamPlayers.map((player) => player.through))
        : 0;
  });

  return Object.values(teams)
    .sort((a, b) => b.points - a.points)
    .map((team, index) => ({
      ...team,
      icon: index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉",
    }));
}

function buildLiveStory(
  leaderboard: LeaderboardRow[],
  teamStandings: TeamStanding[],
  savedMoments: LiveMomentRow[]
) {
  const latestMoment = savedMoments[0];
  const leader = leaderboard[0];
  const second = leaderboard[1];
  const teamLeader = teamStandings[0];
  const secondTeam = teamStandings[1];

  if (latestMoment) return `${latestMoment.icon} ${latestMoment.text}`;
  if (!leader) return "Waiting for the first scores to land.";

  const playerGap = second ? leader.points - second.points : 0;
  const teamGap = secondTeam ? teamLeader.points - secondTeam.points : 0;

  if (second && playerGap <= 1) {
    return playerGap === 0
      ? `⚔️ ${leader.name} and ${second.name} are level at the top.`
      : `⚔️ ${leader.name} leads ${second.name} by just ${playerGap} point.`;
  }

  if (secondTeam && teamGap <= 2) {
    return `🥊 ${teamLeader.team} lead ${secondTeam.team} by ${teamGap} points in the team race.`;
  }

  return `👑 ${leader.name} leads on ${leader.points} points. ${
    teamLeader?.team ?? "The leading team"
  } are currently top of the team race.`;
}

function formatWhatsAppMoment(moment: Moment) {
  return `🚨 ${moment.title.toUpperCase()}

${moment.icon} ${moment.text}

#SwiftTees`;
}

function formatCopyText(title: string, text: string) {
  return `🚨 ${title}

${text}

#SwiftTees`;
}

function formatLeaderboardCopy(
  leaderboard: LeaderboardRow[],
  teamStandings: TeamStanding[]
) {
  const playerLines = leaderboard
    .map(
      (player) =>
        `${player.pos}. ${player.name} — ${player.points} pts (${progressText(
          player.through
        )})`
    )
    .join("\n");

  const teamLines = teamStandings
    .map((team) => `${team.icon} ${team.team} — ${team.points} pts`)
    .join("\n");

  return `🏆 Swift Tees Leaderboard

${playerLines}

🥊 Team Race
${teamLines}

#SwiftTees`;
}

function buildLatestStablefordMoment(
  latestStablefordScore: any,
  players: any[],
  currentRound: any,
  leaderboard: LeaderboardRow[]
): LiveMomentRow | null {
  if (!latestStablefordScore) return null;

  const player = players.find(
    (item: any) => Number(item.id) === Number(latestStablefordScore.player_id)
  );

  if (!player) return null;

  const roundNumber = Number(latestStablefordScore.round_number);
  const holeNumber = Number(latestStablefordScore.hole_number);
  const gross = Number(latestStablefordScore.gross_score ?? 0);
  const points = Number(latestStablefordScore.points ?? 0);
  const par = getHolePar(currentRound, holeNumber);
  const scoreIcon = getScoreIconFromGross(gross, par);
  const leaderboardRow = leaderboard.find((row) => Number(row.id) === Number(player.id));

  if (scoreIcon === "🦅") {
    return {
      event_slug: EVENT_SLUG,
      moment_key: `stableford-eagle-${roundNumber}-${player.id}-${holeNumber}`,
      moment_type: "stableford_eagle",
      player_id: Number(player.id),
      player_name: player.name,
      team: player.team || null,
      round_number: roundNumber,
      hole_number: holeNumber,
      icon: "🦅",
      title: "Eagle Alert",
      text: `${player.name} makes eagle on hole ${holeNumber}. Big move.`,
      rarity: "major",
    };
  }

  if (scoreIcon === "🐦") {
    return {
      event_slug: EVENT_SLUG,
      moment_key: `stableford-birdie-${roundNumber}-${player.id}-${holeNumber}`,
      moment_type: "stableford_birdie",
      player_id: Number(player.id),
      player_name: player.name,
      team: player.team || null,
      round_number: roundNumber,
      hole_number: holeNumber,
      icon: "🐦",
      title: "Birdie Alert",
      text: `${player.name} birdies hole ${holeNumber}${
        leaderboardRow ? ` and moves to ${leaderboardRow.points} points` : ""
      }.`,
      rarity: "rare",
    };
  }

  return {
    event_slug: EVENT_SLUG,
    moment_key: `stableford-score-${roundNumber}-${player.id}-${holeNumber}`,
    moment_type: "stableford_score",
    player_id: Number(player.id),
    player_name: player.name,
    team: player.team || null,
    round_number: roundNumber,
    hole_number: holeNumber,
    icon: "⛳",
    title: "Latest Score",
    text: `${player.name} scores ${gross || "saved"} on hole ${holeNumber}${
      points ? ` for ${points} point${points === 1 ? "" : "s"}` : ""
    }.`,
    rarity: "common",
  };
}

function buildLatestScrambleMoment(
  latestScrambleInfo: LatestScrambleInfo | null
): LiveMomentRow | null {
  if (!latestScrambleInfo) return null;

  if (latestScrambleInfo.icon === "🦅") {
    return {
      event_slug: EVENT_SLUG,
      moment_key: `scramble-eagle-${latestScrambleInfo.roundNumber}-${latestScrambleInfo.playerIds.join("-")}-${latestScrambleInfo.holeNumber}`,
      moment_type: "scramble_eagle",
      player_id: null,
      player_name: latestScrambleInfo.pairNames,
      team: null,
      round_number: latestScrambleInfo.roundNumber,
      hole_number: latestScrambleInfo.holeNumber,
      icon: "🦅",
      title: "Scramble Eagle",
      text: `${latestScrambleInfo.pairNames} make eagle on hole ${latestScrambleInfo.holeNumber}.`,
      rarity: "major",
    };
  }

  if (latestScrambleInfo.icon === "🐦") {
    return {
      event_slug: EVENT_SLUG,
      moment_key: `scramble-birdie-${latestScrambleInfo.roundNumber}-${latestScrambleInfo.playerIds.join("-")}-${latestScrambleInfo.holeNumber}`,
      moment_type: "scramble_birdie",
      player_id: null,
      player_name: latestScrambleInfo.pairNames,
      team: null,
      round_number: latestScrambleInfo.roundNumber,
      hole_number: latestScrambleInfo.holeNumber,
      icon: "🐦",
      title: "Scramble Birdie",
      text: `${latestScrambleInfo.pairNames} make birdie on hole ${latestScrambleInfo.holeNumber}.`,
      rarity: "rare",
    };
  }

  return {
    event_slug: EVENT_SLUG,
    moment_key: `scramble-score-${latestScrambleInfo.roundNumber}-${latestScrambleInfo.playerIds.join("-")}-${latestScrambleInfo.holeNumber}`,
    moment_type: "scramble_score",
    player_id: null,
    player_name: latestScrambleInfo.pairNames,
    team: null,
    round_number: latestScrambleInfo.roundNumber,
    hole_number: latestScrambleInfo.holeNumber,
    icon: "🤝",
    title: "Scramble Update",
    text: `${latestScrambleInfo.pairNames} score ${latestScrambleInfo.points} point${
      latestScrambleInfo.points === 1 ? "" : "s"
    } on hole ${latestScrambleInfo.holeNumber}.`,
    rarity: latestScrambleInfo.points >= 4 ? "rare" : "common",
  };
}

function buildBonusMoments(bonusWinners: any[]): LiveMomentRow[] {
  return bonusWinners
    .filter((bonus: any) => bonus.winner_player_name)
    .map((bonus: any) => {
      const bonusType = normaliseBonusType(bonus.bonus_type);
      const icon = bonusIconForType(bonus.bonus_type) || "🎯";
      const roundNumber = Number(bonus.round_number ?? 0);
      const holeNumber = Number(bonus.hole ?? 0);

      return {
        event_slug: EVENT_SLUG,
        moment_key: `bonus-${roundNumber}-${bonusType}-${bonus.winner_player_name}-${holeNumber}`,
        moment_type: "bonus_winner",
        player_id: null,
        player_name: bonus.winner_player_name,
        team: null,
        round_number: roundNumber,
        hole_number: holeNumber,
        icon,
        title: bonusType,
        text: `${bonus.winner_player_name} wins ${bonusType}${
          holeNumber ? ` on hole ${holeNumber}` : ""
        }.`,
        rarity: "rare",
      };
    });
}

function buildMovementMoments(leaderboard: LeaderboardRow[]): LiveMomentRow[] {
  const biggestClimber = leaderboard
    .filter((player) => player.liveIcon === "🔥")
    .sort((a, b) => getMovementAmount(b.movement) - getMovementAmount(a.movement))[0];

  const biggestDrop = leaderboard
    .filter((player) => player.liveIcon === "📉")
    .sort((a, b) => getMovementAmount(b.movement) - getMovementAmount(a.movement))[0];

  const moments: LiveMomentRow[] = [];

  if (biggestClimber && getMovementAmount(biggestClimber.movement) >= 2) {
    moments.push({
      event_slug: EVENT_SLUG,
      moment_key: `movement-up-${biggestClimber.id}-${biggestClimber.pos}`,
      moment_type: "movement_up",
      player_id: biggestClimber.id,
      player_name: biggestClimber.name,
      team: biggestClimber.team || null,
      round_number: null,
      hole_number: null,
      icon: "🔥",
      title: "Big Mover",
      text: `${biggestClimber.name} moves up ${getMovementAmount(
        biggestClimber.movement
      )} places on the leaderboard.`,
      rarity: "rare",
    });
  }

  if (biggestDrop && getMovementAmount(biggestDrop.movement) >= 2) {
    moments.push({
      event_slug: EVENT_SLUG,
      moment_key: `movement-down-${biggestDrop.id}-${biggestDrop.pos}`,
      moment_type: "movement_down",
      player_id: biggestDrop.id,
      player_name: biggestDrop.name,
      team: biggestDrop.team || null,
      round_number: null,
      hole_number: null,
      icon: "📉",
      title: "Losing Ground",
      text: `${biggestDrop.name} drops ${getMovementAmount(
        biggestDrop.movement
      )} places on the leaderboard.`,
      rarity: "rare",
    });
  }

  return moments;
}

function buildBattleMoments(
  leaderboard: LeaderboardRow[],
  teamStandings: TeamStanding[]
): LiveMomentRow[] {
  const moments: LiveMomentRow[] = [];
  const leader = leaderboard[0];
  const second = leaderboard[1];
  const topTeam = teamStandings[0];
  const secondTeam = teamStandings[1];

  if (leader && second && leader.points - second.points <= 1) {
    const gap = leader.points - second.points;

    moments.push({
      event_slug: EVENT_SLUG,
      moment_key: `battle-lead-${leader.id}-${second.id}-${leader.points}-${second.points}`,
      moment_type: "battle_alert",
      player_id: null,
      player_name: `${leader.name} & ${second.name}`,
      team: null,
      round_number: null,
      hole_number: null,
      icon: "⚔️",
      title: "Battle Alert",
      text:
        gap === 0
          ? `${leader.name} and ${second.name} are level on points.`
          : `${leader.name} and ${second.name} are separated by just ${gap} point.`,
      rarity: "rare",
    });
  }

  if (topTeam && secondTeam) {
    const gap = topTeam.points - secondTeam.points;

    if (gap <= 2) {
      moments.push({
        event_slug: EVENT_SLUG,
        moment_key: `team-battle-${topTeam.team}-${secondTeam.team}-${topTeam.points}-${secondTeam.points}`,
        moment_type: "team_battle",
        player_id: null,
        player_name: null,
        team: topTeam.team,
        round_number: null,
        hole_number: null,
        icon: "🥊",
        title: "Team Race Tight",
        text:
          gap === 0
            ? `${topTeam.team} and ${secondTeam.team} are level in the team race.`
            : `${topTeam.team} lead ${secondTeam.team} by only ${gap} point${
                gap === 1 ? "" : "s"
              }.`,
        rarity: "rare",
      });
    }
  }

  return moments;
}

async function saveGeneratedMoments(moments: LiveMomentRow[]) {
  await Promise.all(moments.map((moment) => saveLiveMoment(moment)));
}

export default function LiveCentrePage() {
  const { tournament, loading } = useActiveTournament();
EVENT_SLUG = tournament?.slug ?? "";
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([]);
  const [moments, setMoments] = useState<LiveMomentRow[]>([]);
  const [liveStory, setLiveStory] = useState("Waiting for live scores...");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);

      setTimeout(() => {
        setCopiedKey(null);
      }, 1500);
    } catch (error) {
      console.error("Could not copy:", error);
    }
  }

  async function loadLeaderboard() {
    if (!tournament) return;
  const eventSlug = tournament.slug;
const tournamentSetup = {
  rounds: tournament?.rounds ?? [],
};
const tournamentPlayerIds = new Set(
  tournament.players.map((p: any) => Number(p.id))
);
const [
  players,
  scores,
  scrambleScores,
  bonusWinners,
  savedMoments,
] = await Promise.all([
  getPlayers(),
  getScores(eventSlug),
getScrambleScores(eventSlug),
getBonusWinners(eventSlug),
getLiveMoments(eventSlug),
]);

    const currentRoundInfo = getCurrentRoundInfo(
  tournamentSetup,
  scores,
  scrambleScores
);

    const stablefordScores = scores.filter(
      (score: any) => score.score_type === "stableford" && score.player_id
    );

    const latestStablefordScore = getLatestStablefordScore(stablefordScores);
    const latestScrambleScore = getLatestScrambleScore(scrambleScores);
    const latestScrambleInfo = getLatestScrambleInfo(
      latestScrambleScore,
      tournamentSetup,
      players
    );

    const scramblePointsByPlayerId: Record<number, number> = {};
    const scrambleThroughByPlayerId: Record<number, number> = {};
    const bonusPointsByPlayerName: Record<string, number> = {};
    const bonusIconsByPlayerName: Record<string, string[]> = {};

    bonusWinners.forEach((bonus: any) => {
      if (!bonus.winner_player_name) return;

      bonusPointsByPlayerName[bonus.winner_player_name] =
        (bonusPointsByPlayerName[bonus.winner_player_name] ?? 0) +
        Number(bonus.points ?? 0);

      const icon = bonusIconForType(bonus.bonus_type);

      if (icon) {
        bonusIconsByPlayerName[bonus.winner_player_name] = Array.from(
          new Set([
            ...(bonusIconsByPlayerName[bonus.winner_player_name] ?? []),
            icon,
          ])
        );
      }
    });

    scrambleScores.forEach((scrambleScore: any) => {
      const roundNumber = Number(scrambleScore.round_number);
      const holeNumber = Number(scrambleScore.hole_number);
      const scramblePoints = Number(scrambleScore.points ?? 0);

      const pairInfo = getPairInfoForScrambleScore(
        scrambleScore,
        tournamentSetup,
        players
      );

      pairInfo.playerIds.forEach((playerId: number) => {
        scramblePointsByPlayerId[playerId] =
          (scramblePointsByPlayerId[playerId] ?? 0) + scramblePoints;

        if (roundNumber === currentRoundInfo.roundNumber) {
          scrambleThroughByPlayerId[playerId] = Math.max(
            scrambleThroughByPlayerId[playerId] ?? 0,
            holeNumber
          );
        }
      });
    });

    const rows = players
  .filter((player: any) => tournamentPlayerIds.has(Number(player.id)))
  .map((player: any) => {
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
        movement: {
          icon: "➖",
          text: "No movement",
        },
        bonusIcons: bonusIconsByPlayerName[player.name] ?? [],
        liveIcon: "",
      };
    });

    rows.sort((a, b) => b.points - a.points || b.through - a.through);

    const previousPositions =
  EVENT_SLUG
    ? getStoredPositions(eventSlug)
    : {};

    const rowsWithPositions = rows.map((player, index) => {
      const newPosition = index + 1;

      return {
        ...player,
        pos: newPosition,
        movement: formatPlaceMovement(previousPositions[player.id], newPosition),
      };
    });

    const biggestClimber = rowsWithPositions
      .filter((player) => player.movement.icon === "▲")
      .sort((a, b) => getMovementAmount(b.movement) - getMovementAmount(a.movement))[0];

    const biggestDrop = rowsWithPositions
      .filter((player) => player.movement.icon === "▼")
      .sort((a, b) => getMovementAmount(b.movement) - getMovementAmount(a.movement))[0];

    const latestStablefordPlayerId = latestStablefordScore
      ? Number(latestStablefordScore.player_id)
      : null;

    const latestStablefordIcon = latestStablefordScore
      ? getScoreIconFromGross(
          Number(latestStablefordScore.gross_score ?? 0),
          getHolePar(currentRoundInfo.round, Number(latestStablefordScore.hole_number))
        )
      : "";

    const rowsWithLiveIcons = rowsWithPositions.map((player) => {
      let liveIcon = "";

      if (
        latestStablefordPlayerId &&
        Number(player.id) === latestStablefordPlayerId &&
        latestStablefordIcon
      ) {
        liveIcon = latestStablefordIcon;
      } else if (
        latestScrambleInfo?.playerIds.includes(Number(player.id)) &&
        latestScrambleInfo.icon
      ) {
        liveIcon = latestScrambleInfo.icon;
      } else if (biggestClimber && player.id === biggestClimber.id) {
        liveIcon = "🔥";
      } else if (biggestDrop && player.id === biggestDrop.id) {
        liveIcon = "📉";
      }

      return {
        ...player,
        liveIcon,
      };
    });

    const featuredLivePlayers = rowsWithLiveIcons
      .filter((player) => player.liveIcon)
      .slice(0, 3)
      .map((player) => player.id);

    const finalRows = rowsWithLiveIcons.map((player) => ({
      ...player,
      liveIcon: featuredLivePlayers.includes(player.id) ? player.liveIcon : "",
    }));

    const hasTeams =
  tournament.team_mode === "teams" ||
  tournament.teamMode === "teams";

const sortedTeams = hasTeams ? buildTeams(finalRows) : [];

    const generatedMoments = [
      buildLatestStablefordMoment(
        latestStablefordScore,
        players,
        currentRoundInfo.round,
        finalRows
      ),
      buildLatestScrambleMoment(latestScrambleInfo),
      ...buildBonusMoments(bonusWinners),
      ...buildMovementMoments(finalRows),
      ...buildBattleMoments(finalRows, sortedTeams),
    ].filter(Boolean) as LiveMomentRow[];

    if (generatedMoments.length > 0) {
      await saveGeneratedMoments(generatedMoments);
    }

    const refreshedMoments = await getLiveMoments(EVENT_SLUG);

    setLeaderboard(finalRows);
    setTeamStandings(sortedTeams);
    setMoments(refreshedMoments);
    setLiveStory(buildLiveStory(finalRows, sortedTeams, refreshedMoments));
    setLastUpdatedAt(
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    if (EVENT_SLUG) {
  saveStoredPositions(finalRows, eventSlug);
}
  }

  useEffect(() => {
  if (!loading && tournament) {
    setLeaderboard([]);
    setTeamStandings([]);
    setMoments([]);
    setLiveStory("Waiting for live scores...");
    setLastUpdatedAt("");

    loadLeaderboard();
  }
}, [loading, tournament]);

  useEffect(() => {
  if (!tournament?.slug) return;

  const channel = supabase
    .channel(`live-centre-${tournament.slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores" },
        () => setTimeout(loadLeaderboard, 300)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scramble_scores" },
        () => setTimeout(loadLeaderboard, 300)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bonus_winners" },
        () => setTimeout(loadLeaderboard, 300)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_moments" },
        () => setTimeout(loadLeaderboard, 300)
      )
      .subscribe((status, err) => {
        if (err) console.error("Realtime subscription error:", err);
        console.log("Live Centre realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournament?.slug]);

  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <section className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-green-300">
          🔥 Swift Tees Live
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Live Centre Beta
        </h1>

        {lastUpdatedAt && (
          <p className="mt-2 text-xs font-semibold text-green-200">
            Last updated: {lastUpdatedAt}
          </p>
        )}
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {teamStandings.map((team) => (
            <div
              key={team.team}
              className="rounded-xl bg-slate-50 px-2 py-3 text-center"
            >
              <div className="text-2xl">{team.icon}</div>

              <div className="text-[10px] font-black uppercase text-green-950">
                {team.team}
              </div>

              <div className="mt-1 text-2xl font-black leading-none text-green-950">
                {team.points}
              </div>

              <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                {progressText(team.through)}
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

          <button
            type="button"
            onClick={() =>
              copyText(
                formatLeaderboardCopy(leaderboard, teamStandings),
                "leaderboard"
              )
            }
            className="rounded-full bg-green-950 px-2.5 py-1 text-[10px] font-black text-white"
          >
            {copiedKey === "leaderboard" ? "Copied" : "Copy"}
          </button>
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
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-950 text-sm font-black text-white">
                  {player.pos}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${teamDot(
                        player.team
                      )}`}
                    />

                    <p className="truncate text-base font-black text-green-950">
                      {player.pos === 1 ? "👑 " : ""}
                      {player.name}
                      {player.bonusIcons.length > 0 && (
                        <span className="ml-1">
                          {player.bonusIcons.join("")}
                        </span>
                      )}
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-slate-500">
                    {player.pos === 1
                      ? `Leader • ${progressText(player.through)}`
                      : progressText(player.through)}
                  </p>
                </div>
              </div>

              <div className="ml-2 flex shrink-0 items-center justify-end gap-2">
                {player.liveIcon && (
                  <span className="text-base" title="Live moment">
                    {player.liveIcon}
                  </span>
                )}

                <span
                  title={player.movement.text}
                  className={`text-base font-black ${movementStyle(
                    player.movement.icon
                  )}`}
                >
                  {player.movement.icon}
                </span>

                <p className="min-w-10 text-right text-xl font-black leading-none text-green-950">
                  {player.points}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3">
          <h2 className="text-xl font-black text-green-950">
            🎙️ Moments Feed
          </h2>

          <p className="text-xs font-semibold text-slate-400">
            Pick and choose updates to paste into WhatsApp
          </p>
        </div>

        <div className="mb-3 rounded-2xl border border-amber-300 bg-amber-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-green-700">
                🚨 Live Story
              </p>

              <p className="mt-1 text-sm font-black leading-snug text-green-950">
                {liveStory}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                copyText(formatCopyText("Swift Tees Update", liveStory), "story")
              }
              className="shrink-0 rounded-full bg-green-950 px-2.5 py-1 text-[10px] font-black text-white"
            >
              {copiedKey === "story" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {moments.map((moment, index) => (
            <div
              key={moment.moment_key ?? `${moment.title}-${index}`}
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
                  onClick={() =>
                    copyText(formatWhatsAppMoment(moment), `moment-${index}`)
                  }
                  className="shrink-0 rounded-full bg-green-950 px-2.5 py-1 text-[10px] font-black text-white"
                >
                  {copiedKey === `moment-${index}` ? "Copied" : "Copy"}
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
          href="/live-scoring-v2"
          className="mt-3 flex w-full items-center justify-center rounded-2xl bg-green-700 px-5 py-3.5 text-base font-black text-white"
        >
          Enter Scoring →
        </Link>
      </section>
    </PageContainer>
  );
}