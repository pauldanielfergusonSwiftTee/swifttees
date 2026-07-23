import type {
  CommentaryEvent,
  CommentaryEventType,
  CommentaryTier,
} from "./types";

export type StorylineKind =
  | "back_to_back_birdies"
  | "three_birdies_in_five"
  | "four_birdies_in_six"
  | "eagle_burst"
  | "bogey_streak"
  | "disaster_run"
  | "bounce_back"
  | "clean_card"
  | "strong_finish"
  | "late_collapse"
  | "new_leader"
  | "joined_lead"
  | "lead_extended"
  | "within_one"
  | "big_climber"
  | "big_drop"
  | "team_lead_change"
  | "team_pressure"
  | "pair_hot_streak"
  | "pair_recovery";

export type StorylineScope = "player" | "pair" | "team" | "tournament";

export type Storyline = {
  key: string;
  kind: StorylineKind;
  scope: StorylineScope;
  tier: CommentaryTier;
  icon: string;
  title: string;
  text: string;
  playerId?: number;
  playerName?: string;
  pairKey?: string;
  pairNames?: string;
  team?: string;
  roundNumber?: number;
  holeNumber?: number;
  priority: number;
  metadata?: Record<string, string | number | boolean | null>;
};

function deterministicNumber(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function selectStorylineText(seed: string, lines: string[]): string {
  return lines[deterministicNumber(seed) % lines.length];
}

function ensureStorylineHoleNumber(storyline: Storyline): Storyline {
  const holeNumber = Number(storyline.holeNumber);

  if (!Number.isFinite(holeNumber) || holeNumber <= 0) {
    return storyline;
  }

  const text = String(storyline.text ?? "").trim();
  const alreadyIncludesHole =
    new RegExp(`\\bhole\\s+${holeNumber}\\b`, "i").test(text) ||
    new RegExp(`\\bafter\\s+(?:the\\s+)?hole\\s+${holeNumber}\\b`, "i").test(text) ||
    new RegExp(`\\bthrough\\s+${holeNumber}(?:\\s+holes?)?\\b`, "i").test(text) ||
    new RegExp(`\\b${holeNumber}(?:st|nd|rd|th)?\\s+hole\\b`, "i").test(text);

  if (alreadyIncludesHole) {
    return storyline;
  }

  const hasPunctuation = /[.!?]$/.test(text);
  const punctuation = hasPunctuation ? text.slice(-1) : ".";
  const textWithoutPunctuation = hasPunctuation ? text.slice(0, -1) : text;

  return {
    ...storyline,
    text: `${textWithoutPunctuation} after hole ${holeNumber}${punctuation}`,
  };
}

export type StorylineScoreRow = {
  id?: number | string;
  player_id?: number | string | null;
  round_number?: number | string | null;
  hole_number?: number | string | null;
  gross_score?: number | string | null;
  points?: number | string | null;
  score_type?: string | null;
  updated_at?: string | null;
};

export type StorylineScrambleScoreRow = {
  id?: number | string;
  round_number?: number | string | null;
  group_number?: number | string | null;
  pair_number?: number | string | null;
  hole_number?: number | string | null;
  gross_score?: number | string | null;
  points?: number | string | null;
  updated_at?: string | null;
};

export type StorylinePlayer = {
  id?: number | string;
  name?: string;
  team?: string;
  eventTeam?: string;
};

export type StorylineLeaderboardRow = {
  id: number;
  name: string;
  team?: string;
  pos: number;
  points: number;
  through: number;
  movement?: {
    icon?: string;
    text?: string;
  };
};

export type StorylineTeamStanding = {
  team: string;
  points: number;
  through: number;
};

export type StorylinePairStanding = {
  pairKey: string;
  playerIds: number[];
  pairNames: string;
  points: number;
  through: number;
  pos: number;
};

export type StorylineRound = {
  roundNumber?: number | string;
  round_number?: number | string;
  id?: number | string;
  format?: string;
  holes?: Array<{
    hole?: number | string;
    number?: number | string;
    hole_number?: number | string;
    par?: number | string;
  }>;
  groups?: Array<{
    groupNumber?: number | string;
    group_number?: number | string;
    id?: number | string;
    pairs?: Array<{
      pairNumber?: number | string;
      pair_number?: number | string;
      player1_id?: number | string;
      player2_id?: number | string;
    }>;
  }>;
};

export type StorylineInput = {
  eventSlug: string;
  players: StorylinePlayer[];
  scores: StorylineScoreRow[];
  scrambleScores?: StorylineScrambleScoreRow[];
  rounds?: StorylineRound[];
  leaderboard?: StorylineLeaderboardRow[];
  previousPositions?: Record<string, number>;
  teamStandings?: StorylineTeamStanding[];
  previousTeamStandings?: Record<
    string,
    {
      pos?: number;
      points?: number;
    }
  >;
  pairStandings?: StorylinePairStanding[];
  previousPairStandings?: Record<
    string,
    {
      pos?: number;
      points?: number;
    }
  >;
  latestEvent?: CommentaryEvent | null;
  latestPlayerId?: number | null;
  currentRoundNumber?: number;
  totalHoles?: number;
};

const POSITIVE_TYPES = new Set<CommentaryEventType>([
  "birdie",
  "eagle",
  "scramble_birdie",
  "scramble_eagle",
]);

const NEGATIVE_TYPES = new Set<CommentaryEventType>([
  "bogey",
  "double_bogey_or_worse",
]);

function toNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalise(value: unknown): string {
  return String(value ?? "").trim();
}

function roundNumberOf(round: StorylineRound): number {
  return toNumber(round.roundNumber ?? round.round_number ?? round.id);
}

function holeNumberOf(
  hole: NonNullable<StorylineRound["holes"]>[number],
): number {
  return toNumber(hole.hole ?? hole.number ?? hole.hole_number);
}

function getRound(
  rounds: StorylineRound[],
  roundNumber: number,
): StorylineRound | undefined {
  return rounds.find((round) => roundNumberOf(round) === roundNumber);
}

function getPar(
  rounds: StorylineRound[],
  roundNumber: number,
  holeNumber: number,
): number | undefined {
  const round = getRound(rounds, roundNumber);
  const hole = round?.holes?.find(
    (candidate) => holeNumberOf(candidate) === holeNumber,
  );

  const par = toNumber(hole?.par);
  return par > 0 ? par : undefined;
}

function classifyStablefordScore(
  score: StorylineScoreRow,
  rounds: StorylineRound[],
): CommentaryEventType {
  const gross = toNumber(score.gross_score, Number.NaN);
  const roundNumber = toNumber(score.round_number);
  const holeNumber = toNumber(score.hole_number);
  const par = getPar(rounds, roundNumber, holeNumber);

  if (!Number.isFinite(gross) || !par) {
    const points = toNumber(score.points);

    if (points >= 5) return "eagle";
    if (points >= 4) return "birdie";
    if (points >= 2) return "par";
    if (points === 1) return "bogey";
    return "double_bogey_or_worse";
  }

  const difference = gross - par;

  if (difference <= -2) return "eagle";
  if (difference === -1) return "birdie";
  if (difference === 0) return "par";
  if (difference === 1) return "bogey";
  return "double_bogey_or_worse";
}

function uniqueStorylines(storylines: Storyline[]): Storyline[] {
  const seen = new Set<string>();

  return storylines
    .sort((a, b) => b.priority - a.priority)
    .filter((storyline) => {
      if (seen.has(storyline.key)) return false;
      seen.add(storyline.key);
      return true;
    });
}

function makeKey(
  input: StorylineInput,
  parts: Array<string | number | undefined | null>,
): string {
  return [input.eventSlug, ...parts]
    .filter((part) => part !== undefined && part !== null && part !== "")
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

function formatOrdinal(position: number): string {
  const remainder100 = position % 100;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return `${position}th`;
  }

  if (position % 10 === 1) return `${position}st`;
  if (position % 10 === 2) return `${position}nd`;
  if (position % 10 === 3) return `${position}rd`;
  return `${position}th`;
}

function getMovementAmount(row: StorylineLeaderboardRow): number {
  const text = normalise(row.movement?.text);
  const match = text.match(/(up|down)\s+(\d+)/i);

  if (!match) return 0;
  return toNumber(match[2]);
}

function getCurrentRoundNumber(input: StorylineInput): number {
  if (input.currentRoundNumber) return input.currentRoundNumber;
  if (input.latestEvent?.roundNumber) return input.latestEvent.roundNumber;

  const latest = [...input.scores, ...(input.scrambleScores ?? [])].sort(
    (a, b) =>
      new Date(b.updated_at ?? 0).getTime() -
      new Date(a.updated_at ?? 0).getTime(),
  )[0];

  return toNumber(latest?.round_number, 1);
}

function getTotalHoles(input: StorylineInput, roundNumber: number): number {
  if (input.totalHoles && input.totalHoles > 0) return input.totalHoles;

  const round = getRound(input.rounds ?? [], roundNumber);
  const holes = round?.holes ?? [];

  if (!holes.length) return 18;

  return Math.max(...holes.map(holeNumberOf).filter((hole) => hole > 0), 18);
}

function getPlayerName(
  input: StorylineInput,
  playerId: number,
): string | undefined {
  return input.players.find((player) => toNumber(player.id) === playerId)?.name;
}

function getPlayerTeam(
  input: StorylineInput,
  playerId: number,
): string | undefined {
  const player = input.players.find(
    (candidate) => toNumber(candidate.id) === playerId,
  );

  return normalise(player?.eventTeam ?? player?.team) || undefined;
}

function playerScoreHistory(
  input: StorylineInput,
  playerId: number,
  roundNumber: number,
) {
  return input.scores
    .filter(
      (score) =>
        toNumber(score.player_id) === playerId &&
        toNumber(score.round_number) === roundNumber &&
        normalise(score.score_type || "stableford") === "stableford",
    )
    .map((score) => ({
      raw: score,
      holeNumber: toNumber(score.hole_number),
      eventType: classifyStablefordScore(score, input.rounds ?? []),
      points: toNumber(score.points),
    }))
    .filter((score) => score.holeNumber > 0)
    .sort((a, b) => a.holeNumber - b.holeNumber);
}

function buildPlayerFormStorylines(input: StorylineInput): Storyline[] {
  const roundNumber = getCurrentRoundNumber(input);
  const totalHoles = getTotalHoles(input, roundNumber);
  const storylines: Storyline[] = [];
  const playerIds = Array.from(
    new Set(
      input.scores
        .filter((score) => toNumber(score.round_number) === roundNumber)
        .map((score) => toNumber(score.player_id))
        .filter((id) => id > 0),
    ),
  );

  for (const playerId of playerIds) {
    const name = getPlayerName(input, playerId);
    if (!name) continue;

    const team = getPlayerTeam(input, playerId);
    const history = playerScoreHistory(input, playerId, roundNumber);
    if (!history.length) continue;

    const latest = history[history.length - 1];
    const recent2 = history.slice(-2);
    const recent3 = history.slice(-3);
    const recent5 = history.slice(-5);
    const recent6 = history.slice(-6);

    const birdiesInFive = recent5.filter((score) =>
      POSITIVE_TYPES.has(score.eventType),
    ).length;

    const birdiesInSix = recent6.filter((score) =>
      POSITIVE_TYPES.has(score.eventType),
    ).length;

    if (
      recent2.length === 2 &&
      recent2.every((score) => POSITIVE_TYPES.has(score.eventType))
    ) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "back-to-back-birdies",
        ]),
        kind: "back_to_back_birdies",
        scope: "player",
        tier: "major",
        icon: "🔥",
        title: "Back-to-Back Birdies",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${roundNumber}-${latest.holeNumber}-back-to-back`,
          [
            `${name} has gone birdie-birdie and the round is suddenly gathering serious momentum.`,
            `${name} makes it two birdies in a row. The charge is properly under way.`,
            `Back-to-back birdies for ${name}. The leaderboard has been given something to think about.`,
            `${name} follows one birdie with another and is suddenly one of the stories of the round.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 92,
        metadata: { runLength: 2 },
      });
    }

    if (birdiesInFive >= 3) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "three-in-five",
        ]),
        kind: "three_birdies_in_five",
        scope: "player",
        tier: "major",
        icon: "🔥",
        title: "Player on a Charge",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-three-in-five`,
          [
            `${name} has produced ${birdiesInFive} birdies or better in the last five holes. That is a proper charge.`,
            `${birdiesInFive} birdies or better in five holes for ${name}. This round is catching fire.`,
            `${name} is tearing through this stretch with ${birdiesInFive} birdies or better in five holes.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 90,
        metadata: { positiveScores: birdiesInFive, window: 5 },
      });
    }

    if (birdiesInSix >= 4) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "four-in-six",
        ]),
        kind: "four_birdies_in_six",
        scope: "player",
        tier: "rare",
        icon: "🚀",
        title: "Red-Hot Run",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-four-in-six`,
          [
            `${name} has made ${birdiesInSix} birdies or better in six holes. The course is taking a hiding.`,
            `${birdiesInSix} birdies or better in six holes from ${name}. This is outrageous form.`,
            `${name} is on a red-hot run: ${birdiesInSix} birdies or better across six holes.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 98,
        metadata: { positiveScores: birdiesInSix, window: 6 },
      });
    }

    if (recent3.some((score) => score.eventType === "eagle")) {
      const eagle = [...recent3]
        .reverse()
        .find((score) => score.eventType === "eagle");

      if (eagle) {
        storylines.push({
          key: makeKey(input, [
            "player",
            playerId,
            roundNumber,
            eagle.holeNumber,
            "eagle-burst",
          ]),
          kind: "eagle_burst",
          scope: "player",
          tier: "rare",
          icon: "🦅",
          title: "Eagle Ignites the Round",
          text: selectStorylineText(
            `${input.eventSlug}-${playerId}-${eagle.holeNumber}-eagle-burst`,
            [
              `${name}'s eagle on hole ${eagle.holeNumber} has transformed the shape of this round.`,
              `Eagle for ${name} on hole ${eagle.holeNumber}. The whole tournament picture has shifted.`,
              `${name} produces an eagle on hole ${eagle.holeNumber}, and suddenly this round looks very different.`,
              `A huge eagle from ${name} on hole ${eagle.holeNumber}. That could be the moment the round turns.`,
            ],
          ),
          playerId,
          playerName: name,
          team,
          roundNumber,
          holeNumber: eagle.holeNumber,
          priority: 99,
        });
      }
    }

    if (
      recent2.length === 2 &&
      recent2.every((score) => NEGATIVE_TYPES.has(score.eventType))
    ) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "bogey-streak",
        ]),
        kind: "bogey_streak",
        scope: "player",
        tier: "notable",
        icon: "📉",
        title: "Momentum Lost",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-bogey-streak`,
          [
            `${name} has dropped shots on consecutive holes and needs to stop the slide quickly.`,
            `Back-to-back dropped shots for ${name}. The next hole has become very important.`,
            `${name} is moving in the wrong direction after consecutive dropped shots.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 78,
        metadata: { runLength: 2 },
      });
    }

    if (
      recent3.length === 3 &&
      recent3.filter((score) => score.eventType === "double_bogey_or_worse")
        .length >= 2
    ) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "disaster-run",
        ]),
        kind: "disaster_run",
        scope: "player",
        tier: "major",
        icon: "💥",
        title: "Round Unravelling",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-disaster-run`,
          [
            `${name} has found serious trouble twice in the last three holes. This round is threatening to get away.`,
            `Two major mistakes in three holes for ${name}. The round is beginning to unravel.`,
            `${name} has hit serious trouble twice in three holes. Damage limitation is now the priority.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 91,
      });
    }

    if (
      recent2.length === 2 &&
      NEGATIVE_TYPES.has(recent2[0].eventType) &&
      POSITIVE_TYPES.has(recent2[1].eventType)
    ) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "bounce-back",
        ]),
        kind: "bounce_back",
        scope: "player",
        tier: "notable",
        icon: "💪",
        title: "Immediate Response",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-bounce-back`,
          [
            `${name} answers the dropped shot with a birdie. That is exactly how to respond.`,
            `Immediate response from ${name}: a birdie straight after the setback.`,
            `${name} wastes no time repairing the damage with a birdie at the very next hole.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 84,
      });
    }

    const hasDroppedShot = history.some((score) =>
      NEGATIVE_TYPES.has(score.eventType),
    );

    if (!hasDroppedShot && history.length >= 6) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "clean-card",
        ]),
        kind: "clean_card",
        scope: "player",
        tier: history.length >= 12 ? "major" : "notable",
        icon: "🧼",
        title: "Card Still Clean",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-clean-card`,
          [
            `${name} has completed ${history.length} holes without a dropped shot.`,
            `${history.length} holes played and still no dropped shot for ${name}. Very tidy golf.`,
            `${name}'s card remains spotless through ${history.length} holes.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: history.length >= 12 ? 93 : 75,
        metadata: { holesWithoutDroppedShot: history.length },
      });
    }

    const closingWindow = history.filter(
      (score) => score.holeNumber >= Math.max(totalHoles - 3, 1),
    );

    if (
      closingWindow.length >= 2 &&
      closingWindow.filter((score) => POSITIVE_TYPES.has(score.eventType))
        .length >= 2
    ) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "strong-finish",
        ]),
        kind: "strong_finish",
        scope: "player",
        tier: "major",
        icon: "🏁",
        title: "Finishing Fast",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-strong-finish`,
          [
            `${name} is producing a serious finish when it matters most.`,
            `${name} has found another gear in the closing stretch.`,
            `This is a powerful finish from ${name}, exactly when the pressure is highest.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 95,
      });
    }

    if (
      latest.holeNumber >= Math.max(totalHoles - 3, 1) &&
      recent2.length === 2 &&
      recent2.every((score) => NEGATIVE_TYPES.has(score.eventType))
    ) {
      storylines.push({
        key: makeKey(input, [
          "player",
          playerId,
          roundNumber,
          latest.holeNumber,
          "late-collapse",
        ]),
        kind: "late_collapse",
        scope: "player",
        tier: "major",
        icon: "😬",
        title: "Late Trouble",
        text: selectStorylineText(
          `${input.eventSlug}-${playerId}-${latest.holeNumber}-late-collapse`,
          [
            `${name} has stumbled badly in the closing stretch. The timing could hardly be worse.`,
            `Late trouble for ${name}. The round is slipping at the worst possible time.`,
            `${name} has hit a rough patch in the closing holes, and the leaderboard will punish it.`,
          ],
        ),
        playerId,
        playerName: name,
        team,
        roundNumber,
        holeNumber: latest.holeNumber,
        priority: 96,
      });
    }
  }

  return storylines;
}

function buildLeaderboardStorylines(input: StorylineInput): Storyline[] {
  const leaderboard = input.leaderboard ?? [];
  if (!leaderboard.length) return [];

  const storylines: Storyline[] = [];
  const leader = leaderboard[0];
  const second = leaderboard[1];
  const latestPlayerId = input.latestPlayerId ?? input.latestEvent?.playerId;
  const latestRow = leaderboard.find((row) => row.id === latestPlayerId);

  if (latestRow) {
    const previousPosition = input.previousPositions?.[String(latestRow.id)];
    const jointLeaders = leaderboard.filter(
      (row) => row.points === leader.points,
    );

    if (
      latestRow.pos === 1 &&
      previousPosition !== undefined &&
      previousPosition > 1 &&
      jointLeaders.length === 1
    ) {
      storylines.push({
        key: makeKey(input, [
          "leaderboard",
          latestRow.id,
          latestRow.points,
          "new-leader",
        ]),
        kind: "new_leader",
        scope: "tournament",
        tier: "major",
        icon: "🏆",
        title: "New Leader",
        text: selectStorylineText(
          `${input.eventSlug}-${latestRow.id}-${latestRow.through}-new-leader`,
          [
            `${latestRow.name} has moved to the top of the leaderboard on ${latestRow.points} points.`,
            `${latestRow.name} takes over at the summit with ${latestRow.points} points.`,
            `A new name at the top: ${latestRow.name} now leads on ${latestRow.points} points.`,
          ],
        ),
        playerId: latestRow.id,
        playerName: latestRow.name,
        team: latestRow.team,
        holeNumber: latestRow.through,
        priority: 100,
      });
    } else if (
      latestRow.pos === 1 &&
      jointLeaders.length > 1 &&
      previousPosition !== 1
    ) {
      storylines.push({
        key: makeKey(input, [
          "leaderboard",
          latestRow.id,
          latestRow.points,
          "joined-lead",
        ]),
        kind: "joined_lead",
        scope: "tournament",
        tier: "major",
        icon: "⚔️",
        title: "Tied at the Top",
        text: selectStorylineText(
          `${input.eventSlug}-${latestRow.id}-${latestRow.through}-joined-lead`,
          [
            `${latestRow.name} has joined the lead on ${latestRow.points} points.`,
            `${latestRow.name} draws level at the top with ${latestRow.points} points.`,
            `It is tied at the summit as ${latestRow.name} reaches ${latestRow.points} points.`,
          ],
        ),
        playerId: latestRow.id,
        playerName: latestRow.name,
        team: latestRow.team,
        holeNumber: latestRow.through,
        priority: 97,
      });
    }

    if (latestRow.pos > 1 && leader.points - latestRow.points === 1) {
      storylines.push({
        key: makeKey(input, [
          "leaderboard",
          latestRow.id,
          latestRow.points,
          "within-one",
        ]),
        kind: "within_one",
        scope: "tournament",
        tier: "major",
        icon: "👀",
        title: "Right on the Leader's Shoulder",
        text: selectStorylineText(
          `${input.eventSlug}-${latestRow.id}-${latestRow.through}-within-one`,
          [
            `${latestRow.name} is now just one point behind ${leader.name}.`,
            `${latestRow.name} closes to within a single point of ${leader.name}.`,
            `Only one point now separates ${latestRow.name} from leader ${leader.name}.`,
          ],
        ),
        playerId: latestRow.id,
        playerName: latestRow.name,
        team: latestRow.team,
        holeNumber: latestRow.through,
        priority: 94,
      });
    }
  }

  if (leader && second && leader.points > second.points) {
    const previousLeaderPosition = input.previousPositions?.[String(leader.id)];

    if (previousLeaderPosition === 1 && leader.points - second.points >= 3) {
      storylines.push({
        key: makeKey(input, [
          "leaderboard",
          leader.id,
          leader.points,
          second.points,
          "lead-extended",
        ]),
        kind: "lead_extended",
        scope: "tournament",
        tier: "notable",
        icon: "🏆",
        title: "Leader Pulling Clear",
        text: selectStorylineText(
          `${input.eventSlug}-${leader.id}-${leader.through}-lead-extended`,
          [
            `${leader.name} has opened a ${leader.points - second.points}-point advantage at the top.`,
            `${leader.name} stretches the lead to ${leader.points - second.points} points.`,
            `The gap is growing: ${leader.name} now leads by ${leader.points - second.points}.`,
          ],
        ),
        playerId: leader.id,
        playerName: leader.name,
        team: leader.team,
        holeNumber: leader.through,
        priority: 82,
        metadata: { lead: leader.points - second.points },
      });
    }
  }

  const biggestClimber = leaderboard
    .filter((row) => row.movement?.icon === "▲")
    .sort((a, b) => getMovementAmount(b) - getMovementAmount(a))[0];

  if (biggestClimber && getMovementAmount(biggestClimber) >= 2) {
    const amount = getMovementAmount(biggestClimber);

    storylines.push({
      key: makeKey(input, [
        "leaderboard",
        biggestClimber.id,
        biggestClimber.pos,
        "big-climber",
      ]),
      kind: "big_climber",
      scope: "tournament",
      tier: amount >= 3 ? "major" : "notable",
      icon: "🚀",
      title: "Flying Up the Table",
      text: selectStorylineText(
        `${input.eventSlug}-${biggestClimber.id}-${biggestClimber.through}-big-climber`,
        [
          `${biggestClimber.name} has climbed ${amount} places into ${formatOrdinal(biggestClimber.pos)}.`,
          `${biggestClimber.name} surges ${amount} places up the leaderboard into ${formatOrdinal(biggestClimber.pos)}.`,
          `A major move from ${biggestClimber.name}, up ${amount} places to ${formatOrdinal(biggestClimber.pos)}.`,
        ],
      ),
      playerId: biggestClimber.id,
      playerName: biggestClimber.name,
      team: biggestClimber.team,
      holeNumber: biggestClimber.through,
      priority: amount >= 3 ? 89 : 76,
      metadata: { placesMoved: amount },
    });
  }

  const biggestDrop = leaderboard
    .filter((row) => row.movement?.icon === "▼")
    .sort((a, b) => getMovementAmount(b) - getMovementAmount(a))[0];

  if (biggestDrop && getMovementAmount(biggestDrop) >= 2) {
    const amount = getMovementAmount(biggestDrop);

    storylines.push({
      key: makeKey(input, [
        "leaderboard",
        biggestDrop.id,
        biggestDrop.pos,
        "big-drop",
      ]),
      kind: "big_drop",
      scope: "tournament",
      tier: amount >= 3 ? "major" : "notable",
      icon: "📉",
      title: "Losing Ground",
      text: selectStorylineText(
        `${input.eventSlug}-${biggestDrop.id}-${biggestDrop.through}-big-drop`,
        [
          `${biggestDrop.name} has fallen ${amount} places to ${formatOrdinal(biggestDrop.pos)}.`,
          `${biggestDrop.name} drops ${amount} places on the leaderboard to ${formatOrdinal(biggestDrop.pos)}.`,
          `A costly slide for ${biggestDrop.name}, down ${amount} places into ${formatOrdinal(biggestDrop.pos)}.`,
        ],
      ),
      playerId: biggestDrop.id,
      playerName: biggestDrop.name,
      team: biggestDrop.team,
      holeNumber: biggestDrop.through,
      priority: amount >= 3 ? 88 : 74,
      metadata: { placesDropped: amount },
    });
  }

  return storylines;
}

function buildTeamStorylines(input: StorylineInput): Storyline[] {
  const teams = input.teamStandings ?? [];
  if (teams.length < 2) return [];

  const storylines: Storyline[] = [];
  const leader = teams[0];
  const second = teams[1];
  const previousLeader = Object.entries(input.previousTeamStandings ?? {}).sort(
    ([, a], [, b]) => toNumber(a.pos, 999) - toNumber(b.pos, 999),
  )[0];

  if (previousLeader && previousLeader[0] !== leader.team) {
    storylines.push({
      key: makeKey(input, ["team", leader.team, leader.points, "lead-change"]),
      kind: "team_lead_change",
      scope: "team",
      tier: "major",
      icon: "🥊",
      title: "Team Lead Changes Hands",
      text: selectStorylineText(
        `${input.eventSlug}-${leader.team}-${leader.through}-team-lead`,
        [
          `${leader.team} Team have moved ahead in the team race on ${leader.points} points.`,
          `${leader.team} Team take control of the team race with ${leader.points} points.`,
          `The team lead changes hands: ${leader.team} move top on ${leader.points} points.`,
        ],
      ),
      team: leader.team,
      holeNumber: leader.through,
      priority: 96,
    });
  }

  const gap = leader.points - second.points;

  if (gap >= 0 && gap <= 2) {
    storylines.push({
      key: makeKey(input, [
        "team",
        leader.team,
        second.team,
        leader.points,
        second.points,
        "pressure",
      ]),
      kind: "team_pressure",
      scope: "team",
      tier: gap <= 1 ? "major" : "notable",
      icon: "⚔️",
      title: "Team Race Tightens",
      text:
        gap === 0
          ? selectStorylineText(
              `${input.eventSlug}-${leader.team}-${second.team}-${leader.through}-team-level`,
              [
                `${leader.team} and ${second.team} are level in the team race.`,
                `Nothing separates ${leader.team} and ${second.team} at the top of the team standings.`,
                `The team contest is all square between ${leader.team} and ${second.team}.`,
              ],
            )
          : selectStorylineText(
              `${input.eventSlug}-${leader.team}-${second.team}-${leader.through}-team-pressure`,
              [
                `${leader.team} lead ${second.team} by only ${gap} point${gap === 1 ? "" : "s"}.`,
                `Only ${gap} point${gap === 1 ? "" : "s"} separate ${leader.team} and ${second.team}.`,
                `${second.team} remain right on ${leader.team}'s heels, just ${gap} point${gap === 1 ? "" : "s"} back.`,
              ],
            ),
      team: leader.team,
      holeNumber: Math.min(leader.through, second.through),
      priority: gap <= 1 ? 91 : 79,
      metadata: { gap },
    });
  }

  return storylines;
}

function buildPairStorylines(input: StorylineInput): Storyline[] {
  const pairs = input.pairStandings ?? [];
  if (!pairs.length) return [];

  const storylines: Storyline[] = [];

  for (const pair of pairs) {
    const previous = input.previousPairStandings?.[pair.pairKey];

    if (previous && toNumber(previous.pos) > 1 && pair.pos === 1) {
      storylines.push({
        key: makeKey(input, ["pair", pair.pairKey, pair.points, "hot-streak"]),
        kind: "pair_hot_streak",
        scope: "pair",
        tier: "major",
        icon: "🔥",
        title: "Pair Take Control",
        text: selectStorylineText(
          `${input.eventSlug}-${pair.pairKey}-${pair.through}-pair-lead`,
          [
            `${pair.pairNames} have surged into the lead on ${pair.points} points.`,
            `${pair.pairNames} take over at the top with ${pair.points} points.`,
            `A big move from ${pair.pairNames}, who now lead on ${pair.points} points.`,
          ],
        ),
        pairKey: pair.pairKey,
        pairNames: pair.pairNames,
        holeNumber: pair.through,
        priority: 98,
      });
    }

    if (previous && toNumber(previous.pos) - pair.pos >= 2) {
      const places = toNumber(previous.pos) - pair.pos;

      storylines.push({
        key: makeKey(input, ["pair", pair.pairKey, pair.pos, "recovery"]),
        kind: "pair_recovery",
        scope: "pair",
        tier: places >= 3 ? "major" : "notable",
        icon: "🚀",
        title: "Pair on the Move",
        text: selectStorylineText(
          `${input.eventSlug}-${pair.pairKey}-${pair.through}-pair-recovery`,
          [
            `${pair.pairNames} have climbed ${places} places into ${formatOrdinal(pair.pos)}.`,
            `${pair.pairNames} jump ${places} places to ${formatOrdinal(pair.pos)}.`,
            `The pair are flying: ${pair.pairNames} move up ${places} places into ${formatOrdinal(pair.pos)}.`,
          ],
        ),
        pairKey: pair.pairKey,
        pairNames: pair.pairNames,
        holeNumber: pair.through,
        priority: places >= 3 ? 90 : 80,
        metadata: { placesMoved: places },
      });
    }
  }

  return storylines;
}

export function buildStorylines(input: StorylineInput): Storyline[] {
  if (!normalise(input.eventSlug)) return [];

  return uniqueStorylines([
    ...buildPlayerFormStorylines(input),
    ...buildLeaderboardStorylines(input),
    ...buildTeamStorylines(input),
    ...buildPairStorylines(input),
  ]).map(ensureStorylineHoleNumber);
}

export function getPrimaryStoryline(input: StorylineInput): Storyline | null {
  return buildStorylines(input)[0] ?? null;
}

export function getStorylinesForPlayer(
  input: StorylineInput,
  playerId: number,
): Storyline[] {
  return buildStorylines(input).filter(
    (storyline) => storyline.playerId === playerId,
  );
}

export function getStorylinesForTeam(
  input: StorylineInput,
  team: string,
): Storyline[] {
  const normalisedTeam = normalise(team).toLowerCase();

  return buildStorylines(input).filter(
    (storyline) => normalise(storyline.team).toLowerCase() === normalisedTeam,
  );
}
