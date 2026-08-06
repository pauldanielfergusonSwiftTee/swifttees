import type { CommentaryEvent } from "./types";

/**
 * Optional leaderboard information.
 *
 * The existing calls to buildStablefordEvent and buildScrambleEvent do not
 * need to change. Pass this context later when the Live Centre has calculated
 * leaderboard movement and the commentary engine will automatically gain the
 * extra information.
 */
export type CommentaryLeaderboardContext = {
  positionBefore?: number;
  positionAfter?: number;
  leaderGap?: number;
  isNewLeader?: boolean;
  isJointLeader?: boolean;
  holesCompleted?: number;
  totalHoles?: number;
};

type HoleDefinition = {
  hole?: number | string;
  number?: number | string;
  hole_number?: number | string;
  par?: number | string;
};

type RoundDefinition = {
  holes?: HoleDefinition[];
};

type StablefordScore = {
  round_number?: number | string;
  hole_number?: number | string;
  gross_score?: number | string | null;
  points?: number | string | null;
};

type PlayerDefinition = {
  id?: number;
  name?: string;
  team?: string;
};

export type ScrambleEventInput = {
  playerIds: Array<number | string>;
  pairNames: string;
  icon?: string;
  holeNumber: number;
  points?: number;
  roundNumber: number;

  /**
   * These fields are optional so the current scoring page remains compatible.
   * Supplying grossScore and par allows the event builder to classify the
   * scramble result without relying on an emoji.
   */
  grossScore?: number;
  par?: number;
  team?: string;
  holesCompleted?: number;
  totalHoles?: number;
};

function toFiniteNumber(
  value: unknown,
  fallback = 0
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function toOptionalFiniteNumber(
  value: unknown
): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function normaliseText(value: unknown): string {
  return String(value ?? "").trim();
}

function getHoleNumber(hole: HoleDefinition): number {
  return toFiniteNumber(
    hole.hole ??
      hole.number ??
      hole.hole_number,
    0
  );
}

function getRoundHoles(
  currentRound: RoundDefinition | null | undefined
): HoleDefinition[] {
  return Array.isArray(currentRound?.holes)
    ? currentRound.holes
    : [];
}

function getHolePar(
  currentRound: RoundDefinition | null | undefined,
  holeNumber: number
): number | undefined {
  const hole = getRoundHoles(currentRound).find(
    (candidate) =>
      getHoleNumber(candidate) === holeNumber
  );

  const par = toOptionalFiniteNumber(hole?.par);

  return par && par > 0
    ? par
    : undefined;
}

function getTotalHoles(
  currentRound: RoundDefinition | null | undefined,
  suppliedTotal?: number
): number {
  if (
    Number.isFinite(suppliedTotal) &&
    Number(suppliedTotal) > 0
  ) {
    return Number(suppliedTotal);
  }

  const validHoleNumbers = getRoundHoles(currentRound)
    .map(getHoleNumber)
    .filter((hole) => hole > 0);

  if (!validHoleNumbers.length) {
    return 18;
  }

  return Math.max(...validHoleNumbers);
}

function getTournamentStage(
  holeNumber: number,
  holesCompleted: number,
  totalHoles: number
): CommentaryEvent["tournamentStage"] {
  const safeTotal = Math.max(totalHoles, 1);
  const progress = holesCompleted / safeTotal;

  if (
    holeNumber >= safeTotal ||
    holesCompleted >= safeTotal
  ) {
    return "final_hole";
  }

  if (
    progress >= 0.72 ||
    holeNumber >= Math.max(safeTotal - 3, 1)
  ) {
    return "closing";
  }

  if (
    progress <= 0.22 ||
    holeNumber <= Math.min(4, safeTotal)
  ) {
    return "opening";
  }

  return "middle";
}

function getStablefordEventType(
  grossScore: number | undefined,
  par: number | undefined
): CommentaryEvent["eventType"] {
  if (
    grossScore === undefined ||
    par === undefined
  ) {
    return "par";
  }

  const scoreToPar = grossScore - par;

  if (scoreToPar <= -2) {
    return "eagle";
  }

  if (scoreToPar === -1) {
    return "birdie";
  }

  if (scoreToPar === 0) {
    return "par";
  }

  if (scoreToPar === 1) {
    return "bogey";
  }

  return "double_bogey_or_worse";
}

function getScrambleEventType(
  scrambleInfo: ScrambleEventInput
): CommentaryEvent["eventType"] {
  const grossScore = toOptionalFiniteNumber(
    scrambleInfo.grossScore
  );

  const par = toOptionalFiniteNumber(
    scrambleInfo.par
  );

  if (
    grossScore !== undefined &&
    par !== undefined
  ) {
    const scoreToPar = grossScore - par;

    if (scoreToPar <= -2) {
      return "scramble_eagle";
    }

    if (scoreToPar === -1) {
      return "scramble_birdie";
    }

    return "scramble_score";
  }

  /*
   * Backwards-compatible fallback for the existing scoring page.
   */
  if (scrambleInfo.icon === "🦅") {
    return "scramble_eagle";
  }

  if (scrambleInfo.icon === "🐦") {
    return "scramble_birdie";
  }

  return "scramble_score";
}

function buildLeaderboardFields(
  context?: CommentaryLeaderboardContext
): Pick<
  CommentaryEvent,
  | "positionBefore"
  | "positionAfter"
  | "placesMoved"
  | "leaderGap"
  | "isNewLeader"
  | "isJointLeader"
> {
  const positionBefore = toOptionalFiniteNumber(
    context?.positionBefore
  );

  const positionAfter = toOptionalFiniteNumber(
    context?.positionAfter
  );

  const suppliedLeaderGap = toOptionalFiniteNumber(
    context?.leaderGap
  );

  const placesMoved =
    positionBefore !== undefined &&
    positionAfter !== undefined
      ? Math.max(positionBefore - positionAfter, 0)
      : undefined;

  return {
    positionBefore,
    positionAfter,
    placesMoved,
    leaderGap:
      suppliedLeaderGap === undefined
        ? undefined
        : Math.max(suppliedLeaderGap, 0),
    isNewLeader:
      context?.isNewLeader ??
      (
        positionAfter === 1 &&
        positionBefore !== undefined &&
        positionBefore > 1
      ),
    isJointLeader:
      context?.isJointLeader ?? false,
  };
}

/**
 * Builds an individual Stableford commentary event.
 *
 * Existing usage remains valid:
 *
 * buildStablefordEvent(latestScore, player, currentRound)
 *
 * A fourth argument can optionally be supplied with leaderboard context.
 */
export function buildStablefordEvent(
  latestScore: StablefordScore | null | undefined,
  player: PlayerDefinition | null | undefined,
  currentRound: RoundDefinition | null | undefined,
  context?: CommentaryLeaderboardContext
): CommentaryEvent | null {
  if (!latestScore || !player) {
    return null;
  }

const playerName = normaliseText(player.name);
const playerId = Number(player.id);

const holeNumber = toFiniteNumber(
  latestScore.hole_number,
  0
);

const roundNumber = toFiniteNumber(
  latestScore.round_number,
  0
);

if (
  !playerName ||
  !Number.isFinite(playerId) ||
  playerId <= 0 ||
  holeNumber <= 0 ||
  roundNumber <= 0
) {
  return null;
}


  const grossScore = toOptionalFiniteNumber(
    latestScore.gross_score
  );

  const par = getHolePar(
    currentRound,
    holeNumber
  );

  const stablefordPoints = toFiniteNumber(
    latestScore.points,
    0
  );

  const totalHoles = getTotalHoles(
    currentRound,
    context?.totalHoles
  );

  const holesCompleted = Math.min(
    Math.max(
      toFiniteNumber(
        context?.holesCompleted,
        holeNumber
      ),
      0
    ),
    totalHoles
  );

  return {
    eventKey:
      `stableford-${roundNumber}-${String(playerId)}-${holeNumber}`,

    eventType: getStablefordEventType(
      grossScore,
      par
    ),

    playerId,
    playerName,
    team: normaliseText(player.team) || undefined,

    roundNumber,
    holeNumber,

    grossScore,
    par,
    stablefordPoints,

    tournamentStage: getTournamentStage(
      holeNumber,
      holesCompleted,
      totalHoles
    ),

    holesCompleted,
    holesRemaining: Math.max(
      totalHoles - holesCompleted,
      0
    ),

    ...buildLeaderboardFields(context),
  };
}

/**
 * Builds a pair-scramble commentary event.
 *
 * It remains fully compatible with the current icon-based input, while also
 * supporting grossScore and par when those values become available.
 */
export function buildScrambleEvent(
  scrambleInfo: ScrambleEventInput | null,
  context?: CommentaryLeaderboardContext
): CommentaryEvent | null {
  if (!scrambleInfo) {
    return null;
  }

  const pairNames = normaliseText(
    scrambleInfo.pairNames
  );

  const holeNumber = toFiniteNumber(
    scrambleInfo.holeNumber,
    0
  );

  const roundNumber = toFiniteNumber(
    scrambleInfo.roundNumber,
    0
  );

  if (
    !pairNames ||
    !Array.isArray(scrambleInfo.playerIds) ||
    !scrambleInfo.playerIds.length ||
    holeNumber <= 0 ||
    roundNumber <= 0
  ) {
    return null;
  }

  const playerIds = scrambleInfo.playerIds
    .filter(
      (playerId) =>
        playerId !== null &&
        playerId !== undefined &&
        String(playerId).trim() !== ""
    )
    .map(String);

  if (!playerIds.length) {
    return null;
  }

  const totalHoles = Math.max(
    toFiniteNumber(
      context?.totalHoles ??
        scrambleInfo.totalHoles,
      18
    ),
    1
  );

  const holesCompleted = Math.min(
    Math.max(
      toFiniteNumber(
        context?.holesCompleted ??
          scrambleInfo.holesCompleted,
        holeNumber
      ),
      0
    ),
    totalHoles
  );

  const grossScore = toOptionalFiniteNumber(
    scrambleInfo.grossScore
  );

  const par = toOptionalFiniteNumber(
    scrambleInfo.par
  );

  return {
    eventKey:
      `scramble-${roundNumber}-${playerIds.join("-")}-${holeNumber}`,

    eventType: getScrambleEventType(
      scrambleInfo
    ),

    playerId: undefined,
    playerName: pairNames,
    team:
      normaliseText(scrambleInfo.team) ||
      undefined,

    roundNumber,
    holeNumber,

    grossScore,
    par,
    stablefordPoints: toFiniteNumber(
      scrambleInfo.points,
      0
    ),

    tournamentStage: getTournamentStage(
      holeNumber,
      holesCompleted,
      totalHoles
    ),

    holesCompleted,
    holesRemaining: Math.max(
      totalHoles - holesCompleted,
      0
    ),

    ...buildLeaderboardFields(context),
  };
}