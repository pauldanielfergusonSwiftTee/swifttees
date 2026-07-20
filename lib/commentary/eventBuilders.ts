import type { CommentaryEvent } from "./types";

export function buildStablefordEvent(
  latestScore: any,
  player: any,
  currentRound: any
): CommentaryEvent | null {

  if (!latestScore || !player) return null;

  const gross = Number(latestScore.gross_score ?? 0);

  const hole = Number(latestScore.hole_number);

  const par =
    Number(
      currentRound?.holes?.find(
        (h: any) =>
          Number(h.hole ?? h.number ?? h.hole_number) === hole
      )?.par ?? 0
    );

  const scoreToPar = gross - par;

  let eventType: CommentaryEvent["eventType"] = "par";

  if (scoreToPar <= -2)
    eventType = "eagle";

  else if (scoreToPar === -1)
    eventType = "birdie";

  else if (scoreToPar === 0)
    eventType = "par";

  else if (scoreToPar === 1)
    eventType = "bogey";

  else
    eventType = "double_bogey_or_worse";

  return {
    eventKey: `stableford-${latestScore.round_number}-${player.id}-${hole}`,

    eventType,

    playerId: player.id,

    playerName: player.name,

    team: player.team,

    roundNumber: Number(latestScore.round_number),

    holeNumber: hole,

    grossScore: gross,

    par,

    stablefordPoints: Number(latestScore.points ?? 0),

    tournamentStage: "middle",
  };
}
type ScrambleEventInput = {
  playerIds: number[];
  pairNames: string;
  icon: string;
  holeNumber: number;
  points: number;
  roundNumber: number;
};

export function buildScrambleEvent(
  scrambleInfo: ScrambleEventInput | null
): CommentaryEvent | null {
  if (!scrambleInfo?.pairNames) return null;

  let eventType: CommentaryEvent["eventType"] =
    "scramble_score";

  if (scrambleInfo.icon === "🦅") {
    eventType = "scramble_eagle";
  } else if (scrambleInfo.icon === "🐦") {
    eventType = "scramble_birdie";
  }

  return {
    eventKey: `scramble-${scrambleInfo.roundNumber}-${scrambleInfo.playerIds.join(
      "-"
    )}-${scrambleInfo.holeNumber}`,

    eventType,

    playerId: undefined,
playerName: scrambleInfo.pairNames,
team: undefined,

    roundNumber: scrambleInfo.roundNumber,
    holeNumber: scrambleInfo.holeNumber,

    stablefordPoints: scrambleInfo.points,
    tournamentStage: "middle",
  };
}