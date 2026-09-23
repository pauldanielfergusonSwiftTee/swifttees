import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  buildStablefordEvent,
  buildScrambleEvent,
} from "@/lib/commentary/eventBuilders";

import {
  getPrimaryStoryline,
  type Storyline,
} from "@/lib/commentary/storylineEngine";

import {
  enhanceBroadcastMoments,
} from "@/lib/commentary/broadcastProducer";

import {
  buildBroadcastCommentary,
} from "@/lib/commentary/teamCommentaryEngine";

import type {
  CommentaryEvent,
  CommentaryEventType,
  CommentaryTier,
} from "@/lib/commentary/types";

import { sendPushToAll } from "@/lib/server/push";


type ScoreRow = {
  id?: number | string;

  event_slug: string;
  round_number: number;
  group_number?: number | null;
  player_id?: number | null;
  pair_number?: number | null;
  hole_number: number;

  gross_score?: number | null;
  points?: number | null;
  event_handicap?: number | null;
  score_type?: string | null;
  updated_at?: string | null;
};


type TournamentPlayer = {
  id: number | string;
  name: string;

  team?: string;
  eventTeam?: string;

  stablefordHandicap?: number;
  eventHandicap?: number;
};


type TournamentPair = {
  pairNumber?: number | string;
  pair_number?: number | string;

  player1_id?: number | string;
  player2_id?: number | string;
};


type TournamentGroup = {
  id?: number | string;
  groupNumber?: number | string;
  group_number?: number | string;

  players?: Array<{
    player_id?: number | string;
    id?: number | string;
    name?: string;
    team?: string;
  }>;

  pairs?: TournamentPair[];
};


type TournamentHole = {
  hole?: number | string;
  number?: number | string;
  hole_number?: number | string;
  par?: number | string;
  yards?: number | string;
  strokeIndex?: number | string;
  stroke_index?: number | string;
};

type TournamentBonusHole = {
  hole?: number | string;
  type?: string;
  points?: number | string;
};


type TournamentRound = {
  id?: number | string;
  roundNumber?: number | string;
  round_number?: number | string;

  format?: string;

  holes?: TournamentHole[];
  groups?: TournamentGroup[];
  bonusHoles?: TournamentBonusHole[];
  bonus_holes?: TournamentBonusHole[];
};


type TournamentSetup = {
  slug: string;

  team_mode?: string;
  teamMode?: string;

  players?: TournamentPlayer[];
  rounds?: TournamentRound[];
};


type RefreshRequest = {
  eventSlug: string;

  /**
   * The complete group/hole batch that was just saved.
   */
  savedRows: ScoreRow[];

  /**
   * Rows as they existed immediately BEFORE this save.
   *
   * scores.ts will supply this so edits/corrections can be handled correctly.
   */
  previousRows?: ScoreRow[];

  /**
   * Normalised tournament structure already used by Live Scoring.
   */
  tournament: TournamentSetup;
};


type Movement = {
  icon: string;
  text: string;
};


type LeaderboardRow = {
  id: number;
  name: string;
  team: string;

  points: number;
  teamPoints: number;

  through: number;
  pos: number;

  movement: Movement;
};


type TeamStanding = {
  team: string;
  points: number;
  through: number;
  pos: number;
};


type PairStanding = {
  pairKey: string;
  playerIds: number[];
  pairNames: string;

  points: number;
  through: number;
  pos: number;
};


type LiveMomentRow = {
  event_slug: string;
  moment_key: string;
  moment_type: string;

  player_id?: number | null;
  player_name?: string | null;
  team?: string | null;

  round_number?: number | null;
  hole_number?: number | null;

  icon: string;
  title: string;
  text: string;

  rarity: "common" | "rare" | "major";
};


function toNumber(
  value: unknown,
  fallback = 0
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


function normaliseText(value: unknown) {
  return String(value ?? "").trim();
}


function getRoundNumber(round: TournamentRound) {
  return toNumber(
    round.roundNumber ??
    round.round_number ??
    round.id
  );
}


function getGroupNumber(group: TournamentGroup) {
  return toNumber(
    group.groupNumber ??
    group.group_number ??
    group.id
  );
}


function getPairNumber(pair: TournamentPair) {
  return toNumber(
    pair.pairNumber ??
    pair.pair_number
  );
}


function getHoleNumber(hole: TournamentHole) {
  return toNumber(
    hole.hole ??
    hole.number ??
    hole.hole_number
  );
}


function getRound(
  tournament: TournamentSetup,
  roundNumber: number
) {
  return tournament.rounds?.find(
    (round) =>
      getRoundNumber(round) === roundNumber
  );
}


function getHolePar(
  round: TournamentRound | undefined,
  holeNumber: number
) {
  const hole = round?.holes?.find(
    (candidate) =>
      getHoleNumber(candidate) === holeNumber
  );

  const par = toNumber(hole?.par);

  return par > 0
    ? par
    : undefined;
}


function getHoleDetails(
  tournament: TournamentSetup,
  roundNumber: number,
  holeNumber: number
) {
  const round = getRound(tournament, roundNumber);
  const hole = round?.holes?.find(
    (candidate) => getHoleNumber(candidate) === holeNumber
  );

  if (!hole) return null;

  const par = toNumber(hole.par);
  const yards = toNumber(hole.yards);
  const strokeIndex = toNumber(
    hole.strokeIndex ?? hole.stroke_index
  );

  const bonusHoles = round?.bonusHoles ?? round?.bonus_holes ?? [];
  const bonusTypes = bonusHoles
    .filter((bonus) => toNumber(bonus.hole) === holeNumber)
    .map((bonus) => normaliseText(bonus.type).toLowerCase());

  return {
    holeNumber,
    par: par > 0 ? par : undefined,
    yards: yards > 0 ? yards : undefined,
    strokeIndex: strokeIndex > 0 ? strokeIndex : undefined,
    isLongestDrive: bonusTypes.some((type) => type.includes("longest")),
    isClosestToPin: bonusTypes.some(
      (type) => type.includes("nearest") || type.includes("closest")
    ),
  };
}

function buildCourseContext(
  tournament: TournamentSetup,
  roundNumber: number,
  holeNumber: number,
  mode: "current" | "next" = "current"
) {
  const targetHole = mode === "next" ? holeNumber + 1 : holeNumber;
  const details = getHoleDetails(tournament, roundNumber, targetHole);
  if (!details) return "";

  const parts: string[] = [];
  if (details.par) parts.push(`par ${details.par}`);
  if (details.yards) parts.push(`${details.yards} yds`);

  // Use stroke index as a factual course descriptor, not a claim that it is
  // objectively the hardest/easiest hole.
  if (details.strokeIndex === 1) parts.push("SI 1");

  if (details.isLongestDrive) parts.push("Longest Drive");
  if (details.isClosestToPin) parts.push("Nearest Pin");

  if (parts.length === 0) return "";
  return `${mode === "next" ? "Next" : `Hole ${targetHole}`}: ${parts.join(" · ")}.`;
}

function getTournamentPlayers(
  tournament: TournamentSetup
): TournamentPlayer[] {
  return Array.isArray(tournament.players)
    ? tournament.players
    : [];
}


function getPlayerTeam(
  tournament: TournamentSetup,
  player: TournamentPlayer
) {
  const tournamentPlayer =
    tournament.players?.find(
      (candidate) =>
        Number(candidate.id) === Number(player.id)
    );

  const teamName = (
    normaliseText(tournamentPlayer?.eventTeam) ||
    normaliseText(player.eventTeam) ||
    normaliseText(player.team)
  );

  // Preserve tournament team names, but normalise the known
  // Worsley colour-team labels if older data uses singular names.
  const worsleyTeamNames: Record<string, string> = {
    white: "Whites",
    whites: "Whites",
    blue: "Blues",
    blues: "Blues",
    green: "Greens",
    greens: "Greens",
  };

  return worsleyTeamNames[teamName.toLowerCase()] ?? teamName;
}


function getPairInfo(
  score: ScoreRow,
  tournament: TournamentSetup
) {
  const roundNumber =
    Number(score.round_number);

  const groupNumber =
    Number(score.group_number);

  const pairNumber =
    Number(score.pair_number);

  const round =
    tournament.rounds?.find(
      (candidate) =>
        getRoundNumber(candidate) === roundNumber
    );

  const group =
    round?.groups?.find(
      (candidate) =>
        getGroupNumber(candidate) === groupNumber
    );

  const pair =
    group?.pairs?.find(
      (candidate) =>
        getPairNumber(candidate) === pairNumber
    );

  const playerIds = [
    pair?.player1_id,
    pair?.player2_id,
  ]
    .map((id) => Number(id))
    .filter((id) =>
      Number.isFinite(id) &&
      id > 0
    );

  const players =
    getTournamentPlayers(tournament);

  const pairNames = playerIds
    .map(
      (id) =>
        players.find(
          (player) =>
            Number(player.id) === id
        )?.name
    )
    .filter(Boolean)
    .join(" and ");

  return {
    round,
    group,
    pair,
    playerIds,
    pairNames,
  };
}


function scoreIdentity(row: ScoreRow) {
  if (row.player_id) {
    return [
      "stableford",
      row.event_slug,
      row.round_number,
      row.player_id,
      row.hole_number,
    ].join(":");
  }

  return [
    "scramble",
    row.event_slug,
    row.round_number,
    row.group_number,
    row.pair_number,
    row.hole_number,
  ].join(":");
}


function scoreValueChanged(
  oldRow: ScoreRow | undefined,
  newRow: ScoreRow
) {
  if (!oldRow) {
    return true;
  }

  return (
    Number(oldRow.gross_score ?? 0) !==
      Number(newRow.gross_score ?? 0) ||

    Number(oldRow.points ?? 0) !==
      Number(newRow.points ?? 0) ||

    Number(oldRow.event_handicap ?? 0) !==
      Number(newRow.event_handicap ?? 0)
  );
}


function getChangedRows(
  savedRows: ScoreRow[],
  previousRows: ScoreRow[]
) {
  const previousMap =
    new Map(
      previousRows.map((row) => [
        scoreIdentity(row),
        row,
      ])
    );

  return savedRows.filter((row) =>
    scoreValueChanged(
      previousMap.get(scoreIdentity(row)),
      row
    )
  );
}


function replaceBatchWithPreviousRows(
  currentRows: ScoreRow[],
  savedRows: ScoreRow[],
  previousRows: ScoreRow[]
) {
  const savedKeys =
    new Set(
      savedRows.map(scoreIdentity)
    );

  const withoutCurrentBatch =
    currentRows.filter(
      (row) =>
        !savedKeys.has(scoreIdentity(row))
    );

  return [
    ...withoutCurrentBatch,
    ...previousRows,
  ];
}


function buildPairStandings(
  scrambleScores: ScoreRow[],
  tournament: TournamentSetup,
  roundNumber: number
): PairStanding[] {
  const pairs: Record<
    string,
    Omit<PairStanding, "pos">
  > = {};

  scrambleScores
    .filter(
      (score) =>
        Number(score.round_number) ===
        Number(roundNumber)
    )
    .forEach((score) => {
      const pairInfo =
        getPairInfo(score, tournament);

      if (
        pairInfo.playerIds.length === 0 ||
        !pairInfo.pairNames
      ) {
        return;
      }

      const pairKey =
        pairInfo.playerIds
          .slice()
          .sort((a, b) => a - b)
          .join("-");

      if (!pairs[pairKey]) {
        pairs[pairKey] = {
          pairKey,
          playerIds:
            pairInfo.playerIds,

          pairNames:
            pairInfo.pairNames,

          points: 0,
          through: 0,
        };
      }

      pairs[pairKey].points +=
        Number(score.points ?? 0);

      pairs[pairKey].through =
        Math.max(
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


function buildLeaderboard(
  stablefordScores: ScoreRow[],
  scrambleScores: ScoreRow[],
  tournament: TournamentSetup,
  roundNumber: number
): LeaderboardRow[] {
  const players =
    getTournamentPlayers(tournament);

  const scramblePointsByPlayerId:
    Record<number, number> = {};

  const teamScramblePointsByPlayerId:
    Record<number, number> = {};

  const scrambleThroughByPlayerId:
    Record<number, number> = {};


  scrambleScores.forEach(
    (scrambleScore) => {
      const scoreRoundNumber =
        Number(scrambleScore.round_number);

      const holeNumber =
        Number(scrambleScore.hole_number);

      const scramblePoints =
        Number(scrambleScore.points ?? 0);

      const pairInfo =
        getPairInfo(
          scrambleScore,
          tournament
        );

      pairInfo.playerIds.forEach(
        (playerId) => {
          scramblePointsByPlayerId[playerId] =
            (
              scramblePointsByPlayerId[
                playerId
              ] ?? 0
            ) + scramblePoints;

          if (
            scoreRoundNumber ===
            roundNumber
          ) {
            scrambleThroughByPlayerId[
              playerId
            ] = Math.max(
              scrambleThroughByPlayerId[
                playerId
              ] ?? 0,
              holeNumber
            );
          }
        }
      );

      /*
       * Swift Tees team rule:
       *
       * A pair's scramble score contributes
       * to BOTH players' individual totals,
       * but only ONCE to the team total.
       */
      const firstPlayerId =
        pairInfo.playerIds[0];

      if (firstPlayerId) {
        teamScramblePointsByPlayerId[
          firstPlayerId
        ] =
          (
            teamScramblePointsByPlayerId[
              firstPlayerId
            ] ?? 0
          ) + scramblePoints;
      }
    }
  );


  const rows =
    players.map((player) => {
      const playerId =
        Number(player.id);

      const playerScores =
        stablefordScores.filter(
          (score) =>
            Number(score.player_id) ===
            playerId
        );

      const stablefordPoints =
        playerScores.reduce(
          (total, score) =>
            total +
            Number(score.points ?? 0),
          0
        );

      const currentRoundScores =
        playerScores.filter(
          (score) =>
            Number(score.round_number) ===
            roundNumber
        );

      const stablefordThrough =
        currentRoundScores.length
          ? Math.max(
              ...currentRoundScores.map(
                (score) =>
                  Number(
                    score.hole_number ?? 0
                  )
              )
            )
          : 0;

      const scramblePoints =
        scramblePointsByPlayerId[
          playerId
        ] ?? 0;

      const teamScramblePoints =
        teamScramblePointsByPlayerId[
          playerId
        ] ?? 0;

      const scrambleThrough =
        scrambleThroughByPlayerId[
          playerId
        ] ?? 0;

      return {
        id: playerId,
        name: player.name,
        team:
          getPlayerTeam(
            tournament,
            player
          ),

        points:
          stablefordPoints +
          scramblePoints,

        teamPoints:
          stablefordPoints +
          teamScramblePoints,

        through:
          Math.max(
            stablefordThrough,
            scrambleThrough
          ),

        pos: 0,

        movement: {
          icon: "➖",
          text: "No movement",
        },
      };
    });


  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.through - a.through
  );


  return rows.map(
    (row, index) => ({
      ...row,
      pos: index + 1,
    })
  );
}


function buildPositionMap(
  leaderboard: LeaderboardRow[]
) {
  return Object.fromEntries(
    leaderboard.map(
      (row) => [
        String(row.id),
        row.pos,
      ]
    )
  );
}


function addMovements(
  currentRows: LeaderboardRow[],
  previousRows: LeaderboardRow[]
) {
  const previousPositions =
    buildPositionMap(previousRows);

  return currentRows.map(
    (row) => {
      const oldPosition =
        previousPositions[
          String(row.id)
        ];

      if (!oldPosition) {
        return row;
      }

      const movement =
        oldPosition - row.pos;

      if (movement > 0) {
        return {
          ...row,
          movement: {
            icon: "▲",
            text: `Up ${movement}`,
          },
        };
      }

      if (movement < 0) {
        return {
          ...row,
          movement: {
            icon: "▼",
            text: `Down ${Math.abs(
              movement
            )}`,
          },
        };
      }

      return row;
    }
  );
}


function buildTeams(
  rows: LeaderboardRow[]
): TeamStanding[] {
  const teams:
    Record<
      string,
      {
        team: string;
        points: number;
        through: number;
      }
    > = {};


  rows.forEach((player) => {
    const teamName =
      player.team || "No Team";

    if (!teams[teamName]) {
      teams[teamName] = {
        team: teamName,
        points: 0,
        through: 0,
      };
    }

    teams[teamName].points +=
      player.teamPoints;
  });


  Object.values(teams).forEach(
    (team) => {
      const teamPlayers =
        rows.filter(
          (player) =>
            (
              player.team ||
              "No Team"
            ) === team.team
        );

      team.through =
        teamPlayers.length
          ? Math.min(
              ...teamPlayers.map(
                (player) =>
                  player.through
              )
            )
          : 0;
    }
  );


  return Object.values(teams)
    .sort(
      (a, b) =>
        b.points - a.points
    )
    .map((team, index) => ({
      ...team,
      pos: index + 1,
    }));
}


/*
 * Team totals used by the visible Swift Tees leaderboard.
 *
 * The on-screen team race is the sum of each player's displayed points.
 * Keep Hole Complete commentary tied to that same authoritative total so
 * the notification can never show a different gap from Live Centre.
 */
function buildDisplayedTeamTotals(
  rows: LeaderboardRow[]
): TeamStanding[] {
  const teams: Record<string, { team: string; points: number; through: number }> = {};

  rows.forEach((player) => {
    const teamName = player.team || "No Team";

    if (!teams[teamName]) {
      teams[teamName] = { team: teamName, points: 0, through: 0 };
    }

    teams[teamName].points += Number(player.points ?? 0);
  });

  Object.values(teams).forEach((team) => {
    const teamPlayers = rows.filter(
      (player) => (player.team || "No Team") === team.team
    );

    team.through = teamPlayers.length
      ? Math.min(...teamPlayers.map((player) => player.through))
      : 0;
  });

  return Object.values(teams)
    .sort((a, b) => b.points - a.points)
    .map((team, index) => ({ ...team, pos: index + 1 }));
}


function buildPreviousTeamMap(
  teams: TeamStanding[]
) {
  return Object.fromEntries(
    teams.map((team) => [
      team.team,
      {
        pos: team.pos,
        points: team.points,
      },
    ])
  );
}


function buildPreviousPairMap(
  pairs: PairStanding[]
) {
  return Object.fromEntries(
    pairs.map((pair) => [
      pair.pairKey,
      {
        pos: pair.pos,
        points: pair.points,
      },
    ])
  );
}


function commentaryTierToRarity(
  tier: CommentaryTier
): LiveMomentRow["rarity"] {
  if (
    tier === "major" ||
    tier === "rare"
  ) {
    return "major";
  }

  if (tier === "notable") {
    return "rare";
  }

  return "common";
}


function stablefordMomentType(
  eventType: CommentaryEventType
) {
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


function storylineToLiveMoment(
  storyline: Storyline,
  eventSlug: string,
  currentRoundNumber: number
): LiveMomentRow {
  return {
    event_slug:
      eventSlug,

    moment_key:
      `storyline-${storyline.key}`,

    moment_type:
      `storyline_${storyline.kind}`,

    player_id:
      storyline.playerId ?? null,

    player_name:
      storyline.playerName ??
      storyline.pairNames ??
      null,

    team:
      storyline.team ?? null,

    round_number:
      storyline.roundNumber ??
      currentRoundNumber ??
      null,

    hole_number:
      storyline.holeNumber ?? null,

    icon:
      storyline.icon,

    title:
      storyline.title,

    text:
      storyline.text,

    rarity:
      commentaryTierToRarity(
        storyline.tier
      ),
  };
}


function buildStablefordMoment(
  score: ScoreRow,
  tournament: TournamentSetup,
  leaderboard: LeaderboardRow[],
  previousLeaderboard: LeaderboardRow[]
): LiveMomentRow | null {
  if (!score.player_id) {
    return null;
  }

  const player =
    tournament.players?.find(
      (candidate) =>
        Number(candidate.id) ===
        Number(score.player_id)
    );

  if (!player) {
    return null;
  }

  const leaderboardRow =
    leaderboard.find(
      (row) =>
        Number(row.id) ===
        Number(score.player_id)
    );

  if (!leaderboardRow) {
    return null;
  }

  const previousRow =
    previousLeaderboard.find(
      (row) =>
        Number(row.id) ===
        Number(score.player_id)
    );

  const roundNumber =
    Number(score.round_number);

  const round =
    getRound(
      tournament,
      roundNumber
    );

  const leaderPoints =
    leaderboard[0]?.points ??
    leaderboardRow.points;

  const playersOnSamePoints =
    leaderboard.filter(
      (row) =>
        row.points ===
        leaderboardRow.points
    );

  const positionBefore =
    previousRow?.pos;

  const positionAfter =
    leaderboardRow.pos;

  const event =
    buildStablefordEvent(
      score,
      {
        id:
          Number(player.id),

        name:
          player.name,

        team:
          leaderboardRow.team,
      },
      round,
      {
        positionBefore,
        positionAfter,

        leaderGap:
          Math.max(
            0,
            leaderPoints -
              leaderboardRow.points
          ),

        isNewLeader:
          positionAfter === 1 &&
          positionBefore !== undefined &&
          positionBefore > 1,

        isJointLeader:
          positionAfter === 1 &&
          playersOnSamePoints.length > 1,

        holesCompleted:
          Number(
            score.hole_number ?? 0
          ),

        totalHoles:
          round?.holes?.length || 18,
      }
    );


  if (!event) {
    return null;
  }


  const contextualEvent:
    CommentaryEvent = {
      ...event,

      positionBefore,
      positionAfter,

      placesMoved:
        positionBefore !== undefined
          ? positionBefore -
            positionAfter
          : 0,

      leaderGap:
        Math.max(
          0,
          leaderPoints -
            leaderboardRow.points
        ),

      isNewLeader:
        positionAfter === 1 &&
        positionBefore !== undefined &&
        positionBefore > 1,

      isJointLeader:
        positionAfter === 1 &&
        playersOnSamePoints.length > 1,
    };


  const commentary =
    buildBroadcastCommentary(
      contextualEvent
    );


  let momentKey =
    `stableford-score-${roundNumber}-${player.id}-${score.hole_number}`;

  if (
    event.eventType === "birdie"
  ) {
    momentKey =
      `stableford-birdie-${roundNumber}-${player.id}-${score.hole_number}`;
  }

  if (
    event.eventType === "eagle"
  ) {
    momentKey =
      `stableford-eagle-${roundNumber}-${player.id}-${score.hole_number}`;
  }


  return {
    event_slug:
      score.event_slug,

    moment_key:
      momentKey,

    moment_type:
      stablefordMomentType(
        event.eventType
      ),

    player_id:
      Number(player.id),

    player_name:
      player.name,

    team:
      leaderboardRow.team ||
      null,

    round_number:
      roundNumber,

    hole_number:
      Number(score.hole_number),

    icon:
      commentary.icon,

    title:
      commentary.title,

    text:
      commentary.text,

    rarity:
      commentaryTierToRarity(
        commentary.tier
      ),
  };
}


function buildScrambleMoment(
  score: ScoreRow,
  tournament: TournamentSetup,
  currentPairs: PairStanding[],
  previousPairs: PairStanding[]
): LiveMomentRow | null {
  const pairInfo =
    getPairInfo(
      score,
      tournament
    );

  if (
    !pairInfo.pairNames ||
    !pairInfo.playerIds.length
  ) {
    return null;
  }

  const roundNumber =
    Number(score.round_number);

  const holeNumber =
    Number(score.hole_number);

  const grossScore =
    Number(score.gross_score ?? 0);

  const par =
    getHolePar(
      pairInfo.round,
      holeNumber
    );


  const pairKey =
    pairInfo.playerIds
      .slice()
      .sort((a, b) => a - b)
      .join("-");


  const currentPair =
    currentPairs.find(
      (pair) =>
        pair.pairKey === pairKey
    );

  const previousPair =
    previousPairs.find(
      (pair) =>
        pair.pairKey === pairKey
    );


  const topPoints =
    currentPairs[0]?.points ?? 0;

  const jointLeaders =
    currentPairs.filter(
      (pair) =>
        pair.points === topPoints
    );


  const holeDetails = getHoleDetails(tournament, roundNumber, holeNumber);

  const event =
    buildScrambleEvent({
      playerIds:
        pairInfo.playerIds,

      pairNames:
        pairInfo.pairNames,

      holeNumber,
      roundNumber,

      grossScore,
      par,
      yards: holeDetails?.yards,
      strokeIndex: holeDetails?.strokeIndex,

      points:
        Number(score.points ?? 0),

      holesCompleted:
        holeNumber,

      totalHoles:
        pairInfo.round?.holes?.length ||
        18,
    });


  if (!event) {
    return null;
  }


  /*
   * Routine scramble pars/bogeys
   * do not become commentary.
   */
  if (
    event.eventType ===
    "scramble_score"
  ) {
    return null;
  }


  const commentary =
    buildBroadcastCommentary(
      event
    );


  let title =
    commentary.title;

  let text =
    commentary.text;

  let icon =
    commentary.icon;

  let rarity:
    LiveMomentRow["rarity"] =
      commentaryTierToRarity(
        commentary.tier
      );


  let momentType =
    event.eventType ===
    "scramble_eagle"
      ? "scramble_eagle"
      : "scramble_birdie";


  const scoreWord =
    event.eventType ===
    "scramble_eagle"
      ? "eagle"
      : "birdie";


  const isJointLeader =
    Boolean(currentPair) &&
    currentPair!.points ===
      topPoints &&
    jointLeaders.length > 1;


  const previousTopPoints =
    previousPairs.length
      ? Math.max(
          ...previousPairs.map(
            (pair) =>
              pair.points
          )
        )
      : 0;


  const previousGap =
    previousPair
      ? Math.max(
          0,
          previousTopPoints -
            previousPair.points
        )
      : null;


  const currentGap =
    currentPair
      ? Math.max(
          0,
          topPoints -
            currentPair.points
        )
      : null;


  const gapReducedBy =
    previousGap !== null &&
    currentGap !== null
      ? previousGap -
        currentGap
      : 0;


  const movedUpBy =
    previousPair &&
    currentPair
      ? previousPair.pos -
        currentPair.pos
      : 0;


  if (
    currentPair &&
    previousPair &&
    previousPair.pos > 1 &&
    currentPair.pos === 1 &&
    !isJointLeader
  ) {
    icon = "🏆";
    title = "New Leaders";

    text =
      `${currentPair.pairNames} ${scoreWord} hole ${holeNumber} to take the outright lead on ${currentPair.points} points.`;

    rarity = "major";
    momentType =
      "scramble_lead_taken";
  }

  else if (
    currentPair &&
    isJointLeader &&
    (
      !previousPair ||
      previousPair.pos > 1
    )
  ) {
    icon = "⚔️";
    title = "Tied at the Top";

    text =
      `${currentPair.pairNames} ${scoreWord} hole ${holeNumber} to join the lead on ${currentPair.points} points.`;

    rarity = "major";
    momentType =
      "scramble_lead_joined";
  }

  else if (
    currentPair &&
    previousPair &&
    currentPair.pos > 1 &&
    currentGap === 1 &&
    previousGap !== null &&
    previousGap > 1
  ) {
    icon = "👀";
    title =
      "Pressure Building";

    text =
      `${currentPair.pairNames} ${scoreWord} hole ${holeNumber} and cut the gap to a single point. The leaders can hear the footsteps.`;

    rarity = "major";

    momentType =
      "scramble_gap_cut_to_one";
  }

  else if (
    currentPair &&
    previousPair &&
    currentPair.pos > 1 &&
    gapReducedBy >= 2 &&
    currentGap !== null
  ) {
    icon = "🔥";
    title =
      "Closing the Gap";

    text =
      `${currentPair.pairNames} ${scoreWord} hole ${holeNumber} and reduce the deficit by ${gapReducedBy} points. They are now ${
        currentGap === 0
          ? "level at the top"
          : `${currentGap} point${
              currentGap === 1
                ? ""
                : "s"
            } behind`
      }.`;

    rarity =
      currentGap <= 2
        ? "major"
        : "rare";

    momentType =
      "scramble_gap_reduced";
  }

  else if (
    currentPair &&
    previousPair &&
    movedUpBy >= 1
  ) {
    icon =
      movedUpBy >= 2
        ? "🚀"
        : "🔥";

    title =
      movedUpBy >= 2
        ? "Flying Up the Table"
        : "Pair on the Move";

    text =
      `${currentPair.pairNames} ${scoreWord} hole ${holeNumber} and climb ${
        movedUpBy === 1
          ? "one place"
          : `${movedUpBy} places`
      } into position ${currentPair.pos}.`;

    rarity =
      movedUpBy >= 2
        ? "major"
        : "rare";

    momentType =
      "scramble_movement_up";
  }

  else if (
    currentPair &&
    previousPair &&
    currentPair.pos === 1 &&
    previousPair.pos === 1 &&
    currentPairs[1]
  ) {
    const lead =
      currentPair.points -
      currentPairs[1].points;

    const previousSecond =
      previousPairs
        .filter(
          (pair) =>
            pair.pairKey !==
            pairKey
        )
        .sort(
          (a, b) =>
            b.points - a.points
        )[0];

    const previousLead =
      previousPair.points -
      (
        previousSecond?.points ??
        0
      );

    if (
      lead > previousLead &&
      lead > 0
    ) {
      icon = "🏆";
      title =
        "Lead Extended";

      text =
        `${currentPair.pairNames} ${scoreWord} hole ${holeNumber} and stretch their advantage to ${lead} point${
          lead === 1 ? "" : "s"
        }.`;

      rarity =
        lead >= 3
          ? "major"
          : "rare";

      momentType =
        "scramble_lead_extended";
    }
  }


  const playerIds =
    pairInfo.playerIds
      .slice()
      .sort((a, b) => a - b)
      .join("-");


  /*
   * Keep this moment key based on the
   * score itself, rather than leaderboard
   * movement, so repeated refreshes cannot
   * create multiple pushes for the same shot.
   */
  const momentKey =
    `${
      event.eventType ===
      "scramble_eagle"
        ? "scramble-eagle"
        : "scramble-birdie"
    }-${roundNumber}-${playerIds}-${holeNumber}`;


  return {
    event_slug:
      score.event_slug,

    moment_key:
      momentKey,

    moment_type:
      momentType,

    player_id:
      null,

    player_name:
      pairInfo.pairNames,

    team:
      null,

    round_number:
      roundNumber,

    hole_number:
      holeNumber,

    icon,
    title,
    text,
    rarity,
  };
}




type PushMessage = {
  priority: number;
  fact: string;
  subjectKey: string;
};

type PlayerHistory = {
  individualWins?: number;
  bestStableford?: number;
  bestFinish?: number;
  tripsAttended?: number;
  longestDrives?: number;
  closestToPins?: number;
  previousStablefordScores?: number[];
};

type StablefordHistory = {
  allTimeRecord?: number;
  loaded: boolean;
};

type PushStage = {
  stage: 1 | 2;
  reportedGroups: number;
  totalGroups: number;
  isFinal: boolean;
};

function ordinal(position: number) {
  const mod100 = position % 100;

  if (mod100 >= 11 && mod100 <= 13) {
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

function capPushText(
  text: string,
  maxLength = 120
) {
  const clean = text
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  const shortened =
    clean.slice(0, maxLength - 1).trimEnd();

  const lastSpace =
    shortened.lastIndexOf(" ");

  const safe =
    lastSpace >= maxLength - 18
      ? shortened.slice(0, lastSpace)
      : shortened;

  return `${safe}…`;
}

function scoreAchievement(
  row: ScoreRow,
  tournament: TournamentSetup
) {
  const round = getRound(
    tournament,
    Number(row.round_number)
  );

  const par = getHolePar(
    round,
    Number(row.hole_number)
  );

  const gross =
    Number(row.gross_score ?? 0);

  if (!par || !gross) {
    return null;
  }

  const difference = gross - par;

  if (difference <= -2) {
    return "eagle";
  }

  if (difference === -1) {
    return "birdie";
  }

  return null;
}

function getStablefordRoundPoints(
  scores: ScoreRow[],
  playerId: number,
  roundNumber: number
) {
  return scores
    .filter(
      (score) =>
        Number(score.player_id) === playerId &&
        Number(score.round_number) === roundNumber
    )
    .reduce(
      (total, score) =>
        total + Number(score.points ?? 0),
      0
    );
}

function getRoundTotalHoles(
  tournament: TournamentSetup,
  roundNumber: number
) {
  return (
    getRound(tournament, roundNumber)?.holes?.length ||
    18
  );
}

function getNextHolePar(
  tournament: TournamentSetup,
  roundNumber: number,
  holeNumber: number
) {
  return getHoleDetails(tournament, roundNumber, holeNumber + 1)?.par;
}

function addTournamentPhaseContext(
  text: string,
  tournament: TournamentSetup,
  roundNumber: number,
  holeNumber: number
) {
  const totalHoles = getRoundTotalHoles(tournament, roundNumber);
  const remaining = Math.max(0, totalHoles - holeNumber);
  const next = getHoleDetails(tournament, roundNumber, holeNumber + 1);

  if (remaining === 0) return `${text} Round complete.`;

  if (remaining === 1) {
    const nextBits = [
      next?.par ? `par ${next.par}` : "",
      next?.yards ? `${next.yards} yds` : "",
      next?.isLongestDrive ? "Longest Drive" : "",
      next?.isClosestToPin ? "Nearest Pin" : "",
    ].filter(Boolean);
    return nextBits.length
      ? `${text} One to play — ${nextBits.join(", ")} on 18.`
      : `${text} One to play.`;
  }

  if (remaining <= 3) return `${text} ${remaining} holes to play.`;
  if (totalHoles >= 18 && holeNumber === 9) return `${text} Through the turn.`;
  return text;
}

function buildStablefordHistoryPush(
  row: ScoreRow,
  tournament: TournamentSetup,
  stablefordScoresBefore: ScoreRow[],
  stablefordScoresAfter: ScoreRow[],
  playerHistory: Record<string, PlayerHistory>,
  stablefordHistory: StablefordHistory
): PushMessage | null {
  if (!row.player_id || !stablefordHistory.loaded) return null;

  const playerId = Number(row.player_id);
  const player = tournament.players?.find(
    (candidate) => Number(candidate.id) === playerId
  );
  if (!player) return null;

  const roundNumber = Number(row.round_number);
  const holeNumber = Number(row.hole_number);
  const totalHoles = getRoundTotalHoles(tournament, roundNumber);
  const holesRemaining = Math.max(0, totalHoles - holeNumber);

  const beforePoints = getStablefordRoundPoints(
    stablefordScoresBefore, playerId, roundNumber
  );
  const roundPoints = getStablefordRoundPoints(
    stablefordScoresAfter, playerId, roundNumber
  );

  const allTimeRecord = stablefordHistory.allTimeRecord ?? 0;
  const personalBest = playerHistory[player.name]?.bestStableford ?? 0;

  // Announce records only when this score actually crosses/reaches the mark.
  // This prevents the same record message repeating on every later hole.
  if (
    allTimeRecord > 0 &&
    beforePoints <= allTimeRecord &&
    roundPoints > allTimeRecord
  ) {
    return {
      priority: 115,
      fact: `${player.name} reaches ${roundPoints} pts — a new Swift Tees Stableford record.`,
      subjectKey: `stableford-record-${playerId}-${roundPoints}`,
    };
  }

  if (
    allTimeRecord > 0 &&
    beforePoints < allTimeRecord &&
    roundPoints === allTimeRecord
  ) {
    return {
      priority: 110,
      fact: `${player.name} reaches ${roundPoints} pts — matching the Swift Tees Stableford record.`,
      subjectKey: `stableford-record-match-${playerId}-${roundPoints}`,
    };
  }

  if (
    allTimeRecord > 0 &&
    holesRemaining <= 3 && holesRemaining > 0 &&
    beforePoints < allTimeRecord - 1 &&
    roundPoints === allTimeRecord - 1
  ) {
    return {
      priority: 96,
      fact: `${player.name} reaches ${roundPoints} pts — one short of the Swift Tees record.`,
      subjectKey: `stableford-record-chase-${playerId}-${roundPoints}`,
    };
  }

  if (
    holeNumber === totalHoles &&
    personalBest > 0 &&
    beforePoints <= personalBest &&
    roundPoints > personalBest
  ) {
    return {
      priority: 82,
      fact: `${player.name} finishes on ${roundPoints} pts — a new personal Swift Tees best.`,
      subjectKey: `stableford-personal-best-${playerId}-${roundPoints}`,
    };
  }

  return null;
}

function buildPlayerHistoryContext(
  playerName: string,
  playerHistory: Record<string, PlayerHistory>
) {
  const history = playerHistory[playerName];
  if (!history || history.individualWins === undefined) return "";

  if (history.individualWins === 0) {
    return "chasing a first Swift Tees individual win";
  }
  if (history.individualWins === 1) return "already a Swift Tees winner";
  return `already a ${history.individualWins}-time Swift Tees winner`;
}

function gapToPlayerAhead(
  standing: { pos: number; points: number },
  field: Array<{ pos: number; points: number; name?: string; pairNames?: string }>
) {
  if (standing.pos <= 1) return null;
  const ahead = field
    .filter((candidate) => candidate.pos < standing.pos)
    .sort((a, b) => b.pos - a.pos)[0];
  if (!ahead) return null;
  return {
    gap: Math.max(0, ahead.points - standing.points),
    name: ahead.name ?? ahead.pairNames ?? "",
    pos: ahead.pos,
  };
}

function buildRaceGapContext(
  standing: { pos: number; points: number },
  field: Array<{ pos: number; points: number; name?: string; pairNames?: string }>
) {
  const leaderPoints = field[0]?.points ?? standing.points;
  const gapToLeader = Math.max(0, leaderPoints - standing.points);
  if (gapToLeader === 0) return "";

  if (standing.pos === 2) {
    return `, ${gapToLeader} ${gapToLeader === 1 ? "pt" : "pts"} off the lead`;
  }

  const ahead = gapToPlayerAhead(standing, field);
  if (ahead && ahead.gap > 0 && ahead.name) {
    return `, ${ahead.gap} ${ahead.gap === 1 ? "pt" : "pts"} behind ${ahead.name} in ${ordinal(ahead.pos)}`;
  }

  return `, ${gapToLeader} ${gapToLeader === 1 ? "pt" : "pts"} off the lead`;
}

function buildPlayerPush(
  row: ScoreRow,
  tournament: TournamentSetup,
  leaderboardBefore: LeaderboardRow[],
  leaderboardAfter: LeaderboardRow[],
  playerHistory: Record<string, PlayerHistory>
): PushMessage | null {
  if (!row.player_id) return null;

  const playerId = Number(row.player_id);
  const player = tournament.players?.find(
    (candidate) => Number(candidate.id) === playerId
  );
  const before = leaderboardBefore.find((candidate) => candidate.id === playerId);
  const after = leaderboardAfter.find((candidate) => candidate.id === playerId);
  if (!player || !after) return null;

  const achievement = scoreAchievement(row, tournament);
  const achievementVerb = achievement === "eagle"
    ? "eagles"
    : achievement === "birdie" ? "birdies" : null;

  const moved = before ? before.pos - after.pos : 0;
  const leaderPoints = leaderboardAfter[0]?.points ?? after.points;
  const isJointLeader =
    after.points === leaderPoints &&
    leaderboardAfter.filter((candidate) => candidate.points === leaderPoints).length > 1;
  const wasJointLeader = before
    ? leaderboardBefore.filter((candidate) => candidate.points === before.points).length > 1 && before.pos === 1
    : false;
  const gapContext = buildRaceGapContext(after, leaderboardAfter);
  const historyContext = buildPlayerHistoryContext(player.name, playerHistory);

  let fact = "";
  let priority = achievement === "eagle" ? 100 : achievement === "birdie" ? 90 : 20;

  if (achievementVerb) {
    if (before && before.pos > 1 && after.pos === 1 && !isJointLeader) {
      fact = `${player.name} ${achievementVerb} to take the outright lead${historyContext ? ` — ${historyContext}` : ""}.`;
    } else if (isJointLeader && !wasJointLeader) {
      fact = `${player.name} ${achievementVerb} to join the lead.`;
    } else if (moved > 0) {
      fact = `${player.name} ${achievementVerb} to climb into ${ordinal(after.pos)}${gapContext}.`;
    } else {
      fact = `${player.name} ${achievementVerb} and sits ${ordinal(after.pos)}${gapContext}.`;
    }
  } else if (before && before.pos > 1 && after.pos === 1) {
    priority = 85;
    fact = `${player.name} moves into the lead${historyContext ? ` — ${historyContext}` : ""}.`;
  } else if (moved > 0) {
    priority = 60 + Math.min(moved, 10);
    fact = `${player.name} moves up ${moved} ${moved === 1 ? "place" : "places"} into ${ordinal(after.pos)}${gapContext}.`;
  } else if (moved < 0) {
    priority = 35;
    fact = `${player.name} drops ${Math.abs(moved)} ${Math.abs(moved) === 1 ? "place" : "places"} to ${ordinal(after.pos)}.`;
  } else {
    return null;
  }

  return { priority, fact, subjectKey: `player-${playerId}` };
}

function buildPairPush(
  row: ScoreRow,
  tournament: TournamentSetup,
  pairsBefore: PairStanding[],
  pairsAfter: PairStanding[]
): PushMessage | null {
  if (row.player_id || !row.group_number || !row.pair_number) return null;

  const pairInfo = getPairInfo(row, tournament);
  if (!pairInfo.pairNames || pairInfo.playerIds.length === 0) return null;

  const isSinglePlayer = pairInfo.playerIds.length === 1;
  const pairKey = pairInfo.playerIds.slice().sort((a, b) => a - b).join("-");
  const before = pairsBefore.find((pair) => pair.pairKey === pairKey);
  const after = pairsAfter.find((pair) => pair.pairKey === pairKey);
  if (!after) return null;

  const achievement = scoreAchievement(row, tournament);
  const moved = before ? before.pos - after.pos : 0;
  const leaderPoints = pairsAfter[0]?.points ?? after.points;
  const isJointLeader =
    after.points === leaderPoints &&
    pairsAfter.filter((pair) => pair.points === leaderPoints).length > 1;
  const wasJointLeader = before
    ? pairsBefore.filter((pair) => pair.points === before.points).length > 1 && before.pos === 1
    : false;
  const gapContext = buildRaceGapContext(after, pairsAfter);

  const achievementVerb = achievement === "eagle"
    ? (isSinglePlayer ? "eagles" : "eagle")
    : achievement === "birdie" ? (isSinglePlayer ? "birdies" : "birdie") : null;
  const sitVerb = isSinglePlayer ? "sits" : "sit";
  const moveVerb = isSinglePlayer ? "moves" : "move";
  const takeVerb = isSinglePlayer ? "takes" : "take";

  let fact = "";
  let priority = achievement === "eagle" ? 100 : achievement === "birdie" ? 90 : 20;

  if (achievementVerb) {
    if (before && before.pos > 1 && after.pos === 1 && !isJointLeader) {
      fact = `${pairInfo.pairNames} ${achievementVerb} to take the outright lead.`;
    } else if (isJointLeader && !wasJointLeader) {
      fact = `${pairInfo.pairNames} ${achievementVerb} to join the lead.`;
    } else if (moved > 0) {
      fact = `${pairInfo.pairNames} ${achievementVerb} to climb into ${ordinal(after.pos)}${gapContext}.`;
    } else {
      fact = `${pairInfo.pairNames} ${achievementVerb} and ${sitVerb} ${ordinal(after.pos)}${gapContext}.`;
    }
  } else if (before && before.pos > 1 && after.pos === 1) {
    priority = 85;
    fact = `${pairInfo.pairNames} ${takeVerb} the lead.`;
  } else if (moved > 0) {
    priority = 60 + Math.min(moved, 10);
    fact = `${pairInfo.pairNames} ${moveVerb} up ${moved} ${moved === 1 ? "place" : "places"} into ${ordinal(after.pos)}${gapContext}.`;
  } else {
    return null;
  }

  return { priority, fact, subjectKey: `pair-${pairKey}` };
}

function buildTeamLeadPush(
  teamsBefore: TeamStanding[],
  teamsAfter: TeamStanding[]
): PushMessage | null {
  const beforeLeader =
    teamsBefore[0];

  const afterLeader =
    teamsAfter[0];

  if (!afterLeader) {
    return null;
  }

  if (
    beforeLeader &&
    beforeLeader.team !== afterLeader.team
  ) {
    return {
      priority: 88,
      fact:
        `${afterLeader.team} take the team lead on ${afterLeader.points} pts.`,
      subjectKey: `team-${afterLeader.team}`,
    };
  }

  return null;
}


function buildTeamRacePush(
  teamsBefore: TeamStanding[],
  teamsAfter: TeamStanding[],
  holeNumber: number,
  totalHoles: number
): PushMessage | null {
  const beforeLeader = teamsBefore[0];
  const afterLeader = teamsAfter[0];
  const afterSecond = teamsAfter[1];
  if (!afterLeader || !afterSecond) return null;

  const holesRemaining = Math.max(0, totalHoles - holeNumber);
  const late = holesRemaining <= 6;
  const gapAfter = Math.max(0, afterLeader.points - afterSecond.points);

  if (gapAfter === 0) {
    const beforeGap = beforeLeader && teamsBefore[1]
      ? Math.max(0, beforeLeader.points - teamsBefore[1].points)
      : null;
    if (beforeGap !== 0) {
      return {
        priority: late ? 98 : 90,
        fact: `Nothing between them now — ${afterLeader.team} and ${afterSecond.team} are level after ${holeNumber}.`,
        subjectKey: `team-race-tied-${holeNumber}`,
      };
    }
  }

  if (beforeLeader && beforeLeader.team !== afterLeader.team) {
    return {
      priority: late ? 105 : 96,
      fact: `${afterLeader.team} hit the front after ${holeNumber}, moving ahead of ${beforeLeader.team}.`,
      subjectKey: `team-race-lead-change-${afterLeader.team}`,
    };
  }

  if (beforeLeader?.team === afterLeader.team && teamsBefore[1]) {
    const gapBefore = Math.max(0, beforeLeader.points - teamsBefore[1].points);
    if (gapAfter < gapBefore && gapAfter <= 3) {
      return {
        priority: late ? 92 : 82,
        fact: `${afterSecond.team} are coming. ${afterLeader.team}'s lead is cut from ${gapBefore} to ${gapAfter} ${gapAfter === 1 ? "pt" : "pts"}.`,
        subjectKey: `team-race-gap-cut-${afterSecond.team}`,
      };
    }
    if (gapAfter > gapBefore && gapAfter - gapBefore >= 2) {
      return {
        priority: late ? 84 : 72,
        fact: `${afterLeader.team} stretch the lead from ${gapBefore} to ${gapAfter} ${gapAfter === 1 ? "pt" : "pts"}.`,
        subjectKey: `team-race-gap-extended-${afterLeader.team}`,
      };
    }
  }

  if (late && gapAfter <= 2) {
    return {
      priority: 80,
      fact: `${afterLeader.team} lead ${afterSecond.team} by just ${gapAfter} ${gapAfter === 1 ? "pt" : "pts"} with ${holesRemaining} ${holesRemaining === 1 ? "hole" : "holes"} to play.`,
      subjectKey: `team-race-tight-${holeNumber}`,
    };
  }

  return null;
}

function buildLeaderboardTightnessPush(
  leaderboardBefore: LeaderboardRow[],
  leaderboardAfter: LeaderboardRow[],
  holeNumber: number,
  totalHoles: number
): PushMessage | null {
  if (leaderboardAfter.length < 2) return null;
  const topAfter = leaderboardAfter.slice(0, Math.min(3, leaderboardAfter.length));
  const topBefore = leaderboardBefore.slice(0, Math.min(3, leaderboardBefore.length));
  const spreadAfter = Math.max(...topAfter.map((row) => row.points)) - Math.min(...topAfter.map((row) => row.points));
  const spreadBefore = topBefore.length > 1
    ? Math.max(...topBefore.map((row) => row.points)) - Math.min(...topBefore.map((row) => row.points))
    : 999;
  const holesRemaining = Math.max(0, totalHoles - holeNumber);

  if (spreadAfter <= 1 && (spreadBefore > 1 || holesRemaining <= 4)) {
    const names = topAfter.map((row) => row.name).join(", ");
    return {
      priority: holesRemaining <= 4 ? 92 : 82,
      fact: `This has tightened right up — ${names} are separated by a single point after ${holeNumber}.`,
      subjectKey: `leaderboard-tight-${holeNumber}`,
    };
  }

  return null;
}

function getRecentStablefordPoints(
  scores: ScoreRow[],
  playerId: number,
  roundNumber: number,
  throughHole: number,
  count: number
) {
  return scores
    .filter((row) =>
      Number(row.player_id) === playerId &&
      Number(row.round_number) === roundNumber &&
      Number(row.hole_number) <= throughHole
    )
    .sort((a, b) => Number(b.hole_number) - Number(a.hole_number))
    .slice(0, count)
    .reduce((total, row) => total + Number(row.points ?? 0), 0);
}

function buildStablefordFormPush(
  row: ScoreRow,
  tournament: TournamentSetup,
  stablefordScoresAfter: ScoreRow[]
): PushMessage | null {
  if (!row.player_id) return null;
  const playerId = Number(row.player_id);
  const player = tournament.players?.find((candidate) => Number(candidate.id) === playerId);
  if (!player) return null;

  const roundNumber = Number(row.round_number);
  const holeNumber = Number(row.hole_number);
  const points = Number(row.points ?? 0);
  const last3 = getRecentStablefordPoints(stablefordScoresAfter, playerId, roundNumber, holeNumber, 3);
  const last4 = getRecentStablefordPoints(stablefordScoresAfter, playerId, roundNumber, holeNumber, 4);
  const previous = stablefordScoresAfter.find((score) =>
    Number(score.player_id) === playerId &&
    Number(score.round_number) === roundNumber &&
    Number(score.hole_number) === holeNumber - 1
  );

  if (last3 >= 9) {
    return {
      priority: last3 >= 10 ? 92 : 86,
      fact: `${player.name} is flying — ${last3} points from the last three holes.`,
      subjectKey: `form-hot-${playerId}-${holeNumber}`,
    };
  }
  if (last4 >= 11) {
    return {
      priority: 80,
      fact: `${player.name} is on a serious run — ${last4} points from the last four holes.`,
      subjectKey: `form-run-${playerId}-${holeNumber}`,
    };
  }
  if (points >= 4) {
    return {
      priority: 84,
      fact: `BIG ONE from ${player.name} — ${points} points on the ${ordinal(holeNumber)}.`,
      subjectKey: `stableford-big-score-${playerId}-${holeNumber}`,
    };
  }
  if (Number(previous?.points ?? -1) === 0 && points >= 3) {
    return {
      priority: 74,
      fact: `${player.name} responds after a pointless ${ordinal(holeNumber - 1)} with ${points} points on ${holeNumber}.`,
      subjectKey: `stableford-bounce-back-${playerId}-${holeNumber}`,
    };
  }
  return null;
}

function buildLeaderboardSummaryFact(
  teamEvent: boolean,
  leaderboardAfter: LeaderboardRow[],
  teamsAfter: TeamStanding[]
): PushMessage | null {
  if (teamEvent && teamsAfter.length > 0) {
    const leader = teamsAfter[0];
    const second = teamsAfter[1];

    if (second) {
      const gap =
        leader.points - second.points;

      if (gap === 0) {
        const tiedTeams =
          teamsAfter.filter(
            (team) =>
              team.points === leader.points
          );

        return {
          priority: 10,
          fact:
            tiedTeams.length === 2
              ? `${tiedTeams[0].team} and ${tiedTeams[1].team} are tied in the team race on ${leader.points} pts.`
              : `${tiedTeams.length} teams are tied in the team race on ${leader.points} pts.`,
          subjectKey:
            `team-summary-tied-${leader.points}`,
        };
      }

      return {
        priority: 10,
        fact:
          `${leader.team} lead ${second.team} by ${gap} ${gap === 1 ? "pt" : "pts"}.`,
        subjectKey: `team-summary-${leader.team}`,
      };
    }

    return {
      priority: 10,
      fact:
        `${leader.team} lead the team standings on ${leader.points} pts.`,
      subjectKey: `team-summary-${leader.team}`,
    };
  }

  const leader =
    leaderboardAfter[0];

  const second =
    leaderboardAfter[1];

  if (!leader) {
    return null;
  }

  if (second) {
    const gap =
      leader.points - second.points;

    if (gap === 0) {
      const tiedPlayers =
        leaderboardAfter.filter(
          (player) =>
            player.points === leader.points
        );

      return {
        priority: 10,
        fact:
          tiedPlayers.length === 2
            ? `${tiedPlayers[0].name} and ${tiedPlayers[1].name} are tied at the top on ${leader.points} pts.`
            : `${tiedPlayers.length} players are tied at the top on ${leader.points} pts.`,
        subjectKey:
          `leader-summary-tied-${leader.points}`,
      };
    }

    return {
      priority: 10,
      fact:
        `${leader.name} leads ${second.name} by ${gap} ${gap === 1 ? "pt" : "pts"}.`,
      subjectKey: `leader-summary-${leader.id}`,
    };
  }

  return {
    priority: 10,
    fact:
      `${leader.name} leads on ${leader.points} pts.`,
    subjectKey: `leader-summary-${leader.id}`,
  };
}

function buildPushSummary({
  rows,
  tournament,
  holeNumber,
  teamEvent,
  leaderboardBefore,
  leaderboardAfter,
  teamsBefore,
  teamsAfter,
  pairsBefore,
  pairsAfter,
  playerHistory,
  stablefordScoresBefore,
  stablefordScoresAfter,
  stablefordHistory,
}: {
  rows: ScoreRow[];
  tournament: TournamentSetup;
  holeNumber: number;
  teamEvent: boolean;
  leaderboardBefore: LeaderboardRow[];
  leaderboardAfter: LeaderboardRow[];
  teamsBefore: TeamStanding[];
  teamsAfter: TeamStanding[];
  pairsBefore: PairStanding[];
  pairsAfter: PairStanding[];
  playerHistory: Record<string, PlayerHistory>;
  stablefordScoresBefore: ScoreRow[];
  stablefordScoresAfter: ScoreRow[];
  stablefordHistory: StablefordHistory;
}) {
  const candidates: PushMessage[] = [];

  for (const row of rows) {
    if (row.player_id) {
      const historyCandidate =
        buildStablefordHistoryPush(
          row,
          tournament,
          stablefordScoresBefore,
          stablefordScoresAfter,
          playerHistory,
          stablefordHistory
        );

      if (historyCandidate) {
        candidates.push(
          historyCandidate
        );
      }
    }

    if (row.player_id) {
      const formCandidate = buildStablefordFormPush(
        row,
        tournament,
        stablefordScoresAfter
      );
      if (formCandidate) candidates.push(formCandidate);
    }

    const candidate = row.player_id
      ? buildPlayerPush(
          row,
          tournament,
          leaderboardBefore,
          leaderboardAfter,
          playerHistory
        )
      : buildPairPush(
          row,
          tournament,
          pairsBefore,
          pairsAfter
        );

    if (candidate) {
      candidates.push(candidate);
    }
  }

  const teamLead =
    teamEvent
      ? buildTeamLeadPush(
          teamsBefore,
          teamsAfter
        )
      : null;

  if (teamLead) {
    candidates.push(teamLead);
  }

  const totalHoles = getRoundTotalHoles(tournament, Number(rows[0]?.round_number ?? 0));
  const teamRace = teamEvent
    ? buildTeamRacePush(teamsBefore, teamsAfter, holeNumber, totalHoles)
    : null;
  if (teamRace) candidates.push(teamRace);

  const tightness = !teamEvent
    ? buildLeaderboardTightnessPush(leaderboardBefore, leaderboardAfter, holeNumber, totalHoles)
    : null;
  if (tightness) candidates.push(tightness);

  candidates.sort(
    (a, b) =>
      b.priority - a.priority
  );

  const fallback =
    buildLeaderboardSummaryFact(
      teamEvent,
      leaderboardAfter,
      teamsAfter
    );

  const primary =
    candidates[0] ??
    fallback;

  if (!primary) {
    return null;
  }

  const second =
    candidates.find(
      (candidate) =>
        candidate.subjectKey !==
          primary.subjectKey &&
        candidate.priority >= 60
    ) ??
    (
      fallback &&
      fallback.subjectKey !==
        primary.subjectKey
        ? fallback
        : null
    );

  const roundNumber = Number(rows[0]?.round_number ?? 0);
  let contextualFact = primary.fact;
  const currentHole = getHoleDetails(tournament, roundNumber, holeNumber);

  // Course context is deliberately selective so lock-screen pushes stay useful.
  // Bonus holes and SI 1 are notable enough to surface immediately.
  if (currentHole?.isLongestDrive) {
    contextualFact = `${contextualFact} Longest Drive hole.`;
  } else if (currentHole?.isClosestToPin) {
    contextualFact = `${contextualFact} Nearest Pin hole.`;
  } else if (currentHole?.strokeIndex === 1 && currentHole.par) {
    contextualFact = `${contextualFact} Par ${currentHole.par}, SI 1.`;
  }

  const base = addTournamentPhaseContext(
    contextualFact,
    tournament,
    roundNumber,
    holeNumber
  );

  if (!second) {
    return { message: capPushText(base), priority: primary.priority };
  }

  const combined =
    `${base} ${second.fact}`;

  if (combined.length <= 120) {
    return { message: capPushText(combined), priority: primary.priority };
  }

  return { message: capPushText(base), priority: primary.priority };
}


function buildGroupPushSummary({
  rows,
  tournament,
  holeNumber,
}: {
  rows: ScoreRow[];
  tournament: TournamentSetup;
  holeNumber: number;
}): { message: string; priority: number } | null {
  const candidates: PushMessage[] = [];
  const roundNumber = Number(rows[0]?.round_number ?? 0);
  const totalHoles = getRoundTotalHoles(tournament, roundNumber);
  const holesRemaining = Math.max(0, totalHoles - holeNumber);
  const hole = getHoleDetails(tournament, roundNumber, holeNumber);

  for (const row of rows) {
    const gross = Number(row.gross_score ?? 0);
    if (!gross) continue;

    const achievement = scoreAchievement(row, tournament);
    let subject = "";
    let singular = true;

    if (row.player_id) {
      const player = tournament.players?.find(
        (candidate) => Number(candidate.id) === Number(row.player_id)
      );
      subject = player?.name ?? "";
    } else {
      const pairInfo = getPairInfo(row, tournament);
      subject = pairInfo.pairNames;
      singular = pairInfo.playerIds.length === 1;
    }
    if (!subject) continue;

    const points = Number(row.points ?? 0);
    if (row.player_id && points >= 4) {
      candidates.push({
        priority: 86,
        fact: `BIG ONE from ${subject} — ${points} points on ${holeNumber}.`,
        subjectKey: `group-big-score-${row.player_id}`,
      });
      continue;
    }

    if (achievement === "eagle") {
      candidates.push({
        priority: 100,
        fact: `${subject} ${singular ? "eagles" : "eagle"} the ${ordinal(holeNumber)}.`,
        subjectKey: `group-eagle-${subject}`,
      });
      continue;
    }

    // A scramble birdie is worth interrupting the lock screen for when the
    // hole is especially difficult or the round has reached the closing stretch.
    if (achievement === "birdie" && (!row.player_id) && (hole?.strokeIndex === 1 || holesRemaining <= 4)) {
      const difficulty = hole?.strokeIndex === 1 ? " on Worsley's toughest hole" : "";
      candidates.push({
        priority: holesRemaining <= 2 ? 88 : 78,
        fact: `${subject} ${singular ? "birdies" : "birdie"} ${holeNumber}${difficulty}.`,
        subjectKey: `group-birdie-${subject}`,
      });
    }
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.priority - a.priority);
  const primary = candidates[0];
  return {
    message: capPushText(addTournamentPhaseContext(primary.fact, tournament, roundNumber, holeNumber)),
    priority: primary.priority,
  };
}

function getRoundTotalGroups(
  tournament: TournamentSetup,
  roundNumber: number
) {
  const round =
    getRound(
      tournament,
      roundNumber
    );

  const groupNumbers =
    new Set(
      (round?.groups ?? [])
        .map(getGroupNumber)
        .filter(
          (groupNumber) =>
            groupNumber > 0
        )
    );

  return Math.max(
    groupNumbers.size,
    1
  );
}

function getReportedGroupNumbers(
  stablefordScores: ScoreRow[],
  scrambleScores: ScoreRow[],
  roundNumber: number,
  holeNumber: number
) {
  const groups =
    new Set<number>();

  [
    ...stablefordScores,
    ...scrambleScores,
  ].forEach((score) => {
    if (
      Number(score.round_number) !==
        roundNumber ||
      Number(score.hole_number) !==
        holeNumber
    ) {
      return;
    }

    const groupNumber =
      Number(score.group_number);

    if (
      Number.isFinite(groupNumber) &&
      groupNumber > 0
    ) {
      groups.add(groupNumber);
    }
  });

  return groups;
}

function getCompletedGroupNumbers(
  tournament: TournamentSetup,
  stablefordScores: ScoreRow[],
  scrambleScores: ScoreRow[],
  roundNumber: number,
  holeNumber: number
) {
  const round = getRound(tournament, roundNumber);
  const completed = new Set<number>();

  for (const group of round?.groups ?? []) {
    const groupNumber = getGroupNumber(group);
    if (groupNumber <= 0) continue;

    const expectedPairs = (group.pairs ?? [])
      .map(getPairNumber)
      .filter((pairNumber) => pairNumber > 0);

    if (expectedPairs.length > 0) {
      const savedPairs = new Set(
        scrambleScores
          .filter(
            (row) =>
              Number(row.round_number) === roundNumber &&
              Number(row.hole_number) === holeNumber &&
              Number(row.group_number) === groupNumber
          )
          .map((row) => Number(row.pair_number))
          .filter((pairNumber) => pairNumber > 0)
      );

      if (expectedPairs.every((pairNumber) => savedPairs.has(pairNumber))) {
        completed.add(groupNumber);
      }

      continue;
    }

    const expectedPlayers = (group.players ?? [])
      .map((player) => Number(player.player_id ?? player.id))
      .filter((playerId) => Number.isFinite(playerId) && playerId > 0);

    if (expectedPlayers.length > 0) {
      const savedPlayers = new Set(
        stablefordScores
          .filter(
            (row) =>
              Number(row.round_number) === roundNumber &&
              Number(row.hole_number) === holeNumber &&
              Number(row.group_number) === groupNumber
          )
          .map((row) => Number(row.player_id))
          .filter((playerId) => Number.isFinite(playerId) && playerId > 0)
      );

      if (expectedPlayers.every((playerId) => savedPlayers.has(playerId))) {
        completed.add(groupNumber);
      }
    }
  }

  return completed;
}

function getPushStage({
  tournament,
  roundNumber,
  holeNumber,
  stablefordScores,
  scrambleScores,
}: {
  tournament: TournamentSetup;
  roundNumber: number;
  holeNumber: number;
  stablefordScores: ScoreRow[];
  scrambleScores: ScoreRow[];
}): PushStage | null {
  const totalGroups =
    getRoundTotalGroups(
      tournament,
      roundNumber
    );

  const reportedGroups =
    getReportedGroupNumbers(
      stablefordScores,
      scrambleScores,
      roundNumber,
      holeNumber
    ).size;

  if (reportedGroups <= 0) {
    return null;
  }

  if (totalGroups <= 1) {
    return {
      stage: 1,
      reportedGroups,
      totalGroups,
      isFinal: true,
    };
  }

  if (reportedGroups === 1) {
    return {
      stage: 1,
      reportedGroups,
      totalGroups,
      isFinal: false,
    };
  }

  if (reportedGroups >= totalGroups) {
    return {
      stage: 2,
      reportedGroups,
      totalGroups,
      isFinal: true,
    };
  }

  return null;
}

function rowsBeforeWholeHole(
  rows: ScoreRow[],
  roundNumber: number,
  holeNumber: number
) {
  return rows.filter(
    (score) =>
      !(
        Number(score.round_number) ===
          roundNumber &&
        Number(score.hole_number) ===
          holeNumber
      )
  );
}

function rowsOnHole(
  rows: ScoreRow[],
  roundNumber: number,
  holeNumber: number
) {
  return rows.filter(
    (score) =>
      Number(score.round_number) ===
        roundNumber &&
      Number(score.hole_number) ===
        holeNumber
  );
}

async function reservePushCheckpoint(
  supabase: any,
  {
    eventSlug,
    roundNumber,
    holeNumber,
    checkpointKey,
    message,
  }: {
    eventSlug: string;
    roundNumber: number;
    holeNumber: number;
    checkpointKey: string;
    message: string;
  }
) {
  const checkpoint: LiveMomentRow = {
    event_slug: eventSlug,
    moment_key:
      `push-hole-${roundNumber}-${holeNumber}-${checkpointKey}`,
    moment_type:
      "push_checkpoint",
    player_id: null,
    player_name: null,
    team: null,
    round_number: roundNumber,
    hole_number: holeNumber,
    icon: "",
    title: "",
    text: message,
    rarity: "common",
  };

  const { error } =
    await supabase
      .from("live_moments")
      .insert([checkpoint] as any);

  if (error?.code === "23505") {
    return false;
  }

  if (error) {
    console.error(
      "Could not reserve push checkpoint:",
      error
    );

    return false;
  }

  return true;
}


async function saveMoment(
  supabase: any,
  moment: LiveMomentRow
) {
  /*
   * INSERT, not UPSERT.
   *
   * The existing unique constraint on
   * (event_slug, moment_key) remains the
   * duplicate-moment protection.
   */
  const {
    data,
    error,
  } =
    await supabase
      .from("live_moments")
      .insert([moment] as any)
      .select("*")
      .single();

  if (error?.code === "23505") {
    return {
      created: false,
      duplicate: true,
      data: null,
    };
  }

  if (error) {
    console.error(
      "Failed to insert live moment:",
      error
    );

    return {
      created: false,
      duplicate: false,
      data: null,
    };
  }

  return {
    created: true,
    duplicate: false,
    data,
  };
}


export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as
        RefreshRequest;


    const {
      eventSlug,
      savedRows,
      previousRows = [],
      tournament,
    } = body;


    if (
      !eventSlug ||
      !Array.isArray(savedRows) ||
      savedRows.length === 0 ||
      !tournament
    ) {
      return NextResponse.json(
        {
          error:
            "eventSlug, savedRows and tournament are required",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * A Save Hole operation should be one
     * round/group/hole batch.
     */
    const firstRow =
      savedRows[0];

    const roundNumber =
      Number(
        firstRow.round_number
      );

    const holeNumber =
      Number(
        firstRow.hole_number
      );


    if (
      !roundNumber ||
      !holeNumber
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid round or hole number",
        },
        {
          status: 400,
        }
      );
    }


    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env
        .SUPABASE_SERVICE_ROLE_KEY;


    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase server configuration is incomplete",
        },
        {
          status: 500,
        }
      );
    }


    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey
      );


    /*
     * Ignore rows that were merely saved again
     * without their score changing.
     */
    const changedRows =
      getChangedRows(
        savedRows,
        previousRows
      );


    /*
     * Do not return early when a score is re-saved unchanged.
     *
     * Push publication is recovered from the authoritative rows currently
     * in Supabase plus durable checkpoints. This means a completed group
     * whose push was missed can be published on the next refresh without
     * changing the golf score again. Normal commentary moments still use
     * changedRows, so unchanged scores do not create duplicate moments.
     */


    /*
     * Load CURRENT tournament state.
     */
    const [
      scoresResult,
      scrambleResult,
      momentsResult,
      historyAchievementsResult,
      historicalStablefordResult,
      attendanceResult,
      baselineResult,
    ] =
      await Promise.all([
        supabase
          .from("scores")
          .select("*")
          .eq(
            "event_slug",
            eventSlug
          ),

        supabase
          .from(
            "scramble_scores"
          )
          .select("*")
          .eq(
            "event_slug",
            eventSlug
          ),

        supabase
          .from("live_moments")
          .select("*")
          .eq(
            "event_slug",
            eventSlug
          )
          .neq(
            "moment_type",
            "push_checkpoint"
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(20),

        supabase
          .from("event_achievements")
          .select("player_name,achievement_type"),

        supabase
          .from("overall_results")
          .select("event_slug,round_number,player_name,stableford_points"),

        supabase
          .from("event_attendance")
          .select("event_slug,player_name"),

        supabase
          .from("player_history_baseline")
          .select("player_name,legacy_trips"),
      ]);


    if (
      scoresResult.error
    ) {
      throw scoresResult.error;
    }


    if (
      scrambleResult.error
    ) {
      throw scrambleResult.error;
    }


    const playerHistory: Record<string, PlayerHistory> = {};
    const stablefordHistory: StablefordHistory = {
      allTimeRecord: undefined,
      loaded: !historicalStablefordResult.error,
    };

    const ensureHistory = (playerName: string) => {
      if (!playerHistory[playerName]) playerHistory[playerName] = {};
      return playerHistory[playerName];
    };

    if (historyAchievementsResult.error) {
      console.error(
        "Could not load achievement history for commentary:",
        historyAchievementsResult.error
      );
    } else {
      const knownPlayers = getTournamentPlayers(tournament).map((player) => player.name);
      for (const playerName of knownPlayers) ensureHistory(playerName).individualWins = 0;

      for (const row of historyAchievementsResult.data ?? []) {
        const playerName = normaliseText(row.player_name);
        const type = normaliseText(row.achievement_type);
        if (!playerName) continue;
        const history = ensureHistory(playerName);
        if (type === "individual_win") history.individualWins = (history.individualWins ?? 0) + 1;
        if (type === "longest_drive") history.longestDrives = (history.longestDrives ?? 0) + 1;
        if (type === "closest_to_pin") history.closestToPins = (history.closestToPins ?? 0) + 1;
      }
    }

    if (historicalStablefordResult.error) {
      console.error(
        "Could not load historical Stableford records for commentary:",
        historicalStablefordResult.error
      );
    } else {
      const rounds = new Map<string, Array<{ playerName: string; points: number }>>();

      for (const row of historicalStablefordResult.data ?? []) {
        const playerName = normaliseText(row.player_name);
        const points = Number(row.stableford_points ?? 0);
        if (!playerName || !Number.isFinite(points) || points <= 0) continue;

        stablefordHistory.allTimeRecord = Math.max(stablefordHistory.allTimeRecord ?? 0, points);
        const history = ensureHistory(playerName);
        history.bestStableford = Math.max(history.bestStableford ?? 0, points);
        history.previousStablefordScores = [...(history.previousStablefordScores ?? []), points];

        const key = `${normaliseText(row.event_slug)}-${Number(row.round_number ?? 0)}`;
        const roundRows = rounds.get(key) ?? [];
        roundRows.push({ playerName, points });
        rounds.set(key, roundRows);
      }

      for (const roundRows of rounds.values()) {
        const sorted = [...roundRows].sort((a, b) => b.points - a.points);
        for (const item of sorted) {
          const position = 1 + sorted.filter((other) => other.points > item.points).length;
          const history = ensureHistory(item.playerName);
          history.bestFinish = history.bestFinish
            ? Math.min(history.bestFinish, position)
            : position;
        }
      }
    }

    if (attendanceResult.error) {
      console.error("Could not load attendance history for commentary:", attendanceResult.error);
    } else {
      const attended = new Map<string, Set<string>>();
      for (const row of attendanceResult.data ?? []) {
        const playerName = normaliseText(row.player_name);
        const event = normaliseText(row.event_slug);
        if (!playerName || !event) continue;
        if (!attended.has(playerName)) attended.set(playerName, new Set());
        attended.get(playerName)!.add(event);
      }
      for (const [playerName, events] of attended) {
        ensureHistory(playerName).tripsAttended = events.size;
      }
    }

    if (baselineResult.error) {
      console.error("Could not load legacy trip history for commentary:", baselineResult.error);
    } else {
      for (const row of baselineResult.data ?? []) {
        const playerName = normaliseText(row.player_name);
        if (!playerName) continue;
        const history = ensureHistory(playerName);
        history.tripsAttended = (history.tripsAttended ?? 0) + Number(row.legacy_trips ?? 0);
      }
    }

    const currentStablefordScores =
      (
        scoresResult.data ??
        []
      ) as ScoreRow[];


    const currentScrambleScores =
      (
        scrambleResult.data ??
        []
      ) as ScoreRow[];


    /*
     * Reconstruct the database state immediately
     * BEFORE this group/hole batch.
     *
     * This is important when two groups are scoring
     * independently and also when a score is edited.
     */
    const savedStablefordRows =
      savedRows.filter(
        (row) =>
          Boolean(row.player_id)
      );


    const savedScrambleRows =
      savedRows.filter(
        (row) =>
          !row.player_id &&
          row.group_number
      );


    const previousStablefordRows =
      previousRows.filter(
        (row) =>
          Boolean(row.player_id)
      );


    const previousScrambleRows =
      previousRows.filter(
        (row) =>
          !row.player_id &&
          row.group_number
      );


    const stablefordBefore =
      replaceBatchWithPreviousRows(
        currentStablefordScores,
        savedStablefordRows,
        previousStablefordRows
      );


    const scrambleBefore =
      replaceBatchWithPreviousRows(
        currentScrambleScores,
        savedScrambleRows,
        previousScrambleRows
      );


    /*
     * Build BEFORE and AFTER leaderboards.
     */
    const leaderboardBefore =
      buildLeaderboard(
        stablefordBefore,
        scrambleBefore,
        tournament,
        roundNumber
      );


    const leaderboardAfterBase =
      buildLeaderboard(
        currentStablefordScores,
        currentScrambleScores,
        tournament,
        roundNumber
      );


    const leaderboardAfter =
      addMovements(
        leaderboardAfterBase,
        leaderboardBefore
      );


    const previousPositions =
      buildPositionMap(
        leaderboardBefore
      );


    const teamEvent =
      tournament.team_mode ===
        "teams" ||
      tournament.teamMode ===
        "teams";


    const teamsBefore =
      teamEvent
        ? buildTeams(
            leaderboardBefore
          )
        : [];


    const teamsAfter =
      teamEvent
        ? buildTeams(
            leaderboardAfter
          )
        : [];


    const previousTeamStandings =
      buildPreviousTeamMap(
        teamsBefore
      );


    const pairsBefore =
      buildPairStandings(
        scrambleBefore,
        tournament,
        roundNumber
      );


    const pairsAfter =
      buildPairStandings(
        currentScrambleScores,
        tournament,
        roundNumber
      );


    const previousPairStandings =
      buildPreviousPairMap(
        pairsBefore
      );


    /*
     * Generate commentary only from rows in
     * THIS scorer's changed Save Hole batch.
     *
     * This prevents another group's score update
     * from being mistaken for this group's event.
     */
    const generatedMoments:
      LiveMomentRow[] = [];


    for (
      const row of changedRows
    ) {
      if (row.player_id) {
        const moment =
          buildStablefordMoment(
            row,
            tournament,
            leaderboardAfter,
            leaderboardBefore
          );

        if (moment) {
          generatedMoments.push(
            moment
          );
        }
      }

      else if (
        row.group_number &&
        row.pair_number
      ) {
        const moment =
          buildScrambleMoment(
            row,
            tournament,
            pairsAfter,
            pairsBefore
          );

        if (moment) {
          generatedMoments.push(
            moment
          );
        }
      }
    }


    /*
     * Build the main "horse-race" storyline
     * after the complete group batch has landed.
     *
     * Use the final changed player as the latest
     * player context where appropriate.
     */
    const latestStablefordChanged =
      [...changedRows]
        .reverse()
        .find(
          (row) =>
            Boolean(
              row.player_id
            )
        );


    const primaryStoryline =
      getPrimaryStoryline({
        eventSlug,

        players:
          getTournamentPlayers(
            tournament
          ).map(
            (player) => ({
              id:
                Number(player.id),

              name:
                player.name,

              team:
                player.team ?? "",

              eventTeam:
                player.eventTeam ??
                "",
            })
          ),

        scores:
          currentStablefordScores,

        scrambleScores:
          currentScrambleScores,

        rounds:
          tournament.rounds ??
          [],

        leaderboard:
          leaderboardAfter.map(
            (row) => ({
              id:
                row.id,

              name:
                row.name,

              team:
                row.team,

              pos:
                row.pos,

              points:
                row.points,

              through:
                row.through,

              movement:
                row.movement,
            })
          ),

        previousPositions,

        teamStandings:
          teamsAfter.map(
            (team) => ({
              team:
                team.team,

              points:
                team.points,

              through:
                team.through,
            })
          ),

        previousTeamStandings,

        pairStandings:
          pairsAfter,

        previousPairStandings,

        latestPlayerId:
          latestStablefordChanged
            ?.player_id
            ? Number(
                latestStablefordChanged.player_id
              )
            : null,

        currentRoundNumber:
          roundNumber,

        totalHoles:
          getRound(
            tournament,
            roundNumber
          )?.holes?.length ||
          18,
      });


    if (
      primaryStoryline
    ) {
      generatedMoments.push(
        storylineToLiveMoment(
          primaryStoryline,
          eventSlug,
          roundNumber
        )
      );
    }


    /*
     * Remove exact duplicate keys inside this
     * request before broadcast enhancement.
     */
    const uniqueMomentMap =
      new Map<
        string,
        LiveMomentRow
      >();


    generatedMoments.forEach(
      (moment) => {
        uniqueMomentMap.set(
          moment.moment_key,
          moment
        );
      }
    );


    const uniqueMoments =
      Array.from(
        uniqueMomentMap.values()
      );


    /*
     * Apply the same Broadcast Producer used
     * by Live Centre.
     */
    const enhancedMoments =
      enhanceBroadcastMoments(
        uniqueMoments,
        (
          momentsResult.data ??
          []
        ).slice(0, 20),

        leaderboardAfter.map(
          (row) => ({
            name:
              row.name,

            pos:
              row.pos,

            points:
              row.points,

            through:
              row.through,
          })
        )
      );


    /*
     * Notification-only mode.
     *
     * We still use the existing scoring/context builders above to create
     * a good factual push summary, but we no longer save commentary
     * moments for a Live Centre feed.
     *
     * Durable duplicate protection is still handled below by the
     * push_checkpoint rows.
     */
    const createdMoments = 0;
    const duplicates = 0;
    let pushed = 0;

    /*
     * Admin emergency switch.
     *
     * Read this directly from Supabase on every refresh rather than trusting
     * the tournament object supplied by the scoring device. That means an
     * admin can pause automatic live pushes immediately, even if scorers have
     * an older/stale copy of the tournament setup open on their phones.
     *
     * Results/Admin notifications are sent elsewhere and are not affected.
     *
     * If this lookup itself fails, fail safe and suppress automatic live
     * pushes rather than risk sending alerts while the emergency control
     * cannot be verified.
     */
    const {
      data: livePushControl,
      error: livePushControlError,
    } =
      await supabase
        .from("tournaments_v2")
        .select("live_pushes_enabled")
        .eq("slug", eventSlug)
        .maybeSingle();

    if (livePushControlError) {
      console.error(
        "Could not load automatic live push setting:",
        livePushControlError
      );
    }

    const livePushesEnabled =
      !livePushControlError &&
      livePushControl?.live_pushes_enabled !== false;


    /*
     * Notification rhythm — one published update per scoring group,
     * followed by one separate hole-complete summary.
     *
     * Examples:
     *   1 group  -> Group 1, Hole Complete
     *   2 groups -> Group 1, Group 2, Hole Complete
     *   3 groups -> Group 1, Group 2, Group 3, Hole Complete
     *
     * Each item has its own durable checkpoint, so re-saving/editing scores
     * for a group cannot resend that group's notification. The final summary
     * has a different checkpoint and is only available once every configured
     * group has reported on the hole.
     */
    {
      const totalGroups =
        getRoundTotalGroups(
          tournament,
          roundNumber
        );

      /*
       * A group is complete only when every configured scoring unit for
       * that group has an authoritative saved row on this hole. For the
       * Worsley scramble this means every configured pair number exists in
       * scramble_scores. This deliberately does not infer completion from
       * how many other groups have reported.
       */
      const completedGroupNumbers =
        getCompletedGroupNumbers(
          tournament,
          currentStablefordScores,
          currentScrambleScores,
          roundNumber,
          holeNumber
        );

      let groupPushPublishedThisRequest = false;

      const publishPush = async ({
        checkpointKey,
        archiveKey,
        title,
        message,
      }: {
        checkpointKey: string;
        archiveKey: string;
        title: string;
        message: string;
      }) => {
        const reserved =
          await reservePushCheckpoint(
            supabase,
            {
              eventSlug,
              roundNumber,
              holeNumber,
              checkpointKey,
              message,
            }
          );

        if (!reserved) {
          return;
        }

        /*
         * Keep the checkpoint even while the emergency switch is OFF.
         * That prevents an old group/final alert firing later when live
         * notifications are switched back on.
         */
        if (!livePushesEnabled) {
          console.log(
            `Automatic live push suppressed for ${eventSlug} — Hole ${holeNumber}, ${checkpointKey}.`
          );
          return;
        }

        await saveMoment(
          supabase,
          {
            event_slug: eventSlug,
            moment_key:
              `push-notification-${roundNumber}-${holeNumber}-${archiveKey}`,
            moment_type:
              "push_notification",
            player_id: null,
            player_name: null,
            team: null,
            round_number: roundNumber,
            hole_number: holeNumber,
            icon: "⛳",
            title,
            text: message,
            rarity: "common",
          }
        );

        try {
          const result =
            await sendPushToAll({
              title: `⛳ ${title}`,
              message,
              url: "/live-centre",
              eventSlug,
              roundNumber,
              category: "live",
            });

          console.log(
            `Automatic live push ${checkpointKey} for ${eventSlug} Hole ${holeNumber}:`,
            result
          );

          if (result.sent > 0) {
            pushed += 1;
          }
        } catch (error) {
          console.error(
            "Automatic commentary push failed:",
            error
          );
        }
      };

      /*
       * GROUP UPDATE
       *
       * The Save Hole request is a single round/group/hole batch, so the
       * changed rows describe the group that has just reported. This update
       * uses the normal before/after context and therefore talks about what
       * that group has just done and its immediate leaderboard/team impact.
       */
      for (const groupNumber of [...completedGroupNumbers].sort((a, b) => a - b)) {
        const groupRows = [
          ...currentStablefordScores,
          ...currentScrambleScores,
        ].filter(
          (row) =>
            Number(row.round_number) === roundNumber &&
            Number(row.hole_number) === holeNumber &&
            Number(row.group_number) === groupNumber
        );

        const groupMessage =
          buildGroupPushSummary({
            rows: groupRows,
            tournament,
            holeNumber,
          });

        if (groupMessage && groupMessage.priority >= 75) {
          const pushedBefore = pushed;

          await publishPush({
            checkpointKey: `group-${groupNumber}`,
            archiveKey: `group-${groupNumber}`,
            title: `Hole ${holeNumber} · Group ${groupNumber}`,
            message: groupMessage.message,
          });

          if (pushed > pushedBefore) {
            groupPushPublishedThisRequest = true;
          }
        }
      }

      /*
       * HOLE-COMPLETE UPDATE
       *
       * This is deliberately a separate publication from the final group's
       * update. It compares the whole field before this hole with the whole
       * field after it, then labels the message as the hole conclusion. This
       * gives the phone/archive a clear group-by-group story followed by the
       * overall state of the tournament.
       */
      if (
        totalGroups > 0 &&
        completedGroupNumbers.size >= totalGroups
      ) {
        const stablefordAtHoleStart =
          rowsBeforeWholeHole(
            currentStablefordScores,
            roundNumber,
            holeNumber
          );

        const scrambleAtHoleStart =
          rowsBeforeWholeHole(
            currentScrambleScores,
            roundNumber,
            holeNumber
          );

        const leaderboardAtHoleStart =
          buildLeaderboard(
            stablefordAtHoleStart,
            scrambleAtHoleStart,
            tournament,
            roundNumber
          );

        const leaderboardAtHoleEnd =
          addMovements(
            leaderboardAfterBase,
            leaderboardAtHoleStart
          );

        const teamsAtHoleStart =
          teamEvent
            ? buildDisplayedTeamTotals(
                leaderboardAtHoleStart
              )
            : [];

        const teamsAtHoleEnd =
          teamEvent
            ? buildDisplayedTeamTotals(
                leaderboardAtHoleEnd
              )
            : [];

        const pairsAtHoleStart =
          buildPairStandings(
            scrambleAtHoleStart,
            tournament,
            roundNumber
          );

        const pairsAtHoleEnd =
          buildPairStandings(
            currentScrambleScores,
            tournament,
            roundNumber
          );

        const wholeHoleRows = [
          ...rowsOnHole(
            currentStablefordScores,
            roundNumber,
            holeNumber
          ),
          ...rowsOnHole(
            currentScrambleScores,
            roundNumber,
            holeNumber
          ),
        ];

        const finalSummary =
          buildPushSummary({
            rows: wholeHoleRows,
            tournament,
            holeNumber,
            teamEvent,
            leaderboardBefore:
              leaderboardAtHoleStart,
            leaderboardAfter:
              leaderboardAtHoleEnd,
            teamsBefore:
              teamsAtHoleStart,
            teamsAfter:
              teamsAtHoleEnd,
            pairsBefore:
              pairsAtHoleStart,
            pairsAfter:
              pairsAtHoleEnd,
            playerHistory,
            stablefordScoresBefore:
              stablefordAtHoleStart,
            stablefordScoresAfter:
              currentStablefordScores,
            stablefordHistory,
          });

        if (finalSummary) {
          const totalHoles = getRoundTotalHoles(tournament, roundNumber);
          const holesRemaining = Math.max(0, totalHoles - holeNumber);
          const editorialThreshold = holesRemaining <= 6 ? 70 : 78;
          const scheduledRaceCheck = [6, 9, 12, 15].includes(holeNumber);
          const isRoundComplete = holeNumber >= totalHoles;
          const shouldPublish =
            isRoundComplete ||
            scheduledRaceCheck ||
            finalSummary.priority >= editorialThreshold;

          if (shouldPublish) {
            if (groupPushPublishedThisRequest) {
              await new Promise((resolve) => setTimeout(resolve, 1200));
            }

            let title = `Hole ${holeNumber} Complete`;
            let finalMessage = capPushText(`Hole ${holeNumber} complete. ${finalSummary.message}`);

            // A winner is only announced once every configured group has a
            // complete authoritative row on the final hole.
            if (isRoundComplete) {
              title = "Final Result";

              if (teamEvent && teamsAtHoleEnd.length > 0) {
                const leader = teamsAtHoleEnd[0];
                const tied = teamsAtHoleEnd.filter((team) => team.points === leader.points);
                finalMessage = capPushText(
                  tied.length > 1
                    ? `FINAL RESULT — ${tied.map((team) => team.team).join(" and ")} finish tied on ${leader.points} pts.`
                    : `FINAL RESULT — ${leader.team} win the team round on ${leader.points} pts.`
                );
              } else if (leaderboardAtHoleEnd.length > 0) {
                const leader = leaderboardAtHoleEnd[0];
                const tied = leaderboardAtHoleEnd.filter((player) => player.points === leader.points);
                finalMessage = capPushText(
                  tied.length > 1
                    ? `FINAL RESULT — ${tied.map((player) => player.name).join(" and ")} finish tied on ${leader.points} pts.`
                    : `FINAL RESULT — ${leader.name} wins on ${leader.points} pts.`
                );
              }
            }

            await publishPush({
              checkpointKey: "complete",
              archiveKey: "complete",
              title,
              message: finalMessage,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,

      eventSlug,
      roundNumber,
      holeNumber,

      changedRows:
        changedRows.length,

      generatedMoments:
        enhancedMoments.length,

      createdMoments,

      duplicates,

      pushed,
      livePushesEnabled,
    });
  }

  catch (error) {
    console.error(
      "Commentary refresh route error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Unexpected commentary refresh error",

        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}