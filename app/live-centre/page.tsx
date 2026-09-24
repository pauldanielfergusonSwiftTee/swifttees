"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import {
  buildStablefordEvent,
  buildScrambleEvent,
} from "@/lib/commentary/eventBuilders";
import { buildCommentary } from "@/lib/commentary/commentaryEngine";
import type {
  CommentaryTier,
  CommentaryEventType,
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
  scoreIcons: string[];
  totalShots: number;
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



function formatCommentaryArchive(
  moments: LiveMomentRow[],
  tournamentName: string
) {
  const chronological = moments
    .slice()
    .sort(
      (a, b) =>
        new Date(a.created_at ?? 0).getTime() -
        new Date(b.created_at ?? 0).getTime()
    );

  const lines = chronological.map((moment) => {
    const roundText = moment.round_number
      ? `Round ${moment.round_number}`
      : "";

    const holeText = moment.hole_number
      ? `Hole ${moment.hole_number}`
      : "";

    const context = [roundText, holeText]
      .filter(Boolean)
      .join(" • ");

    return `${context ? `${context}\n` : ""}${moment.text}`;
  });

  return `SWIFT TEES — ${tournamentName}

LIVE COMMENTARY ARCHIVE

${lines.join("\n\n")}`;
}


function buildLatestStablefordMoment(
  latestStablefordScore: any,
  players: any[],
  currentRound: any,
  leaderboard: LeaderboardRow[]
): LiveMomentRow | null {
  if (!latestStablefordScore) return null;

  const player = players.find(
    (item: any) =>
      Number(item.id) ===
      Number(latestStablefordScore.player_id)
  );

  if (!player) return null;

  const leaderboardRow = leaderboard.find(
    (row) => Number(row.id) === Number(player.id)
  );

  const commentaryEvent = buildStablefordEvent(
    latestStablefordScore,
    {
      ...player,
      team: leaderboardRow?.team ?? player.team ?? "",
    },
    currentRound
  );

  if (!commentaryEvent) return null;

  const commentary = buildCommentary(commentaryEvent);

  const roundNumber = commentaryEvent.roundNumber;
  const holeNumber = commentaryEvent.holeNumber;

  let momentKey = `stableford-score-${roundNumber}-${player.id}-${holeNumber}`;

  if (commentaryEvent.eventType === "birdie") {
    momentKey = `stableford-birdie-${roundNumber}-${player.id}-${holeNumber}`;
  }

  if (commentaryEvent.eventType === "eagle") {
    momentKey = `stableford-eagle-${roundNumber}-${player.id}-${holeNumber}`;
  }

  return {
    event_slug: EVENT_SLUG,
    moment_key: momentKey,
    moment_type: stablefordMomentType(
      commentaryEvent.eventType
    ),

    player_id: Number(player.id),
    player_name: player.name,
    team: leaderboardRow?.team ?? player.team ?? null,

    round_number: roundNumber,
    hole_number: holeNumber,

    icon: commentary.icon,
    title: commentary.title,
    text: commentary.text,

    rarity: commentaryTierToRarity(commentary.tier),
  };
}



function buildLatestScrambleMoment(
  latestScrambleInfo: LatestScrambleInfo | null,
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

  const commentaryEvent =
    buildScrambleEvent(latestScrambleInfo);

  if (!commentaryEvent || !latestScrambleInfo) {
    return null;
  }

  // Do not create routine scramble score updates.
  if (commentaryEvent.eventType === "scramble_score") {
    return null;
  }

  const commentary = buildCommentary(commentaryEvent);

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
    currentPair &&
    currentPair.points === topPoints &&
    jointLeaders.length > 1;

  const movedUpBy =
    previousPair && currentPair
      ? previousPair.pos - currentPair.pos
      : 0;

  let title = commentary.title;
  let text = commentary.text;
  let icon = commentary.icon;
  let rarity = commentaryTierToRarity(
    commentary.tier
  );

  let momentType =
    commentaryEvent.eventType === "scramble_eagle"
      ? "scramble_eagle"
      : "scramble_birdie";

  if (
    currentPair &&
    previousPair &&
    previousPair.pos > 1 &&
    currentPair.pos === 1 &&
    !isJointLeader
  ) {
    icon = "🏆";
    title = "New Leaders";
    text = `${currentPair.pairNames} ${
      commentaryEvent.eventType === "scramble_eagle"
        ? "eagle"
        : "birdie"
    } hole ${currentPair.through} to take the outright lead.`;
    rarity = "major";
    momentType = "scramble_lead_taken";
  } else if (
    currentPair &&
    isJointLeader &&
    (!previousPair || previousPair.pos > 1)
  ) {
    icon = "⚔️";
    title = "Tied at the Top";
    text = `${currentPair.pairNames} ${
      commentaryEvent.eventType === "scramble_eagle"
        ? "eagle"
        : "birdie"
    } hole ${currentPair.through} to join the lead on ${currentPair.points} points.`;
    rarity = "major";
    momentType = "scramble_lead_joined";
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

    text = `${currentPair.pairNames} ${
      commentaryEvent.eventType === "scramble_eagle"
        ? "eagle"
        : "birdie"
    } hole ${currentPair.through} and climb ${
      movedUpBy === 1
        ? "one place"
        : `${movedUpBy} places`
    } into ${formatOrdinal(currentPair.pos)}.`;

    rarity = movedUpBy >= 2 ? "major" : "rare";
    momentType = "scramble_movement_up";
  } else if (
    currentPair &&
    currentPair.pos === 1 &&
    pairStandings[1]
  ) {
    const lead =
      currentPair.points - pairStandings[1].points;

    if (lead > 0) {
      icon = "🏆";
      title = "Lead Extended";
      text = `${currentPair.pairNames} ${
        commentaryEvent.eventType === "scramble_eagle"
          ? "eagle"
          : "birdie"
      } hole ${currentPair.through} to move ${lead} point${
        lead === 1 ? "" : "s"
      } clear at the top.`;

      rarity = lead >= 3 ? "major" : "rare";
      momentType = "scramble_lead_extended";
    }
  }

  const momentKey = `${
    commentaryEvent.eventType === "scramble_eagle"
      ? "scramble-eagle"
      : "scramble-birdie"
  }-${latestScrambleInfo.roundNumber}-${latestScrambleInfo.playerIds.join(
    "-"
  )}-${latestScrambleInfo.holeNumber}`;

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
  bonusIconsByPlayerName[bonus.winner_player_name] = [
    ...(bonusIconsByPlayerName[bonus.winner_player_name] ?? []),
    icon,
  ];
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

      const stablefordShots = playerScores.reduce(
        (total: number, score: any) =>
          total + Number(score.gross_score ?? 0),
        0
      );

      const stablefordScoreIcons = playerScores
        .map((score: any) => {
          const round = tournamentSetup.rounds?.find(
            (round: any) =>
              getRoundNumber(round) === Number(score.round_number)
          );

          return getScoreIconFromGross(
            Number(score.gross_score ?? 0),
            getHolePar(round, Number(score.hole_number))
          );
        })
        .filter(Boolean);

      const playerScrambleScores = scrambleScores.filter(
        (scrambleScore: any) => {
          const pairInfo = getPairInfoForScrambleScore(
            scrambleScore,
            tournamentSetup,
            players
          );

          return pairInfo.playerIds.includes(Number(player.id));
        }
      );

      const scrambleShots = playerScrambleScores.reduce(
        (total: number, score: any) =>
          total + Number(score.gross_score ?? 0),
        0
      );

      const scrambleScoreIcons = playerScrambleScores
        .map((score: any) => {
          const pairInfo = getPairInfoForScrambleScore(
            score,
            tournamentSetup,
            players
          );

          return getScoreIconFromGross(
            Number(score.gross_score ?? 0),
            getHolePar(pairInfo.round, Number(score.hole_number))
          );
        })
        .filter(Boolean);

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
        scoreIcons: [...stablefordScoreIcons, ...scrambleScoreIcons],
        totalShots: stablefordShots + scrambleShots,
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
        finalRows
      ),
      buildLatestScrambleMoment(
  latestScrambleInfo,
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

/*
 * Commentary is generated and saved server-side when scores are saved.
 * Live Centre only reads the saved commentary for the active tournament.
 *
 * Internal push bookkeeping rows must never appear in the commentary feed.
 */
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
        moment.moment_type !== "push_checkpoint" &&
        moment.moment_type !== "push_notification"
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
    <PageContainer className="!bg-[#f5f4ee] text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="px-2 pb-2 text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5">
            <Image src="/swiftteeslogo.png" alt="" width={32} height={24} className="h-6 w-auto" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-950">Swift Tees</span>
          </div>
          <h1 className="text-[22px] font-black leading-tight tracking-tight text-[#103e30] sm:text-3xl">{tournament?.name ?? "Live Leaderboard"}</h1>
          {currentRound && (
  <p className="mt-1 text-xs text-slate-600">
    {currentRound.date && formatLiveRoundDate(currentRound.date)}
    {currentRound.date && currentRound.format && " · "}
    {currentRound.format === "scramblePairs" ||
    currentRound.format === "scramble"
      ? "Scramble"
      : currentRound.format === "stableford"
        ? "Stableford"
        : ""}
  </p>
)}
          <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold text-green-800">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-600" />
            {loading ? "Loading tournament…" : "Live leaderboard"}
            {lastUpdatedAt && <span className="font-normal text-slate-500"> · Updated {lastUpdatedAt}</span>}
          </p>
        </header>

        {teamStandings.length > 0 && (
          <section
            aria-label="Team standings"
            className="mb-3 rounded-2xl border border-green-950/10 bg-white px-2.5 pb-2.5 pt-2.5 shadow-sm"
          >
            <div className="mb-2 text-center">
              <h2 className="text-sm font-black text-green-950">
                Team Leaderboard
              </h2>
            </div>

            <div
              className={`grid items-end gap-2 ${
                teamStandings.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {teamStandings.map((team, index) => {
                const teamPlayers = leaderboard
                  .filter(
                    (player) =>
                      (player.team || "No Team") === team.team
                  )
                  .sort(
                    (a, b) =>
                      b.points - a.points ||
                      a.name.localeCompare(b.name)
                  );

                return (
                  <div
                    key={team.team}
                    className={`relative overflow-hidden rounded-xl border px-2 pb-2 pt-2 text-center shadow-sm ${
                      index === 0
                        ? "border-emerald-300 bg-gradient-to-b from-[#eaf8e9] to-white"
                        : "border-slate-200 bg-gradient-to-b from-slate-50 to-white"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${teamDot(team.team)}`}
                      />
                      <p className="truncate text-[12px] font-black text-green-950">
                        {team.team}
                      </p>
                    </div>

                    <p className="mt-0.5 text-[23px] font-black leading-none tabular-nums text-green-900">
                      {team.points}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold text-slate-500">
                      {progressText(team.through)}
                    </p>

                    {teamPlayers.length > 0 && (
                      <div className="mt-1.5 space-y-0.5 border-t border-green-950/10 pt-1.5">
                        {teamPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex min-w-0 items-center justify-between gap-1 text-[9px]"
                          >
                            <span className="truncate font-semibold text-slate-600">
                              {player.name}
                            </span>
                            <span className="shrink-0 font-black tabular-nums text-green-800">
                              {player.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section aria-label="Individual standings" className="mb-3 overflow-hidden rounded-2xl border border-green-950/10 bg-white shadow-sm">
          <div className="px-4 py-2.5">
            <h2 className="text-sm font-bold text-green-950">Individual Leaderboard</h2>
          </div>
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-y border-slate-100 text-[11px] text-slate-500">
              <tr>
                <th scope="col" className="w-10 py-2 text-center">#</th>
                <th scope="col" className="py-2">Player</th>
                <th scope="col" className="w-[62px] py-2 pr-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player) => (
                <tr key={player.id} className={`border-b border-slate-100 last:border-0 ${player.pos === 1 ? "bg-[#eaf8e9]" : "hover:bg-[#f7faf6]"}`}>
                  <td className="py-2 text-center text-sm font-black tabular-nums text-slate-500">{player.pos}</td>
                  <th scope="row" className="py-2 pr-1 font-semibold text-green-950">
                    <div className="flex items-center gap-1.5"><span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${teamDot(player.team)}`} /><span className="break-words">{player.name}</span></div>
                    <div className="flex min-h-[14px] flex-wrap items-center gap-1.5 pl-3.5 text-[10px] font-medium text-slate-400">
                      {player.totalShots > 0 && (
                        <span className="tabular-nums">{player.totalShots}</span>
                      )}
                      {player.totalShots > 0 && <span>·</span>}
                      <span>{progressText(player.through)}</span>
                      {((player.scoreIcons?.length ?? 0) > 0 ||
                        (player.bonusIcons?.length ?? 0) > 0) && (
                        <span
                          className="text-xs tracking-[1px]"
                          title="Achievements"
                        >
                          {[
                            ...(player.scoreIcons ?? []),
                            ...(player.bonusIcons ?? []),
                          ].join("")}
                        </span>
                      )}
                    </div>
                  </th>
                  <td className="py-2 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        title={player.movement.text}
                        aria-label={player.movement.text}
                        className={`text-xs font-black ${movementStyle(player.movement.icon)}`}
                      >
                        {player.movement.icon}
                      </span>
                      <span className="text-lg font-black tabular-nums text-green-900">
                        {player.points}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">{loading ? "Loading standings…" : "Standings will appear when tournament scores are available."}</p>}
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

{moments.length > 0 && (
        <section className="mt-2 flex h-[340px] flex-col rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                Live
              </span>
              <h2 className="text-sm font-black text-green-950">
                Commentary
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                copyText(
                  formatCommentaryArchive(
                    moments,
                    tournament?.name ?? "Swift Tees"
                  ),
                  "commentary-archive"
                )
              }
              className="shrink-0 rounded-full bg-green-950 px-2.5 py-1 text-[9px] font-black text-white"
            >
              {copiedKey === "commentary-archive"
                ? "Copied"
                : "Copy All"}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1">
            {moments.map((moment, index) => {
              const momentKey =
                moment.moment_key ??
                `${moment.title}-${index}`;

              return (
                <div
                  key={momentKey}
                  className={`rounded-xl border-l-4 px-2.5 py-2 ${
                    moment.rarity === "major"
                      ? "border-red-500 bg-red-50/50"
                      : moment.rarity === "rare"
                        ? "border-amber-400 bg-amber-50/50"
                        : "border-emerald-500 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-sm">
                          {moment.icon || "⛳"}
                        </span>

                        <p className="text-[10px] font-black uppercase tracking-wide text-green-950">
                          {moment.title}
                        </p>

                        {moment.round_number && (
                          <span className="text-[9px] font-bold text-slate-400">
                            R{moment.round_number}
                          </span>
                        )}

                        {moment.created_at && (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {new Date(moment.created_at).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                            {" · "}
                            {new Date(moment.created_at).toLocaleTimeString(
                              "en-GB",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs font-semibold leading-snug text-slate-700">
                        {moment.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyMoment(moment, index)
                      }
                      className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black text-green-950"
                    >
                      {copiedKey === `moment-${index}`
                        ? "Copied"
                        : copiedMomentKeys.includes(momentKey)
                          ? "Copy ✓"
                          : "Copy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      </div>
    </PageContainer>
  );
}
