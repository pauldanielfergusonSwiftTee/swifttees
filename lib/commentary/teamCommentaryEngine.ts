import { buildCommentary } from "./commentaryEngine";
import type {
  CommentaryEvent,
  CommentaryMoment,
  CommentaryTier,
} from "./types";

function pointsText(points?: number): string {
  const value = Number(points ?? 0);
  return `${value} point${value === 1 ? "" : "s"}`;
}

function teamName(event: CommentaryEvent): string {
  const team = String(event.team ?? "").trim();
  return team ? `${team} Team` : "The team";
}

function closingSuffix(event: CommentaryEvent): string {
  const remaining = Number(event.holesRemaining ?? 0);

  if (event.tournamentStage === "final_hole") {
    return " with the final hole now decisive";
  }

  if (event.tournamentStage === "closing" && remaining > 0) {
    return ` with ${remaining} hole${remaining === 1 ? "" : "s"} remaining`;
  }

  if (event.tournamentStage === "complete") {
    return " with their round complete";
  }

  return "";
}

function createMoment(
  base: CommentaryMoment,
  event: CommentaryEvent,
  options: {
    icon: string;
    title: string;
    text: string;
    tier: CommentaryTier;
    id: string;
  },
): CommentaryMoment {
  return {
    ...base,
    icon: options.icon,
    title: options.title,
    text: options.text,
    tier: options.tier,
    templateId: `${base.templateId}-team-${options.id}`,
    storylineId: `${String(event.team ?? "team")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${options.id}`,
  };
}

/**
 * Team-first broadcast commentary.
 *
 * The normal commentary engine still produces the base player/personality
 * moment. In team events this function then promotes the team race and uses
 * the scorer as the reason the standings changed.
 */
export function buildBroadcastCommentary(
  event: CommentaryEvent,
): CommentaryMoment {
  const base = buildCommentary(event);

  if (!event.isTeamEvent || !event.team) {
    return base;
  }

  const team = teamName(event);
  const player = event.playerName;
  const hole = event.holeNumber;
  const contribution = pointsText(event.stablefordPoints);
  const afterPoints = Number(event.teamPointsAfter ?? 0);
  const gapBefore = Number(event.teamGapBefore ?? 0);
  const gapAfter = Number(event.teamGapAfter ?? 0);
  const stage = closingSuffix(event);

  if (event.isNewTeamLeader) {
    const lead =
      event.teamLeaderAfter === event.team && gapAfter === 0
        ? Math.max(
            0,
            afterPoints -
              Number(
                event.teamLeaderPointsAfter === afterPoints
                  ? 0
                  : event.teamLeaderPointsAfter ?? 0,
              ),
          )
        : 0;

    const leadText =
      lead > 0
        ? `, ${lead} point${lead === 1 ? "" : "s"} clear`
        : "";

    return createMoment(base, event, {
      icon: "🏆",
      title: `${team} Take the Lead`,
      text: `${team} take the outright lead on hole ${hole}. ${player}'s ${contribution} move them onto ${afterPoints}${leadText}${stage}.`,
      tier: "major",
      id: "lead-taken",
    });
  }

  if (event.isJointTeamLeader) {
    return createMoment(base, event, {
      icon: "⚔️",
      title: `${team} Join the Lead`,
      text: `${team} draw level at the top on hole ${hole}. ${player} supplies ${contribution} to move them onto ${afterPoints}${stage}.`,
      tier: "major",
      id: "lead-joined",
    });
  }

  if (event.teamLostLead) {
    const leader = event.teamLeaderAfter
      ? `${event.teamLeaderAfter} Team`
      : "the new leaders";

    return createMoment(base, event, {
      icon: "😬",
      title: `${team} Lose the Lead`,
      text: `${team} surrender top spot after hole ${hole}. ${player} adds ${contribution}, but ${leader} now head the team race${stage}.`,
      tier: "major",
      id: "lead-lost",
    });
  }

  if (event.teamExtendedLead) {
    return createMoment(base, event, {
      icon: "📈",
      title: `${team} Extend Their Lead`,
      text: `${team} tighten their grip on hole ${hole}. ${player}'s ${contribution} stretch the advantage from ${gapBefore} to ${gapAfter} point${gapAfter === 1 ? "" : "s"}${stage}.`,
      tier: gapAfter >= 4 ? "major" : "notable",
      id: "lead-extended",
    });
  }

  if (event.teamReducedGap) {
    const cutBy = Math.max(1, gapBefore - gapAfter);

    return createMoment(base, event, {
      icon: gapAfter <= 1 ? "👀" : "🔥",
      title: gapAfter <= 1 ? "Pressure Building" : `${team} Close the Gap`,
      text: `${team} hit back on hole ${hole}. ${player}'s ${contribution} cut the deficit by ${cutBy} to ${gapAfter} point${gapAfter === 1 ? "" : "s"}${stage}.`,
      tier: gapAfter <= 1 ? "major" : "notable",
      id: "gap-reduced",
    });
  }

  if ((event.teamPlacesMoved ?? 0) > 0) {
    const moved = Number(event.teamPlacesMoved ?? 0);
    const position = Number(event.teamPositionAfter ?? 0);

    return createMoment(base, event, {
      icon: moved >= 2 ? "🚀" : "🔥",
      title: `${team} Move Up`,
      text: `${team} climb ${moved === 1 ? "one place" : `${moved} places`} after hole ${hole}. ${player} contributes ${contribution} to move them into ${position}${position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"}${stage}.`,
      tier: moved >= 2 ? "major" : "notable",
      id: "position-gained",
    });
  }

  if (event.teamDroppedPosition) {
    const position = Number(event.teamPositionAfter ?? 0);

    return createMoment(base, event, {
      icon: "📉",
      title: `${team} Lose Ground`,
      text: `${team} slip to ${position}${position === 2 ? "nd" : position === 3 ? "rd" : "th"} after hole ${hole}. ${player} adds ${contribution}, but the team race has moved against them${stage}.`,
      tier: event.tournamentStage === "closing" ? "major" : "notable",
      id: "position-lost",
    });
  }

  if (
    event.teamPositionAfter === 1 &&
    event.teamLeaderAfter === event.team
  ) {
    return createMoment(base, event, {
      icon: "🛡️",
      title: `${team} Hold Firm`,
      text: `${team} protect top spot on hole ${hole}. ${player} adds ${contribution}, taking them to ${afterPoints}${stage}.`,
      tier: event.tournamentStage === "closing" ? "notable" : "normal",
      id: "lead-protected",
    });
  }

  if (
    typeof event.teamGapAfter === "number" &&
    event.teamGapAfter <= 2
  ) {
    return createMoment(base, event, {
      icon: "🎯",
      title: `${team} Stay in Touch`,
      text: `${team} remain firmly in the fight after hole ${hole}. ${player}'s ${contribution} leave them ${gapAfter} point${gapAfter === 1 ? "" : "s"} from the lead${stage}.`,
      tier: "notable",
      id: "in-contention",
    });
  }

  return createMoment(base, event, {
    icon: base.icon,
    title: `${team} Update`,
    text: `${player} adds ${contribution} for ${team} on hole ${hole}, moving their total to ${afterPoints}${stage}.`,
    tier: base.tier === "rare" || base.tier === "major" ? base.tier : "normal",
    id: "contribution",
  });
}
