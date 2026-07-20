import {
  getPlayerProfile,
  type PersonalityPhraseType,
} from "./playerProfiles";

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

function getPersonalityPhraseType(
  event: CommentaryEvent
): PersonalityPhraseType | null {
  switch (event.eventType) {
    case "birdie":
      return "birdie";

    case "eagle":
      return "eagle";

    case "par":
      return "par";

    case "bogey":
      return "bogey";

    case "double_bogey_or_worse":
      return "disaster";

    case "bonus_win":
      return "rare";

    default:
      return null;
  }
}

function selectPlayerPhrase(
  event: CommentaryEvent,
  phraseType: PersonalityPhraseType
): string | null {
  const profile = getPlayerProfile(event.playerName);

  if (!profile) {
    return null;
  }

  const phrases = profile.phrases[phraseType];

  if (!phrases?.length) {
    return null;
  }

  const phraseNumber = deterministicNumber(
    `${event.eventKey}-${profile.key}-${phraseType}-phrase`
  );

  return phrases[phraseNumber % phrases.length];
}

function selectRunningJoke(event: CommentaryEvent): string | null {
  const profile = getPlayerProfile(event.playerName);

  if (!profile?.runningJokes.length) {
    return null;
  }

  const jokeNumber = deterministicNumber(
    `${event.eventKey}-${profile.key}-running-joke`
  );

  return profile.runningJokes[jokeNumber % profile.runningJokes.length];
}

function applyLeaderboardContext(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  
  
   const profile = getPlayerProfile(event.playerName);

if (!profile) return moment;

const activeProfile = profile;

function choosePhrase(
  phraseType:
    | "leading"
    | "chasing"
    | "pressure"
    | "comeback"
) {
  const phrases = activeProfile.phrases[phraseType];

  if (!phrases?.length) return null;

  const phraseNumber = deterministicNumber(
    `${event.eventKey}-${activeProfile.key}-${phraseType}-context`
  );

  return phrases[phraseNumber % phrases.length];
}

  /*
    New outright leader takes highest priority.
  */
  if (event.isNewLeader && !event.isJointLeader) {
    const phrase = choosePhrase("leading");

    return {
      ...moment,
      icon: "👑",
      title: "New Leader",
      text:
        phrase ??
        `${event.playerName} moves into the outright lead.`,
      tier: "major",
      templateId: `${moment.templateId}-${activeProfile.key}-new-leader`,
      storylineId: `${activeProfile.key}-lead`,
    };
  }

  /*
    Player has joined a tie at the top.
  */
  if (
    event.isJointLeader &&
    typeof event.positionBefore === "number" &&
    event.positionBefore > 1
  ) {
    const phrase = choosePhrase("leading");

    return {
      ...moment,
      icon: "⚔️",
      title: "Tied at the Top",
      text:
        phrase ??
        `${event.playerName} joins the leaders at the top of the table.`,
      tier: "major",
      templateId: `${moment.templateId}-${activeProfile.key}-joint-leader`,
      storylineId: `${activeProfile.key}-lead`,
    };
  }

  /*
    A meaningful rise through the leaderboard.
  */
  if ((event.placesMoved ?? 0) >= 2) {
    const phrase = choosePhrase("comeback");

    return {
      ...moment,
      icon: "🔥",
      title:
        (event.placesMoved ?? 0) >= 4
          ? "Flying Up the Table"
          : "On the Move",
      text:
        phrase ??
        `${event.playerName} climbs ${
          event.placesMoved
        } places on the leaderboard.`,
      tier:
        (event.placesMoved ?? 0) >= 4
          ? "major"
          : "notable",
      templateId: `${moment.templateId}-${activeProfile.key}-comeback`,
      storylineId: `${activeProfile.key}-charge`,
    };
  }

  /*
    Close enough to put pressure on the leader.
  */
  if (
    event.positionAfter !== undefined &&
    event.positionAfter > 1 &&
    event.positionAfter <= 3 &&
    event.leaderGap !== undefined &&
    event.leaderGap <= 2
  ) {
    const phrase = choosePhrase("chasing");

    return {
      ...moment,
      icon: "🎯",
      title: "Closing In",
      text: phrase
        ? `${phrase} ${
            event.leaderGap === 0
              ? "They are level at the top."
              : `${event.leaderGap} point${
                  event.leaderGap === 1 ? "" : "s"
                } separate them from the lead.`
          }`
        : `${event.playerName} is now within ${event.leaderGap} point${
            event.leaderGap === 1 ? "" : "s"
          } of the lead.`,
      tier: "notable",
      templateId: `${moment.templateId}-${activeProfile.key}-chasing`,
      storylineId: `${activeProfile.key}-chase`,
    };
  }

  /*
    Closing-hole pressure for players still in contention.
  */
  if (
    ["closing", "final_hole"].includes(event.tournamentStage) &&
    event.positionAfter !== undefined &&
    event.positionAfter <= 3
  ) {
    const phrase = choosePhrase("pressure");

    return {
      ...moment,
      icon: "⏳",
      title:
        event.tournamentStage === "final_hole"
          ? "Final-Hole Pressure"
          : "Pressure Building",
      text:
        phrase ??
        `${event.playerName} remains firmly involved as the closing holes arrive.`,
      tier:
        event.tournamentStage === "final_hole"
          ? "major"
          : "notable",
      templateId: `${moment.templateId}-${activeProfile.key}-pressure`,
      storylineId: `${activeProfile.key}-pressure`,
    };
  }

  /*
    The current leader extends or protects the advantage.
  */
  if (
    event.positionAfter === 1 &&
    !event.isJointLeader &&
    ["birdie", "eagle"].includes(event.eventType)
  ) {
    const phrase = choosePhrase("leading");

    return {
      ...moment,
      icon: "👑",
      title: "Lead Strengthened",
      text:
        phrase ??
        `${event.playerName} strengthens the position at the top.`,
      tier:
        event.eventType === "eagle"
          ? "major"
          : "notable",
      templateId: `${moment.templateId}-${activeProfile.key}-leading`,
      storylineId: `${activeProfile.key}-lead`,
    };
  }

  return moment;
}

function applyPlayerPersonality(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const profile = getPlayerProfile(event.playerName);

  if (!profile) {
    return moment;
  }

const isContextualMoment = Boolean(moment.storylineId);

if (isContextualMoment) {
  const jokeNumber =
    deterministicNumber(
      `${event.eventKey}-${profile.key}-context-joke`
    ) % 100;

  if (jokeNumber < 15) {
    const runningJoke = selectRunningJoke(event);

    if (runningJoke) {
      return {
        ...moment,
        text: `${moment.text} ${runningJoke}`,
        templateId: `${moment.templateId}-running-joke`,
      };
    }
  }

  return moment;
}

  const phraseType = getPersonalityPhraseType(event);

  if (!phraseType) {
    return moment;
  }

  const personalityNumber =
    deterministicNumber(
      `${event.eventKey}-${profile.key}-personality-style`
    ) % 100;

  /*
    Commentary mix:

    0–59   = normal commentary          60%
    60–84  = player personality         25%
    85–94  = normal + running joke      10%
    95–99  = rare player commentary      5%
  */

  if (personalityNumber < 60) {
    return moment;
  }

  if (personalityNumber < 85) {
    const personalityPhrase = selectPlayerPhrase(event, phraseType);

    if (!personalityPhrase) {
      return moment;
    }

    return {
      ...moment,
      text: personalityPhrase,
      templateId: `${moment.templateId}-${profile.key}-${phraseType}`,
    };
  }

  if (personalityNumber < 95) {
    const runningJoke = selectRunningJoke(event);

    if (!runningJoke) {
      return moment;
    }

    return {
      ...moment,
      text: `${moment.text} ${runningJoke}`,
      templateId: `${moment.templateId}-${profile.key}-running-joke`,
    };
  }

  const rarePhrase = selectPlayerPhrase(event, "rare");

  if (!rarePhrase) {
    return moment;
  }

  return {
    ...moment,
    text: rarePhrase,
    tier:
      moment.tier === "major"
        ? "major"
        : "notable",
    templateId: `${moment.templateId}-${profile.key}-rare`,
  };
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

  const contextualMoment = applyLeaderboardContext(
  event,
  moment
);

return applyPlayerPersonality(
  event,
  contextualMoment
);
}

export function getRunningJokeForPlayer(
  playerName: string,
  eventKey: string
): string | null {
  const profile = getPlayerProfile(playerName);

  if (!profile?.runningJokes.length) {
    return null;
  }

  const jokeNumber = deterministicNumber(
    `${eventKey}-${profile.key}-scramble-running-joke`
  );

  return profile.runningJokes[
    jokeNumber % profile.runningJokes.length
  ];
}