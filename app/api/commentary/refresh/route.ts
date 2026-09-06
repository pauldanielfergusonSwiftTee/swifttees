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
};


type TournamentRound = {
  id?: number | string;
  roundNumber?: number | string;
  round_number?: number | string;

  format?: string;

  holes?: TournamentHole[];
  groups?: TournamentGroup[];
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

  return (
    normaliseText(tournamentPlayer?.eventTeam) ||
    normaliseText(player.eventTeam) ||
    normaliseText(player.team)
  );
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
    .join(" & ");

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


function shouldSendPush(
  moment: LiveMomentRow
) {
  const significantTypes =
    new Set([
      "stableford_birdie",
      "stableford_eagle",

      "scramble_birdie",
      "scramble_eagle",

      "scramble_lead_taken",
      "scramble_lead_joined",
      "scramble_gap_cut_to_one",
      "scramble_gap_reduced",
      "scramble_movement_up",
      "scramble_lead_extended",

      "movement_up",
      "movement_down",

      "battle_alert",
      "team_battle",
    ]);


  if (
    moment.moment_type.startsWith(
      "storyline_"
    )
  ) {
    return true;
  }

  if (
    significantTypes.has(
      moment.moment_type
    )
  ) {
    return true;
  }

  return moment.rarity === "major";
}


async function saveMomentAndPush(
  supabase: ReturnType<
    typeof createClient
  >,
  moment: LiveMomentRow
) {
  /*
   * INSERT, not UPSERT.
   *
   * The existing unique constraint on
   * (event_slug, moment_key) is our final
   * duplicate-notification protection.
   */
  const {
    data,
    error,
  } =
    await supabase
      .from("live_moments")
      .insert(moment)
      .select("*")
      .single();


  if (
    error?.code === "23505"
  ) {
    return {
      created: false,
      duplicate: true,
      pushed: false,
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
      pushed: false,
    };
  }


  let pushed = false;


  if (
    shouldSendPush(moment)
  ) {
    try {
      const result =
        await sendPushToAll({
          title:
            "⛳ Live Update",

          message:
            `${moment.icon ? `${moment.icon} ` : ""}${moment.title} — ${moment.text}`,

          url:
            "/live-centre",
        });

      pushed =
        result.sent > 0;
    } catch (error) {
      console.error(
        "Automatic commentary push failed:",
        error
      );
    }
  }


  return {
    created: true,
    duplicate: false,
    pushed,
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


    if (
      changedRows.length === 0
    ) {
      return NextResponse.json({
        success: true,

        message:
          "No scoring changes detected",

        changedRows: 0,
        createdMoments: 0,
        pushed: 0,
      });
    }


    /*
     * Load CURRENT tournament state.
     */
    const [
      scoresResult,
      scrambleResult,
      momentsResult,
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
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(20),
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


    let createdMoments = 0;
    let duplicates = 0;
    let pushed = 0;


    /*
     * Insert + push sequentially so the stored
     * broadcast order matches the batch order.
     */
    for (
      const moment of
        enhancedMoments
    ) {
      const result =
        await saveMomentAndPush(
          supabase,
          moment
        );


      if (result.created) {
        createdMoments += 1;
      }


      if (result.duplicate) {
        duplicates += 1;
      }


      if (result.pushed) {
        pushed += 1;
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