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

  // Individual leaderboard context
  positionBefore?: number;
  positionAfter?: number;
  placesMoved?: number;
  leaderGap?: number;
  isNewLeader?: boolean;
  isJointLeader?: boolean;
  holesCompleted?: number;
  holesRemaining?: number;

  // Team-event context
  isTeamEvent?: boolean;

  teamPositionBefore?: number;
  teamPointsBefore?: number;
  teamLeaderBefore?: string;
  teamLeaderPointsBefore?: number;
  teamGapBefore?: number;

  teamPositionAfter?: number;
  teamPointsAfter?: number;
  teamLeaderAfter?: string;
  teamLeaderPointsAfter?: number;
  teamGapAfter?: number;

  teamPlacesMoved?: number;
  isNewTeamLeader?: boolean;
  isJointTeamLeader?: boolean;
  teamExtendedLead?: boolean;
  teamReducedGap?: boolean;
  teamLostLead?: boolean;
  teamDroppedPosition?: boolean;
}

export interface CommentaryMoment {
  icon: string;
  title: string;
  text: string;
  tier: CommentaryTier;
  templateId: string;
  storylineId?: string;
}
