"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { getPlayers } from "@/lib/players";
import { useActiveTournament } from "../hooks/useActiveTournament";
import {
  getScores,
  getScrambleScores,
  getBonusWinners,
} from "@/lib/scores";

import {
  buildCommentary,
  getRunningJokeForPlayer,
} from "@/lib/commentary/commentaryEngine";

import { supabase } from "@/lib/supabase";
import { getLiveMoments, saveLiveMoment } from "@/lib/liveMoments";
import {
  buildStablefordEvent,
  buildScrambleEvent,
} from "@/lib/commentary/eventBuilders";

import type {
  CommentaryTier,
  CommentaryEventType,
  CommentaryEvent,
} from "@/lib/commentary/types";

function getPositionStorageKey(eventSlug: string) {
  return `swift-tees-${eventSlug}-live-centre-positions`;
}

function getMovementStorageKey(eventSlug: string) {
  return `swift-tees-${eventSlug}-live-centre-movement`;
}

function getScoreSignatureStorageKey(eventSlug: string) {
  return `swift-tees-${eventSlug}-live-centre-score-signature`;
}
function getCopiedMomentsStorageKey(eventSlug: string) {
  return `swift-tees-${eventSlug}-copied-moments`;
}

function getStoredCopiedMoments(eventSlug: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(
      localStorage.getItem(getCopiedMomentsStorageKey(eventSlug)) ?? "[]"
    );
  } catch {
    return [];
  }
}

function saveStoredCopiedMoments(
  eventSlug: string,
  copiedMomentKeys: string[]
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    getCopiedMomentsStorageKey(eventSlug),
    JSON.stringify(copiedMomentKeys)
  );
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

type ScramblePairStanding = {
  pairKey: string;
  playerIds: number[];
  pairNames: string;
  points: number;
  through: number;
  pos: number;
};

function movementStyle(icon: string) {
  if (icon === "▲") return "text-green-700";
  if (icon === "▼") return "text-red-600";
  return "text-slate-400";
}

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  if (team === "Red") return "bg-red-500";
  if (team === "White") return "bg-white border border-slate-400";
  return "bg-slate-300";
}

function formatOrdinal(position: number) {
  const remainder100 = position % 100;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return `${position}th`;
  }

  switch (position % 10) {
    case 1:
      return `${position}st`;

    case 2:
      return `${position}nd`;

    case 3:
      return `${position}rd`;

    default:
      return `${position}th`;
  }
}

function progressText(through: number) {
  if (through >= 18) return "✅ Complete";
  return `Thru ${through}`;
}

function formatLiveRoundDate(dateValue: string) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
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

function getStoredPairStandings(eventSlug: string) {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem(
        `swift-tees-${eventSlug}-pair-positions`
      ) ?? "{}"
    );
  } catch {
    return {};
  }
}

function saveStoredPairStandings(
  standings: ScramblePairStanding[],
  eventSlug: string
) {
  if (typeof window === "undefined") return;

  const data = Object.fromEntries(
    standings.map((pair) => [
      pair.pairKey,
      {
        pos: pair.pos,
        points: pair.points,
      },
    ])
  );

  localStorage.setItem(
    `swift-tees-${eventSlug}-pair-positions`,
    JSON.stringify(data)
  );
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

function getStoredMovement(eventSlug: string): Record<string, Movement> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem(getMovementStorageKey(eventSlug)) ?? "{}"
    );
  } catch {
    return {};
  }
}

function saveStoredMovement(
  rows: LeaderboardRow[],
  eventSlug: string
) {
  if (typeof window === "undefined") return;

  const movement = Object.fromEntries(
    rows.map((player) => [String(player.id), player.movement])
  );

  localStorage.setItem(
    getMovementStorageKey(eventSlug),
    JSON.stringify(movement)
  );
}

function clearStoredLeaderboardState(eventSlug: string) {
  if (typeof window === "undefined") return;

  localStorage.removeItem(getPositionStorageKey(eventSlug));
  localStorage.removeItem(getMovementStorageKey(eventSlug));
  localStorage.removeItem(getScoreSignatureStorageKey(eventSlug));
  localStorage.removeItem(getCopiedMomentsStorageKey(eventSlug));
  localStorage.removeItem(
  `swift-tees-${eventSlug}-pair-positions`
);
}

function buildScoreSignature(
  scores: any[],
  scrambleScores: any[],
  bonusWinners: any[]
) {
  const stablefordSignature = scores
    .map(
      (score: any) =>
        [
          score.id,
          score.round_number,
          score.player_id,
          score.hole_number,
          score.gross_score,
          score.points,
          score.updated_at,
        ].join("-")
    )
    .sort()
    .join("|");

  const scrambleSignature = scrambleScores
    .map(
      (score: any) =>
        [
          score.id,
          score.round_number,
          score.group_number,
          score.pair_number,
          score.hole_number,
          score.gross_score,
          score.points,
          score.updated_at,
        ].join("-")
    )
    .sort()
    .join("|");

  const bonusSignature = bonusWinners
    .map(
      (bonus: any) =>
        [
          bonus.id,
          bonus.round_number,
          bonus.hole,
          bonus.bonus_type,
          bonus.winner_player_name,
          bonus.points,
          bonus.updated_at,
        ].join("-")
    )
    .sort()
    .join("|");

  return `${stablefordSignature}::${scrambleSignature}::${bonusSignature}`;
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

function buildScramblePairStandings(
  scrambleScores: any[],
  tournamentSetup: any,
  players: any[],
  currentRoundNumber: number
): ScramblePairStanding[] {
  const pairs: Record<
    string,
    Omit<ScramblePairStanding, "pos">
  > = {};

  scrambleScores
    .filter(
      (score: any) =>
        Number(score.round_number) ===
        Number(currentRoundNumber)
    )
    .forEach((score: any) => {
      const pairInfo = getPairInfoForScrambleScore(
        score,
        tournamentSetup,
        players
      );

      if (
        pairInfo.playerIds.length === 0 ||
        !pairInfo.pairNames
      ) {
        return;
      }

      const pairKey = pairInfo.playerIds
        .slice()
        .sort((a, b) => a - b)
        .join("-");

      if (!pairs[pairKey]) {
        pairs[pairKey] = {
          pairKey,
          playerIds: pairInfo.playerIds,
          pairNames: pairInfo.pairNames,
          points: 0,
          through: 0,
        };
      }

      pairs[pairKey].points += Number(score.points ?? 0);

      pairs[pairKey].through = Math.max(
        pairs[pairKey].through,
        Number(score.hole_number ?? 0)
      );
    });

  return Object.values(pairs)
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.through - a.through
    )
    .map((pair, index) => ({
      ...pair,
      pos: index + 1,
    }));
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

function commentaryTierToRarity(
  tier: CommentaryTier
): Moment["rarity"] {
  if (tier === "major" || tier === "rare") {
    return "major";
  }

  if (tier === "notable") {
    return "rare";
  }

  return "common";
}

function stablefordMomentType(eventType: CommentaryEventType) {
  switch (eventType) {
    case "eagle":
      return "stableford_eagle";

    case "birdie":
      return "stableford_birdie";

    case "bogey":
      return "stableford_bogey";

    case "double_bogey_or_worse":
      return "stableford_disaster";

    case "par":
    default:
      return "stableford_score";
  }
}

function formatWhatsAppMoment(moment: Moment) {
  return `🚨 ${moment.title.toUpperCase()}

${moment.icon} ${moment.text}

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
  leaderboard: LeaderboardRow[],
  previousPositions: Record<string, number>,
  scoreStateChanged: boolean
): LiveMomentRow | null {
  if (!latestStablefordScore) return null;

  const player = players.find(
    (item: any) =>
      Number(item.id) === Number(latestStablefordScore.player_id)
  );

  if (!player) return null;

  const leaderboardRow = leaderboard.find(
    (row) => Number(row.id) === Number(player.id)
  );

  if (!leaderboardRow) return null;

  const commentaryEvent = buildStablefordEvent(
    latestStablefordScore,
    {
      ...player,
      team: leaderboardRow.team ?? player.team ?? "",
    },
    currentRound
  );

  if (!commentaryEvent) return null;

  const positionAfter = leaderboardRow.pos;

  const storedPositionBefore =
    previousPositions[String(player.id)] ??
    previousPositions[player.id as unknown as string];

  const positionBefore =
    typeof storedPositionBefore === "number"
      ? storedPositionBefore
      : undefined;

  const placesMoved =
    typeof positionBefore === "number"
      ? positionBefore - positionAfter
      : 0;

  const leaderPoints = leaderboard[0]?.points ?? leaderboardRow.points;

  const leaderGap = Math.max(
    0,
    Number(leaderPoints) - Number(leaderboardRow.points)
  );

  const playersOnSamePoints = leaderboard.filter(
    (row) => Number(row.points) === Number(leaderboardRow.points)
  );

  const isJointLeader =
    positionAfter === 1 && playersOnSamePoints.length > 1;

  const isNewLeader =
    scoreStateChanged &&
    positionAfter === 1 &&
    typeof positionBefore === "number" &&
    positionBefore > 1;

  const totalHoles =
    Array.isArray(currentRound?.holes) && currentRound.holes.length > 0
      ? currentRound.holes.length
      : 18;

  const holesCompleted = Number(commentaryEvent.holeNumber ?? 0);

  const holesRemaining = Math.max(0, totalHoles - holesCompleted);

  let tournamentStage: CommentaryEvent["tournamentStage"] = "middle";

  if (holesCompleted <= 1) {
    tournamentStage = "opening";
  } else if (holesCompleted <= 5) {
    tournamentStage = "early";
  } else if (holesRemaining === 0) {
    tournamentStage = "complete";
  } else if (holesRemaining === 1) {
    tournamentStage = "final_hole";
  } else if (holesRemaining <= 4) {
    tournamentStage = "closing";
  }

  const contextualEvent: CommentaryEvent = {
    ...commentaryEvent,

    positionBefore,
    positionAfter,
    placesMoved,
    leaderGap,
    isNewLeader,
    isJointLeader,
    tournamentStage,
    holesCompleted,
    holesRemaining,
  };

  const commentary = buildCommentary(contextualEvent);

  const roundNumber = contextualEvent.roundNumber;
  const holeNumber = contextualEvent.holeNumber;

  let momentKey =
    `stableford-score-${roundNumber}-${player.id}-${holeNumber}`;

  if (contextualEvent.eventType === "birdie") {
    momentKey =
      `stableford-birdie-${roundNumber}-${player.id}-${holeNumber}`;
  }

  if (contextualEvent.eventType === "eagle") {
    momentKey =
      `stableford-eagle-${roundNumber}-${player.id}-${holeNumber}`;
  }

  return {
    event_slug: EVENT_SLUG,
    moment_key: momentKey,
    moment_type: stablefordMomentType(contextualEvent.eventType),

    player_id: Number(player.id),
    player_name: player.name,
    team: leaderboardRow.team ?? player.team ?? null,

    round_number: roundNumber,
    hole_number: holeNumber,

    icon: commentary.icon,
    title: commentary.title,
    text: commentary.text,

    rarity: commentaryTierToRarity(commentary.tier),
  };
}

function getScramblePersonalityName(
  latestScrambleInfo: LatestScrambleInfo | null,
  players: any[]
) {
  if (!latestScrambleInfo?.playerIds?.length) return null;

  const personalityIndex =
    latestScrambleInfo.holeNumber % latestScrambleInfo.playerIds.length;

  const selectedPlayerId =
    latestScrambleInfo.playerIds[personalityIndex];

  return (
    players.find(
      (player: any) =>
        Number(player.id) === Number(selectedPlayerId)
    )?.name ?? null
  );
}

function buildLatestScrambleMoment(
  latestScrambleInfo: LatestScrambleInfo | null,
  players: any[],
  pairStandings: ScramblePairStanding[],
  previousPairStandings: Record<
    string,
    {
      pos: number;
      points: number;
    }
  >,
  scoreStateChanged: boolean
): LiveMomentRow | null {
  if (!scoreStateChanged) return null;

  const commentaryEvent = buildScrambleEvent(latestScrambleInfo);

  if (!commentaryEvent || !latestScrambleInfo) {
    return null;
  }

  // Keep routine scramble pars and bogeys out of the commentary feed.
  if (commentaryEvent.eventType === "scramble_score") {
    return null;
  }

  const personalityName = getScramblePersonalityName(
  latestScrambleInfo,
  players
);

const personalityEvent: CommentaryEvent = {
  ...commentaryEvent,
  playerName: personalityName ?? commentaryEvent.playerName,
};

const commentary = buildCommentary(personalityEvent);

  const pairKey = latestScrambleInfo.playerIds
    .slice()
    .sort((a, b) => a - b)
    .join("-");

  const currentPair = pairStandings.find(
    (pair) => pair.pairKey === pairKey
  );

  const previousPair = previousPairStandings[pairKey];

  const topPoints = pairStandings[0]?.points ?? 0;

  const jointLeaders = pairStandings.filter(
    (pair) => pair.points === topPoints
  );

  const isJointLeader =
    Boolean(currentPair) &&
    currentPair!.points === topPoints &&
    jointLeaders.length > 1;

  const movedUpBy =
    previousPair && currentPair
      ? previousPair.pos - currentPair.pos
      : 0;

  const previousStandingsEntries = Object.entries(
    previousPairStandings
  );

  const previousTopPoints =
    previousStandingsEntries.length > 0
      ? Math.max(
          ...previousStandingsEntries.map(
            ([, standing]) => Number(standing.points ?? 0)
          )
        )
      : 0;

  const previousGapToLead =
    previousPair && previousTopPoints > 0
      ? Math.max(
          0,
          previousTopPoints - Number(previousPair.points ?? 0)
        )
      : null;

  const currentGapToLead =
    currentPair
      ? Math.max(0, topPoints - currentPair.points)
      : null;

  const gapReducedBy =
    previousGapToLead !== null &&
    currentGapToLead !== null
      ? previousGapToLead - currentGapToLead
      : 0;

  const scoreWord =
    commentaryEvent.eventType === "scramble_eagle"
      ? "eagle"
      : "birdie";

  let title = commentary.title;
  let text = commentary.text;
  let icon = commentary.icon;
  let rarity = commentaryTierToRarity(commentary.tier);

  let momentType =
    commentaryEvent.eventType === "scramble_eagle"
      ? "scramble_eagle"
      : "scramble_birdie";

  /*
   * Story priority:
   *
   * 1. Take the lead
   * 2. Join the lead
   * 3. Cut the gap to one
   * 4. Meaningfully reduce the lead
   * 5. Move up the table
   * 6. Extend an existing lead
   * 7. Standard birdie/eagle commentary
   */

  if (
    currentPair &&
    previousPair &&
    previousPair.pos > 1 &&
    currentPair.pos === 1 &&
    !isJointLeader
  ) {
    icon = "🏆";
    title = "New Leaders";

    text = `${currentPair.pairNames} ${scoreWord} hole ${
      latestScrambleInfo.holeNumber
    } to take the outright lead on ${currentPair.points} points.`;

    rarity = "major";
    momentType = "scramble_lead_taken";
  } else if (
    currentPair &&
    isJointLeader &&
    (!previousPair || previousPair.pos > 1)
  ) {
    icon = "⚔️";
    title = "Tied at the Top";

    text = `${currentPair.pairNames} ${scoreWord} hole ${
      latestScrambleInfo.holeNumber
    } to join the lead on ${currentPair.points} points.`;

    rarity = "major";
    momentType = "scramble_lead_joined";
  } else if (
    currentPair &&
    previousPair &&
    currentPair.pos > 1 &&
    currentGapToLead === 1 &&
    previousGapToLead !== null &&
    previousGapToLead > 1
  ) {
    icon = "👀";
    title = "Pressure Building";

    text = `${currentPair.pairNames} ${scoreWord} hole ${
      latestScrambleInfo.holeNumber
    } and cut the gap to a single point. The leaders can hear the footsteps.`;

    rarity = "major";
    momentType = "scramble_gap_cut_to_one";
  } else if (
    currentPair &&
    previousPair &&
    currentPair.pos > 1 &&
    gapReducedBy >= 2 &&
    currentGapToLead !== null
  ) {
    icon = "🔥";
    title = "Closing the Gap";

    text = `${currentPair.pairNames} ${scoreWord} hole ${
      latestScrambleInfo.holeNumber
    } and reduce the deficit by ${gapReducedBy} points. They are now ${
      currentGapToLead === 0
        ? "level at the top"
        : `${currentGapToLead} point${
            currentGapToLead === 1 ? "" : "s"
          } behind`
    }.`;

    rarity = currentGapToLead <= 2 ? "major" : "rare";
    momentType = "scramble_gap_reduced";
  } else if (
    currentPair &&
    previousPair &&
    movedUpBy >= 1
  ) {
    icon = movedUpBy >= 2 ? "🚀" : "🔥";

    title =
      movedUpBy >= 2
        ? "Flying Up the Table"
        : "Pair on the Move";

    text = `${currentPair.pairNames} ${scoreWord} hole ${
      latestScrambleInfo.holeNumber
    } and climb ${
      movedUpBy === 1
        ? "one place"
        : `${movedUpBy} places`
    } into ${formatOrdinal(currentPair.pos)}.`;

    rarity = movedUpBy >= 2 ? "major" : "rare";
    momentType = "scramble_movement_up";
  } else if (
    currentPair &&
    previousPair &&
    currentPair.pos === 1 &&
    previousPair.pos === 1 &&
    pairStandings[1]
  ) {
    const lead =
      currentPair.points - pairStandings[1].points;

    const previousSecondHighestPoints = previousStandingsEntries
      .filter(([storedPairKey]) => storedPairKey !== pairKey)
      .map(([, standing]) => Number(standing.points ?? 0))
      .sort((a, b) => b - a)[0] ?? 0;

    const previousLead =
      Number(previousPair.points ?? 0) -
      previousSecondHighestPoints;

    if (lead > previousLead && lead > 0) {
      icon = "🏆";
      title = "Lead Extended";

      text = `${currentPair.pairNames} ${scoreWord} hole ${
        latestScrambleInfo.holeNumber
      } and stretch their advantage to ${lead} point${
        lead === 1 ? "" : "s"
      }.`;

      rarity = lead >= 3 ? "major" : "rare";
      momentType = "scramble_lead_extended";
    }
  }

if (personalityName) {
  const shouldAddRunningJoke =
    latestScrambleInfo.holeNumber % 5 === 0;

  if (shouldAddRunningJoke) {
    const runningJoke = getRunningJokeForPlayer(
      personalityName,
      commentaryEvent.eventKey
    );

    if (runningJoke) {
      text = `${text} ${runningJoke}`;
    }
  }
}

  const sortedPlayerIds = latestScrambleInfo.playerIds
    .slice()
    .sort((a, b) => a - b)
    .join("-");

  const momentKey = `${
    commentaryEvent.eventType === "scramble_eagle"
      ? "scramble-eagle"
      : "scramble-birdie"
  }-${latestScrambleInfo.roundNumber}-${sortedPlayerIds}-${
    latestScrambleInfo.holeNumber
  }`;

  return {
    event_slug: EVENT_SLUG,
    moment_key: momentKey,
    moment_type: momentType,

    player_id: null,
    player_name: latestScrambleInfo.pairNames,
    team: null,

    round_number: latestScrambleInfo.roundNumber,
    hole_number: latestScrambleInfo.holeNumber,

    icon,
    title,
    text,
    rarity,
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
  teamStandings: TeamStanding[],
  currentRound: any
): LiveMomentRow[] {
  if (
    currentRound?.format === "scramblePairs" ||
    currentRound?.format === "scramble"
  ) {
    return [];
  }

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
  
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
const [copiedMomentKeys, setCopiedMomentKeys] = useState<string[]>([]);
const [lastUpdatedAt, setLastUpdatedAt] = useState("");
const [currentRound, setCurrentRound] = useState<any>(null);
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
async function copyMoment(moment: LiveMomentRow, index: number) {
  try {
    await navigator.clipboard.writeText(
      formatWhatsAppMoment(moment)
    );

    const momentKey =
      moment.moment_key ?? `${moment.title}-${index}`;

    setCopiedKey(`moment-${index}`);

    setCopiedMomentKeys((current) => {
      const updated = current.includes(momentKey)
        ? current
        : [...current, momentKey];

      if (tournament?.slug) {
        saveStoredCopiedMoments(
          tournament.slug,
          updated
        );
      }

      return updated;
    });

    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  } catch (error) {
    console.error("Could not copy moment:", error);
  }
}




  const loadLeaderboard = useCallback(async () => {
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
setCurrentRound(currentRoundInfo.round ?? null);
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
const scramblePairStandings =
  buildScramblePairStandings(
    scrambleScores,
    tournamentSetup,
    players,
    currentRoundInfo.roundNumber
  );

  const previousPairStandings =
  getStoredPairStandings(eventSlug);
 
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
        team:
  tournament.players?.find(
    (tournamentPlayer: any) =>
      Number(tournamentPlayer.id) === Number(player.id)
  )?.eventTeam ??
  player.team ??
  "",
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

   const hasScoringActivity =
  stablefordScores.length > 0 ||
  scrambleScores.length > 0 ||
  bonusWinners.length > 0;

const currentScoreSignature = buildScoreSignature(
  stablefordScores,
  scrambleScores,
  bonusWinners
);

const previousScoreSignature =
  typeof window !== "undefined"
    ? localStorage.getItem(getScoreSignatureStorageKey(eventSlug)) ?? ""
    : "";

const scoreStateChanged =
  hasScoringActivity &&
  currentScoreSignature !== previousScoreSignature;

const previousPositions = eventSlug
  ? getStoredPositions(eventSlug)
  : {};

const storedMovement = eventSlug
  ? getStoredMovement(eventSlug)
  : {};

const rowsWithPositions = rows.map((player, index) => {
  const newPosition = index + 1;

  const movement = scoreStateChanged
    ? formatPlaceMovement(previousPositions[player.id], newPosition)
    : storedMovement[String(player.id)] ?? {
        icon: "➖",
        text: "No movement",
      };

  return {
    ...player,
    pos: newPosition,
    movement,
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

const generatedMoments = hasScoringActivity
  ? ([
      buildLatestStablefordMoment(
  latestStablefordScore,
  players,
  currentRoundInfo.round,
  finalRows,
  previousPositions,
  scoreStateChanged
),
    buildLatestScrambleMoment(
  latestScrambleInfo,
  players,
  scramblePairStandings,
  previousPairStandings,
  scoreStateChanged
),
      ...buildBonusMoments(bonusWinners),
      ...buildMovementMoments(finalRows),
      ...buildBattleMoments(
  finalRows,
  sortedTeams,
  currentRoundInfo.round
),
    ].filter(Boolean) as LiveMomentRow[])
  : [];

if (generatedMoments.length > 0) {
  await saveGeneratedMoments(generatedMoments);
}

if (!hasScoringActivity && typeof window !== "undefined") {
  localStorage.removeItem(getPositionStorageKey(eventSlug));
}

const refreshedMoments = await getLiveMoments(eventSlug);

const isScrambleRound =
  currentRoundInfo.round?.format === "scramblePairs" ||
  currentRoundInfo.round?.format === "scramble";

const visibleMoments = hasScoringActivity
  ? (refreshedMoments ?? []).filter(
      (moment: LiveMomentRow) =>
        !(
          isScrambleRound &&
          (
            moment.moment_type === "battle_alert" ||
            moment.moment_type === "scramble_score"
          )
        )
    )
  : [];

setLeaderboard(finalRows);
setTeamStandings(sortedTeams);
setMoments(visibleMoments);
    setLastUpdatedAt(
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

if (eventSlug && hasScoringActivity && scoreStateChanged) {
  saveStoredPositions(finalRows, eventSlug);
  saveStoredMovement(finalRows, eventSlug);
saveStoredPairStandings(
  scramblePairStandings,
  eventSlug
);
  if (typeof window !== "undefined") {
    localStorage.setItem(
      getScoreSignatureStorageKey(eventSlug),
      currentScoreSignature
    );
  }
} else if (eventSlug && !hasScoringActivity) {
  clearStoredLeaderboardState(eventSlug);
  setCopiedMomentKeys([]);
}



  }, [tournament]);

 useEffect(() => {
  if (!loading && tournament) {
    setLeaderboard([]);
    setTeamStandings([]);
    setMoments([]);
setLastUpdatedAt("");
setCurrentRound(null);

    setCopiedMomentKeys(
      getStoredCopiedMoments(tournament.slug)
    );

    loadLeaderboard();
  }
}, [loading, tournament, loadLeaderboard]);

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
  }, [tournament?.slug, loadLeaderboard]);

useEffect(() => {
  if (!tournament?.slug) return;

  const interval = setInterval(() => {
    loadLeaderboard();
  }, 3000);

  return () => clearInterval(interval);
}, [tournament?.slug, loadLeaderboard]);


  return (
    <PageContainer className="bg-slate-100 text-slate-900">
    <section className="rounded-3xl bg-green-950 px-5 py-4 text-white shadow-lg">
  <div className="flex items-center justify-between gap-3">
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-green-300">
      🔥 Live
    </p>

    {lastUpdatedAt && (
      <p className="shrink-0 text-[10px] font-black uppercase tracking-wide text-green-200">
        ● {lastUpdatedAt}
      </p>
    )}
  </div>

  <h3 className="mt-2 text-3xl font-black leading-none tracking-tight text-white">
    {tournament?.name ?? "Swift Tees"}
  </h3>

  {currentRound && (
    <p className="mt-3 text-sm font-black text-green-100">
      {currentRound.date && (
        <>
          {formatLiveRoundDate(currentRound.date)}
          {" • "}
        </>
      )}

      {currentRound.course ??
        currentRound.courseName ??
        "Course"}
    </p>
  )}

  <p className="mt-1.5 text-sm font-semibold text-green-200">
    👥 {tournament?.players?.length ?? 0} Players
    {" • "}
    {tournament?.team_mode === "teams" ||
    tournament?.teamMode === "teams"
      ? "Teams"
      : "Singles"}
  </p>
</section>

      {teamStandings.length > 0 && (
  <section className="mt-2.5 rounded-3xl border border-slate-200 bg-white p-2.5 shadow-sm">
  <div className="grid grid-cols-3 gap-1.5">
      {teamStandings.map((team) => (
            <div
              key={team.team}
              className="rounded-xl bg-slate-50 px-2 py-2 text-center"
            >
              <div className="text-lg leading-none">{team.icon}</div>

              <div className="text-[10px] font-black uppercase text-green-950">
                {team.team}
              </div>

              <div className="mt-1 text-xl font-black leading-none text-green-950">
                {team.points}
              </div>

              <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                {progressText(team.through)}
              </div>
            </div>
               ))}
    </div>
  </section>
)}

      <section className="mt-2.5 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
  <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-green-950">
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

        <div className="space-y-1.5">
          {leaderboard.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                player.pos === 1
                  ? "border border-yellow-300 bg-yellow-50"
                  : "bg-slate-50"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-950 text-xs font-black text-white">
                  {player.pos}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${teamDot(
                        player.team
                      )}`}
                    />

                    <p className="truncate text-sm font-black text-green-950">
                      {player.pos === 1 ? "👑 " : ""}
                      {player.name}
                      {player.bonusIcons.length > 0 && (
                        <span className="ml-1">
                          {player.bonusIcons.join("")}
                        </span>
                      )}
                    </p>
                  </div>

                  <p className="text-[11px] font-semibold text-slate-500">
  {progressText(player.through)}
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

                <p className="min-w-8 text-right text-lg font-black leading-none text-green-950">
                  {player.points}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-2.5 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2">
          <h2 className="text-lg font-black text-green-950">
            🎙️ Commentary Feed
          </h2>

          <p className="text-[11px] font-semibold text-slate-400">
  Tap Copy to share an update
</p>
        </div>

       

        <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
  {moments.length === 0 && (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <p className="text-sm font-black text-green-950">
        Waiting for tournament moments
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        Commentary will appear as scores and bonus winners are added.
      </p>
    </div>
  )}

 {moments.map((moment, index) => {
  const momentKey =
    moment.moment_key ?? `${moment.title}-${index}`;

  const hasBeenCopied =
    copiedMomentKeys.includes(momentKey);

  return (
    <div
      key={momentKey}
      className={`rounded-xl border border-l-4 px-3 py-2.5 transition-all ${
        hasBeenCopied
          ? "border-slate-300 bg-slate-100 opacity-70"
          : moment.rarity === "major"
          ? "border-yellow-300 bg-yellow-50"
          : moment.rarity === "rare"
          ? "border-green-300 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
  <p className="text-[10px] font-black uppercase tracking-wide text-green-700">
    {moment.icon} {moment.title}
  </p>

  {moment.created_at && (
    <span className="text-[10px] font-semibold text-slate-400">
      {new Date(moment.created_at).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  )}
</div>

                  <p className="mt-0.5 text-sm font-bold leading-snug text-green-950">
                    {moment.text}
                  </p>
                </div>

                <button
  type="button"
  onClick={() => copyMoment(moment, index)}
  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
    hasBeenCopied
      ? "bg-slate-300 text-slate-700"
      : "bg-green-950 text-white"
  }`}
>
  {copiedKey === `moment-${index}`
    ? "Copied!"
    : hasBeenCopied
    ? "✓ Copied"
    : "Copy"}
</button>
              </div>
                </div>
  );
})}
        </div>
      </section>

     <section className="mt-2.5 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-lg font-black text-green-950">
        📝 Live Scoring
      </h2>

      <p className="mt-0.5 text-xs text-slate-500">
        Enter your group&apos;s scores
      </p>
    </div>

    <Link
      href="/live-scoring-v2"
      className="shrink-0 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-black text-white"
    >
      Scorecards →
    </Link>
  </div>
</section>
    </PageContainer>
  );
}