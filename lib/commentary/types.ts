export type CommentaryTier =
  | "normal"
  | "notable"
  | "major"
  | "rare";

export type TournamentStage =
  | "opening"
  | "early"
  | "middle"
  | "closing"
  | "final_hole"
  | "complete";

export type CommentaryEventType =
  | "par"
  | "birdie"
  | "eagle"
  | "bogey"
  | "double_bogey_or_worse"
  | "scramble_score"
  | "scramble_birdie"
  | "scramble_eagle"
  | "bonus_win";

export interface CommentaryEvent {
  eventKey: string;

  eventType: CommentaryEventType;

  playerId?: number;

  playerName: string;

  team?: string;

  roundNumber: number;

  holeNumber: number;

  grossScore?: number;

  par?: number;

  stablefordPoints?: number;

  tournamentStage: TournamentStage;

  positionBefore?: number;

  positionAfter?: number;

  placesMoved?: number;
}

export interface CommentaryMoment {
  icon: string;

  title: string;

  text: string;

  tier: CommentaryTier;

  templateId: string;

  storylineId?: string;
}