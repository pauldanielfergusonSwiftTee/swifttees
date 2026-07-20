import { PLAYER_PROFILES } from "./playerProfiles";
import type {
  CommentaryEvent,
  CommentaryMoment,
  CommentaryTier,
} from "./types";

type CommentaryTemplate = {
  id: string;
  icon: string;
  title: (event: CommentaryEvent) => string;
  text: (event: CommentaryEvent) => string;
  tier: CommentaryTier;
};

function deterministicNumber(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function selectTemplate(
  event: CommentaryEvent,
  templates: CommentaryTemplate[]
) {
  const index = deterministicNumber(event.eventKey) % templates.length;
  return templates[index];
}

function possessive(name: string) {
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}

function getPlayerProfile(playerName: string) {
  return PLAYER_PROFILES[playerName];
}

const birdieTemplates: CommentaryTemplate[] = [
  {
    id: "birdie-clinical",
    icon: "🐦",
    title: () => "Birdie Alert",
    text: (event) =>
      `${event.playerName} takes care of hole ${event.holeNumber} with a birdie. Clinical work.`,
    tier: "notable",
  },
  {
    id: "birdie-momentum",
    icon: "🐦",
    title: () => "Momentum Building",
    text: (event) =>
      `${event.playerName} finds a birdie on ${event.holeNumber}. The leaderboard may need watching.`,
    tier: "notable",
  },
  {
    id: "birdie-sky-sports",
    icon: "🐦",
    title: () => "Shot Made",
    text: (event) =>
      `That is quality from ${event.playerName}. Birdie secured at hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "birdie-pressure",
    icon: "🐦",
    title: () => "Pressure Applied",
    text: (event) =>
      `${event.playerName} rolls in a birdie at ${event.holeNumber} and applies a little more pressure.`,
    tier: "notable",
  },
  {
    id: "birdie-business",
    icon: "🐦",
    title: () => "Birdie Business",
    text: (event) =>
      `${event.playerName} quietly removes a shot from the card at hole ${event.holeNumber}. Very tidy.`,
    tier: "notable",
  },
];

const eagleTemplates: CommentaryTemplate[] = [
  {
    id: "eagle-special",
    icon: "🦅",
    title: () => "Eagle Alert",
    text: (event) =>
      `Something special from ${event.playerName}: eagle on hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "eagle-big-moment",
    icon: "🦅",
    title: () => "Huge Moment",
    text: (event) =>
      `${event.playerName} produces an eagle at ${event.holeNumber}. That could change everything.`,
    tier: "major",
  },
  {
    id: "eagle-statement",
    icon: "🦅",
    title: () => "Statement Made",
    text: (event) =>
      `Eagle for ${event.playerName}. Hole ${event.holeNumber} has just delivered a major tournament moment.`,
    tier: "major",
  },
];

const parTemplates: CommentaryTemplate[] = [
  {
    id: "par-steady",
    icon: "⛳",
    title: () => "Steady Golf",
    text: (event) =>
      `${event.playerName} safely negotiates hole ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "par-no-drama",
    icon: "⛳",
    title: () => "No Drama",
    text: (event) =>
      `A composed par for ${event.playerName} at hole ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "par-business",
    icon: "⛳",
    title: () => "Job Done",
    text: (event) =>
      `${event.playerName} signs for par at ${event.holeNumber} and moves on.`,
    tier: "normal",
  },
  {
    id: "par-professional",
    icon: "⛳",
    title: () => "Professional",
    text: (event) =>
      `Fairway, green, par. ${event.playerName} keeps things under control on ${event.holeNumber}.`,
    tier: "normal",
  },
];

const bogeyTemplates: CommentaryTemplate[] = [
  {
    id: "bogey-slip",
    icon: "📉",
    title: () => "A Small Slip",
    text: (event) =>
      `${event.playerName} drops one at hole ${event.holeNumber}. Nothing terminal, but not ideal.`,
    tier: "normal",
  },
  {
    id: "bogey-speed-bump",
    icon: "📉",
    title: () => "Speed Bump",
    text: (event) =>
      `Bogey for ${event.playerName} on ${event.holeNumber}. A minor interruption to proceedings.`,
    tier: "normal",
  },
  {
    id: "bogey-regroup",
    icon: "📉",
    title: () => "Time to Regroup",
    text: (event) =>
      `${event.playerName} gives one back at hole ${event.holeNumber}. The response now matters.`,
    tier: "normal",
  },
  {
    id: "bogey-card-damage",
    icon: "📉",
    title: () => "Card Damaged",
    text: (event) =>
      `Hole ${event.holeNumber} takes one from ${event.playerName}. Bogey recorded.`,
    tier: "normal",
  },
];

const disasterTemplates: CommentaryTemplate[] = [
  {
    id: "disaster-wheels",
    icon: "🚨",
    title: () => "Trouble",
    text: (event) =>
      `The wheels have briefly left the vehicle for ${event.playerName} on hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "disaster-card",
    icon: "💥",
    title: () => "Card Wrecker",
    text: (event) =>
      `${event.playerName} will not be framing the score from hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "disaster-search-party",
    icon: "🔍",
    title: () => "Damage Limitation",
    text: (event) =>
      `A difficult hole for ${event.playerName}. A search party may be required for the scorecard.`,
    tier: "notable",
  },
];
const scrambleEagleTemplates: CommentaryTemplate[] = [
  {
    id: "scramble-eagle-perfect",
    icon: "🦅",
    title: () => "Scramble Eagle",
    text: (event) =>
      `${event.playerName} combine brilliantly for eagle on hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "scramble-eagle-huge",
    icon: "🦅",
    title: () => "Huge Scramble Moment",
    text: (event) =>
      `Eagle for ${event.playerName} at hole ${event.holeNumber}. That is outstanding pair golf.`,
    tier: "major",
  },
  {
    id: "scramble-eagle-statement",
    icon: "🦅",
    title: () => "Statement Made",
    text: (event) =>
      `${event.playerName} produce one of the shots of the day: eagle at ${event.holeNumber}.`,
    tier: "major",
  },
];
const scrambleBirdieTemplates: CommentaryTemplate[] = [
  {
    id: "scramble-birdie-teamwork",
    icon: "🤝",
    title: () => "Perfect Partnership",
    text: (event) =>
      `${event.playerName} combine beautifully for birdie on hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "scramble-birdie-job",
    icon: "🐦",
    title: () => "Birdie Secured",
    text: (event) =>
      `${event.playerName} get the job done at ${event.holeNumber}. One birdie, two very satisfied golfers.`,
    tier: "notable",
  },
  {
    id: "scramble-birdie-pair",
    icon: "🤝",
    title: () => "Pair on the Move",
    text: (event) =>
      `Excellent scramble golf from ${event.playerName}. Birdie at hole ${event.holeNumber}.`,
    tier: "notable",
  },
];

const scrambleTemplates: CommentaryTemplate[] = [
  {
    id: "scramble-update",
    icon: "🤝",
    title: () => "Scramble Update",
    text: (event) =>
      `${event.playerName} complete hole ${event.holeNumber}${
        event.stablefordPoints
          ? ` for ${event.stablefordPoints} point${
              event.stablefordPoints === 1 ? "" : "s"
            }`
          : ""
      }.`,
    tier: "normal",
  },
  {
    id: "scramble-card",
    icon: "🤝",
    title: () => "Score Posted",
    text: (event) =>
      `${event.playerName} add another completed hole to the card at ${event.holeNumber}.`,
    tier: "normal",
  },
];

const bonusTemplates: CommentaryTemplate[] = [
  {
    id: "bonus-prize",
    icon: "🏆",
    title: () => "Bonus Secured",
    text: (event) =>
      `${event.playerName} claims the bonus prize on hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "bonus-bragging-rights",
    icon: "🎯",
    title: () => "Bragging Rights",
    text: (event) =>
      `${event.playerName} collects the bonus points and, more importantly, the bragging rights.`,
    tier: "major",
  },
  {
    id: "bonus-envelope",
    icon: "💰",
    title: () => "Into the Envelope",
    text: (event) =>
      `${event.playerName} wins the bonus contest at hole ${event.holeNumber}.`,
    tier: "major",
  },
];

function getTemplatesForEvent(event: CommentaryEvent) {
  switch (event.eventType) {
    case "birdie":
      return birdieTemplates;

    case "eagle":
      return eagleTemplates;

    case "par":
      return parTemplates;

    case "bogey":
      return bogeyTemplates;

    case "double_bogey_or_worse":
      return disasterTemplates;

      case "scramble_eagle":
  return scrambleEagleTemplates;

    case "scramble_birdie":
      return scrambleBirdieTemplates;

    case "scramble_score":
      return scrambleTemplates;

    case "bonus_win":
      return bonusTemplates;

    default:
      return parTemplates;
  }
}

function applyPlayerPersonality(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const profile = getPlayerProfile(event.playerName);

  if (!profile) return moment;

  const personalityNumber = deterministicNumber(
    `${event.eventKey}-${profile.key}-personality`
  );

  // Personality appears occasionally rather than in every comment.
  if (personalityNumber % 4 !== 0) return moment;

  if (
    profile.jokeKeys.includes("organiser") &&
    event.eventType === "birdie"
  ) {
    return {
      ...moment,
      text: `${moment.text} The organiser appears to have scheduled himself a birdie.`,
      templateId: `${moment.templateId}-organiser`,
    };
  }

  if (
    profile.jokeKeys.includes("equipment") &&
    event.eventType === "birdie"
  ) {
    return {
      ...moment,
      text: `${moment.text} The latest equipment adjustment has officially been declared a success.`,
      templateId: `${moment.templateId}-equipment`,
    };
  }

  if (
    profile.jokeKeys.includes("309") &&
    ["birdie", "eagle"].includes(event.eventType)
  ) {
    return {
      ...moment,
      text: `${moment.text} No confirmation yet whether the drive travelled 309 yards.`,
      templateId: `${moment.templateId}-309`,
    };
  }

  if (
    profile.jokeKeys.includes("birthday") &&
    ["birdie", "eagle"].includes(event.eventType)
  ) {
    return {
      ...moment,
      text: `${moment.text} ${possessive(
        event.playerName
      )} birthday celebrations may have started early.`,
      templateId: `${moment.templateId}-birthday`,
    };
  }

  if (
    profile.jokeKeys.includes("flight22") &&
    event.eventType === "birdie"
  ) {
    return {
      ...moment,
      text: `${moment.text} Flight 22 has been temporarily delayed while this is celebrated.`,
      templateId: `${moment.templateId}-flight22`,
    };
  }

  return moment;
}

export function buildCommentary(
  event: CommentaryEvent
): CommentaryMoment {
  const templates = getTemplatesForEvent(event);
  const template = selectTemplate(event, templates);

  const moment: CommentaryMoment = {
    icon: template.icon,
    title: template.title(event),
    text: template.text(event),
    tier: template.tier,
    templateId: template.id,
  };

  return applyPlayerPersonality(event, moment);
}