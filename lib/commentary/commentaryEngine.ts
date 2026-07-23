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
    id: "birdie-quality",
    icon: "🐦",
    title: () => "Quality Golf",
    text: (event) =>
      `That is excellent from ${event.playerName}. Birdie secured at hole ${event.holeNumber}.`,
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
  {
    id: "birdie-dangerous",
    icon: "🔥",
    title: () => "Looking Dangerous",
    text: (event) =>
      `${event.playerName} picks up a birdie on ${event.holeNumber} and is beginning to look dangerous.`,
    tier: "notable",
  },
  {
    id: "birdie-circle",
    icon: "🐦",
    title: () => "Circle on the Card",
    text: (event) =>
      `Another circle goes onto the card for ${event.playerName} at hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "birdie-reward",
    icon: "🐦",
    title: () => "Reward Earned",
    text: (event) =>
      `${event.playerName} gets the reward at ${event.holeNumber}. A very well-earned birdie.`,
    tier: "notable",
  },
  {
    id: "birdie-putter",
    icon: "🎯",
    title: () => "Putter Wakes Up",
    text: (event) =>
      `${event.playerName}'s putter delivers at hole ${event.holeNumber}. Birdie.`,
    tier: "notable",
  },
  {
    id: "birdie-noiseless",
    icon: "🐦",
    title: () => "Quietly Done",
    text: (event) =>
      `No fuss from ${event.playerName}. Just a birdie at ${event.holeNumber} and straight onto the next tee.`,
    tier: "notable",
  },
  {
    id: "birdie-answer",
    icon: "💪",
    title: () => "Strong Answer",
    text: (event) =>
      `${event.playerName} answers with a birdie on hole ${event.holeNumber}. That is a confident response.`,
    tier: "notable",
  },
  {
    id: "birdie-statement",
    icon: "📣",
    title: () => "Statement Made",
    text: (event) =>
      `Birdie for ${event.playerName} at ${event.holeNumber}. A little message sent to the rest of the field.`,
    tier: "notable",
  },
  {
    id: "birdie-cash-in",
    icon: "🐦",
    title: () => "Chance Taken",
    text: (event) =>
      `${event.playerName} cashes in at hole ${event.holeNumber}. Birdie safely banked.`,
    tier: "notable",
  },
  {
    id: "birdie-timing",
    icon: "⏱️",
    title: () => "Perfect Timing",
    text: (event) =>
      `A timely birdie for ${event.playerName} on hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "birdie-leaderboard",
    icon: "📈",
    title: () => "Leaderboard Move",
    text: (event) =>
      `${event.playerName} makes birdie at ${event.holeNumber}. That will improve the view of the leaderboard.`,
    tier: "notable",
  },
  {
    id: "birdie-clean",
    icon: "🐦",
    title: () => "Clean Work",
    text: (event) =>
      `Clean, controlled and converted. ${event.playerName} birdies hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "birdie-refuses",
    icon: "🔥",
    title: () => "Still in the Fight",
    text: (event) =>
      `${event.playerName} refuses to go away. Birdie at hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "birdie-problem",
    icon: "⚠️",
    title: () => "Problem for the Field",
    text: (event) =>
      `One swing, one putt, one more problem for everyone else. Birdie for ${event.playerName} on ${event.holeNumber}.`,
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
  {
    id: "eagle-stunner",
    icon: "🤯",
    title: () => "Stunning Golf",
    text: (event) =>
      `${event.playerName} lights up hole ${event.holeNumber} with an eagle. Sensational.`,
    tier: "major",
  },
  {
    id: "eagle-two-shot-swing",
    icon: "🦅",
    title: () => "Two-Shot Swing",
    text: (event) =>
      `A huge leap forward for ${event.playerName}. Eagle at hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "eagle-roar",
    icon: "📣",
    title: () => "Roar Around the Course",
    text: (event) =>
      `That will be heard around the course. ${event.playerName} makes eagle on ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "eagle-highlight",
    icon: "🎥",
    title: () => "Highlight Reel",
    text: (event) =>
      `${event.playerName} delivers a highlight-reel eagle at hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "eagle-tournament",
    icon: "🏆",
    title: () => "Tournament Moment",
    text: (event) =>
      `Eagle for ${event.playerName} on ${event.holeNumber}. That is the kind of score tournaments turn on.`,
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
  {
    id: "par-solid",
    icon: "⛳",
    title: () => "Solid Work",
    text: (event) =>
      `${event.playerName} keeps the card tidy with par at hole ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "par-bank",
    icon: "🏦",
    title: () => "Par Banked",
    text: (event) =>
      `Par safely banked by ${event.playerName} on hole ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "par-quiet",
    icon: "⛳",
    title: () => "Quiet Progress",
    text: (event) =>
      `${event.playerName} makes an uneventful par at ${event.holeNumber}. Exactly the point.`,
    tier: "normal",
  },
  {
    id: "par-steady-hands",
    icon: "👐",
    title: () => "Steady Hands",
    text: (event) =>
      `Nothing spectacular, nothing wasted. Par for ${event.playerName} on ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "par-hold",
    icon: "🧱",
    title: () => "Holding Firm",
    text: (event) =>
      `${event.playerName} holds firm with par at hole ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "par-clean-card",
    icon: "✅",
    title: () => "Card Kept Clean",
    text: (event) =>
      `A clean par for ${event.playerName} at ${event.holeNumber}. No damage done.`,
    tier: "normal",
  },
  {
    id: "par-routine",
    icon: "⛳",
    title: () => "Routine Work",
    text: (event) =>
      `${event.playerName} makes hole ${event.holeNumber} look pleasantly straightforward.`,
    tier: "normal",
  },
  {
    id: "par-next",
    icon: "➡️",
    title: () => "On to the Next",
    text: (event) =>
      `Par for ${event.playerName} at ${event.holeNumber}. Take it and move on.`,
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
  {
    id: "bogey-not-script",
    icon: "😬",
    title: () => "Not in the Script",
    text: (event) =>
      `${event.playerName} walks off ${event.holeNumber} with bogey. That was not part of the plan.`,
    tier: "normal",
  },
  {
    id: "bogey-stumble",
    icon: "📉",
    title: () => "Brief Stumble",
    text: (event) =>
      `A stumble for ${event.playerName} at hole ${event.holeNumber}, but there is plenty of golf left.`,
    tier: "normal",
  },
  {
    id: "bogey-one-back",
    icon: "↩️",
    title: () => "One Given Back",
    text: (event) =>
      `${event.playerName} hands one back to the course at ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "bogey-frustration",
    icon: "😤",
    title: () => "Frustrating Finish",
    text: (event) =>
      `Bogey for ${event.playerName} on ${event.holeNumber}. A frustrating end to the hole.`,
    tier: "normal",
  },
  {
    id: "bogey-damage-limited",
    icon: "🛠️",
    title: () => "Damage Limited",
    text: (event) =>
      `${event.playerName} escapes hole ${event.holeNumber} with only a bogey.`,
    tier: "normal",
  },
  {
    id: "bogey-course-wins",
    icon: "🌳",
    title: () => "Course Wins That One",
    text: (event) =>
      `The course takes the point on ${event.holeNumber}. Bogey for ${event.playerName}.`,
    tier: "normal",
  },
  {
    id: "bogey-reset",
    icon: "🔄",
    title: () => "Reset Required",
    text: (event) =>
      `${event.playerName} drops a shot at ${event.holeNumber}. Reset and go again.`,
    tier: "normal",
  },
  {
    id: "bogey-not-fatal",
    icon: "📉",
    title: () => "No Disaster",
    text: (event) =>
      `A bogey goes on the card for ${event.playerName} at ${event.holeNumber}. Recoverable.`,
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
  {
    id: "disaster-forget",
    icon: "🗑️",
    title: () => "One to Forget",
    text: (event) =>
      `${event.playerName} will be deleting hole ${event.holeNumber} from the memory bank immediately.`,
    tier: "notable",
  },
  {
    id: "disaster-spiral",
    icon: "🌀",
    title: () => "Things Escalated",
    text: (event) =>
      `Hole ${event.holeNumber} escalated quickly for ${event.playerName}.`,
    tier: "notable",
  },
  {
    id: "disaster-survival",
    icon: "🆘",
    title: () => "Survival Mode",
    text: (event) =>
      `${event.playerName} eventually reaches the safety of the next tee after a bruising hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "disaster-scorecard",
    icon: "✏️",
    title: () => "Plenty of Ink",
    text: (event) =>
      `The pencil needed overtime for ${event.playerName} on hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "disaster-course-bites",
    icon: "🦷",
    title: () => "Course Bites Back",
    text: (event) =>
      `The course bites back hard at ${event.playerName} on hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "disaster-no-footage",
    icon: "📵",
    title: () => "Footage Withheld",
    text: (event) =>
      `For everyone's sake, footage of ${event.playerName}'s hole ${event.holeNumber} will not be replayed.`,
    tier: "notable",
  },
  {
    id: "disaster-rebuild",
    icon: "🔧",
    title: () => "Rebuild Needed",
    text: (event) =>
      `Major repairs are required after hole ${event.holeNumber} for ${event.playerName}.`,
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
      `${event.playerName} produce one of the moments of the day: eagle at ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "scramble-eagle-partnership",
    icon: "🤝",
    title: () => "Partnership Perfected",
    text: (event) =>
      `${event.playerName} piece the hole together perfectly and walk off ${event.holeNumber} with eagle.`,
    tier: "major",
  },
  {
    id: "scramble-eagle-surge",
    icon: "🚀",
    title: () => "Pair Surging",
    text: (event) =>
      `A massive eagle for ${event.playerName} at hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "scramble-eagle-roar",
    icon: "📣",
    title: () => "Huge Roar",
    text: (event) =>
      `${event.playerName} deliver an eagle on ${event.holeNumber}. The scramble leaderboard has been warned.`,
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
  {
    id: "scramble-birdie-combination",
    icon: "🧩",
    title: () => "Perfect Combination",
    text: (event) =>
      `${event.playerName} put the pieces together for birdie on hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "scramble-birdie-pressure",
    icon: "🎯",
    title: () => "Pressure Applied",
    text: (event) =>
      `${event.playerName} add a scramble birdie at ${event.holeNumber} and turn up the pressure.`,
    tier: "notable",
  },
  {
    id: "scramble-birdie-clean",
    icon: "🐦",
    title: () => "Clean Pair Golf",
    text: (event) =>
      `A clean, efficient birdie for ${event.playerName} on hole ${event.holeNumber}.`,
    tier: "notable",
  },
  {
    id: "scramble-birdie-synchronised",
    icon: "🤝",
    title: () => "In Sync",
    text: (event) =>
      `${event.playerName} are in sync at ${event.holeNumber}. Birdie secured.`,
    tier: "notable",
  },
  {
    id: "scramble-birdie-bank",
    icon: "🏦",
    title: () => "Birdie Banked",
    text: (event) =>
      `${event.playerName} bank another scramble birdie at hole ${event.holeNumber}.`,
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
  {
    id: "scramble-progress",
    icon: "➡️",
    title: () => "Pair Progress",
    text: (event) =>
      `${event.playerName} move through hole ${event.holeNumber} and continue their round.`,
    tier: "normal",
  },
  {
    id: "scramble-in",
    icon: "📝",
    title: () => "Card Updated",
    text: (event) =>
      `The score is in for ${event.playerName} at hole ${event.holeNumber}.`,
    tier: "normal",
  },
  {
    id: "scramble-next",
    icon: "🤝",
    title: () => "On They Go",
    text: (event) =>
      `${event.playerName} finish hole ${event.holeNumber} and head to the next tee.`,
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
  {
    id: "bonus-delivery",
    icon: "🎯",
    title: () => "Delivered Under Pressure",
    text: (event) =>
      `${event.playerName} delivers when it matters and takes the bonus on hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "bonus-name-board",
    icon: "📋",
    title: () => "Name on the Board",
    text: (event) =>
      `${event.playerName}'s name goes onto the bonus board at hole ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "bonus-society-glory",
    icon: "🏅",
    title: () => "Society Glory",
    text: (event) =>
      `Bonus-hole glory belongs to ${event.playerName} at ${event.holeNumber}.`,
    tier: "major",
  },
  {
    id: "bonus-pressure",
    icon: "💪",
    title: () => "Pressure Handled",
    text: (event) =>
      `${event.playerName} handles the bonus-hole pressure and takes the prize.`,
    tier: "major",
  },
  {
    id: "bonus-rights",
    icon: "👑",
    title: () => "Rights Secured",
    text: (event) =>
      `${event.playerName} owns the bragging rights after winning the contest on hole ${event.holeNumber}.`,
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

  if (jokeNumber < 22) {
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

    0–29   = broadcast commentary                 30%
    30–64  = full player personality              35%
    65–84  = commentary plus player personality   20%
    85–94  = commentary plus running joke         10%
    95–99  = rare player commentary                5%
  */

  if (personalityNumber < 30) {
    return moment;
  }

  if (personalityNumber < 65) {
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

  if (personalityNumber < 85) {
    const personalityPhrase = selectPlayerPhrase(event, phraseType);

    if (!personalityPhrase) {
      return moment;
    }

    return {
      ...moment,
      text: `${moment.text} ${personalityPhrase}`,
      templateId: `${moment.templateId}-${profile.key}-personality-colour`,
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


type CommentaryTemperature =
  | "calm"
  | "building"
  | "hot"
  | "pressure"
  | "crisis";

type CommentaryIntelligence = {
  winningChance: number;
  momentum: number;
  pressure: number;
  confidence: number;
  temperature: CommentaryTemperature;
};

const clubhouseRumours = [
  "Rumour has it the group chat is already typing.",
  "Unofficial reports suggest this will be mentioned again over dinner.",
  "Witnesses claim the celebration was considerably larger than the putt.",
  "Early clubhouse reports describe the confidence levels as deeply concerning.",
  "Sources close to the buggy say the story is already improving with every retelling.",
  "The facts remain under review, but the bragging rights have already been claimed.",
  "A committee statement is expected once everyone has finished arguing about it.",
  "The clubhouse rumour mill has moved faster than the live leaderboard.",
  "Unconfirmed reports suggest at least one playing partner is claiming partial credit.",
  "The official version and the bar version of events may differ significantly.",
];

const crowdReactions = [
  "Heads are turning around the course.",
  "The clubhouse has noticed.",
  "Phones are coming out now.",
  "That has earned a proper reaction from the group.",
  "There is suddenly a little more noise around this match.",
  "Even the neighbouring group has looked across.",
  "That one has travelled quickly through the WhatsApp group.",
  "The reaction suggests everyone understands what that could mean.",
  "A few scorecards are being checked with renewed interest.",
  "The mood around the course has shifted.",
];

const golfCliches = [
  "One shot at a time.",
  "Never up, never in.",
  "Take your medicine and move on.",
  "Momentum is a funny thing.",
  "The scorecard does not ask how.",
  "There are no pictures on the scorecard.",
  "Drive for show, points for dough.",
  "Golf has a habit of finding you out.",
  "The next shot is the only one that matters.",
  "That is golf.",
];

const groupCommentary = [
  "This group has suddenly become compulsory viewing.",
  "The atmosphere in this group has changed completely.",
  "There will be plenty of conversation on the walk to the next tee.",
  "The rest of the group now has something to think about.",
  "This particular fourball is producing more content than expected.",
  "Nobody in the group is pretending not to care about the leaderboard now.",
  "The walk to the next tee may be slightly quieter than usual.",
  "The group dynamic has just become much more interesting.",
];

const meaningLines = {
  positive: [
    "What it means: the leaders have another problem to solve.",
    "What it means: the pressure has moved elsewhere.",
    "What it means: this challenge is very much alive.",
    "What it means: the leaderboard is tightening at exactly the wrong time for everyone else.",
    "What it means: confidence is growing and the gap is becoming relevant.",
    "What it means: this is no longer a quiet round.",
  ],
  neutral: [
    "What it means: position protected and no unnecessary damage.",
    "What it means: the round keeps moving without handing anyone a gift.",
    "What it means: steady enough, but the next opportunity matters.",
    "What it means: no change in the story, which may be exactly the aim.",
  ],
  negative: [
    "What it means: the door has opened slightly for the players behind.",
    "What it means: the next hole has suddenly become more important.",
    "What it means: momentum has been handed back to the field.",
    "What it means: there is now work to do before this becomes a trend.",
    "What it means: the pressure level has gone up a notch.",
  ],
};

const closingExclamations = [
  "HE HAS MADE IT!",
  "THAT IS ENORMOUS!",
  "WHAT A TIME TO PRODUCE THAT!",
  "THE TOURNAMENT HAS JUST CHANGED!",
  "NOW THEN!",
  "THIS IS GETTING SERIOUS!",
  "THE PRESSURE IS VERY REAL NOW!",
  "THAT COULD BE THE MOMENT!",
];

const holeSummaryLines = {
  positive: [
    "Hole summary: advantage gained, message delivered.",
    "Hole summary: one chance, fully converted.",
    "Hole summary: that hole belongs to the scorer.",
    "Hole summary: the card improves and the story gathers pace.",
  ],
  neutral: [
    "Hole summary: no drama, no damage, onto the next.",
    "Hole summary: position held and business completed.",
    "Hole summary: steady work in a round that still has plenty left in it.",
  ],
  negative: [
    "Hole summary: the course wins that exchange.",
    "Hole summary: damage done, response required.",
    "Hole summary: one to leave behind on the walk to the next tee.",
    "Hole summary: the card has taken a hit and the recovery starts now.",
  ],
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getCommentaryIntelligence(
  event: CommentaryEvent
): CommentaryIntelligence {
  const position = Number(event.positionAfter ?? 8);
  const gap = Number(event.leaderGap ?? 8);
  const moved = Number(event.placesMoved ?? 0);
  const late = ["closing", "final_hole", "complete"].includes(
    event.tournamentStage ?? ""
  );

  const positive = ["birdie", "eagle", "scramble_birdie", "scramble_eagle"].includes(
    event.eventType
  );
  const negative = ["bogey", "double_bogey_or_worse"].includes(
    event.eventType
  );

  const winningChance = clamp(
    74 - (position - 1) * 11 - gap * 5 + (late ? 8 : 0),
    2,
    96
  );

  const momentum = clamp(
    50 + (positive ? 26 : 0) - (negative ? 22 : 0) + moved * 8,
    4,
    98
  );

  const pressure = clamp(
    20 + (late ? 35 : 0) + (position <= 3 ? 20 : 0) + (gap <= 2 ? 18 : 0),
    5,
    99
  );

  const confidence = clamp(
    48 + (positive ? 25 : 0) - (negative ? 20 : 0) + moved * 5,
    5,
    98
  );

  let temperature: CommentaryTemperature = "calm";

  if (negative && pressure >= 70) temperature = "crisis";
  else if (pressure >= 75) temperature = "pressure";
  else if (momentum >= 75) temperature = "hot";
  else if (momentum >= 58 || pressure >= 55) temperature = "building";

  return {
    winningChance,
    momentum,
    pressure,
    confidence,
    temperature,
  };
}

function isPositiveEvent(event: CommentaryEvent) {
  return ["birdie", "eagle", "scramble_birdie", "scramble_eagle", "bonus_win"].includes(
    event.eventType
  );
}

function isNegativeEvent(event: CommentaryEvent) {
  return ["bogey", "double_bogey_or_worse"].includes(event.eventType);
}

function eventMood(event: CommentaryEvent): "positive" | "neutral" | "negative" {
  if (isPositiveEvent(event)) return "positive";
  if (isNegativeEvent(event)) return "negative";
  return "neutral";
}

function addTournamentMeaning(
  event: CommentaryEvent,
  moment: CommentaryMoment,
  intelligence: CommentaryIntelligence
): CommentaryMoment {
  const roll = deterministicNumber(`${event.eventKey}-what-it-means`) % 100;

  if (roll >= 44 && !moment.storylineId) return moment;

  const mood = eventMood(event);
  const line = selectTemplateLine(
    `${event.eventKey}-meaning-${intelligence.temperature}`,
    meaningLines[mood]
  );

  return {
    ...moment,
    text: `${moment.text} ${line}`,
    templateId: `${moment.templateId}-meaning`,
  };
}

function addClosingExcitement(
  event: CommentaryEvent,
  moment: CommentaryMoment,
  intelligence: CommentaryIntelligence
): CommentaryMoment {
  const isLate = ["closing", "final_hole", "complete"].includes(
    event.tournamentStage ?? ""
  );

  if (!isLate || !isPositiveEvent(event) || intelligence.pressure < 60) {
    return moment;
  }

  const opening = selectTemplateLine(
    `${event.eventKey}-closing-exclamation`,
    closingExclamations
  );

  return {
    ...moment,
    icon: moment.icon === "🐦" ? "🔥" : moment.icon,
    title:
      event.tournamentStage === "final_hole"
        ? "Final-Hole Drama"
        : moment.title,
    text: `${opening} ${moment.text}`,
    tier: "major",
    templateId: `${moment.templateId}-closing-excitement`,
  };
}

function addCrowdReaction(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const roll = deterministicNumber(`${event.eventKey}-crowd`) % 100;

  if (roll >= 24 || (!isPositiveEvent(event) && !moment.storylineId)) {
    return moment;
  }

  return {
    ...moment,
    text: `${moment.text} ${selectTemplateLine(
      `${event.eventKey}-crowd-line`,
      crowdReactions
    )}`,
    templateId: `${moment.templateId}-crowd`,
  };
}

function addGroupCommentary(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const roll = deterministicNumber(`${event.eventKey}-group-commentary`) % 100;

  if (roll >= 18) return moment;

  return {
    ...moment,
    text: `${moment.text} ${selectTemplateLine(
      `${event.eventKey}-group-line`,
      groupCommentary
    )}`,
    templateId: `${moment.templateId}-group`,
  };
}

function addClubhouseRumour(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const roll = deterministicNumber(`${event.eventKey}-clubhouse-rumour`) % 100;

  if (roll >= 8) return moment;

  return {
    ...moment,
    icon: roll < 3 ? "🗣️" : moment.icon,
    text: `${moment.text} ${selectTemplateLine(
      `${event.eventKey}-rumour-line`,
      clubhouseRumours
    )}`,
    templateId: `${moment.templateId}-rumour`,
  };
}

function addGolfCliche(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const roll = deterministicNumber(`${event.eventKey}-cliche`) % 100;

  if (roll >= 13) return moment;

  return {
    ...moment,
    text: `${moment.text} ${selectTemplateLine(
      `${event.eventKey}-cliche-line`,
      golfCliches
    )}`,
    templateId: `${moment.templateId}-cliche`,
  };
}

function addHoleSummary(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const roll = deterministicNumber(`${event.eventKey}-hole-summary`) % 100;

  if (roll >= 18) return moment;

  const mood = eventMood(event);

  return {
    ...moment,
    text: `${moment.text} ${selectTemplateLine(
      `${event.eventKey}-summary-line`,
      holeSummaryLines[mood]
    )}`,
    templateId: `${moment.templateId}-summary`,
  };
}

function selectTemplateLine(key: string, lines: string[]) {
  return lines[deterministicNumber(key) % lines.length];
}

function applyCommentaryDirector(
  event: CommentaryEvent,
  moment: CommentaryMoment
): CommentaryMoment {
  const intelligence = getCommentaryIntelligence(event);

  let directedMoment = addClosingExcitement(event, moment, intelligence);
  directedMoment = addTournamentMeaning(event, directedMoment, intelligence);
  directedMoment = addCrowdReaction(event, directedMoment);
  directedMoment = addGroupCommentary(event, directedMoment);
  directedMoment = addClubhouseRumour(event, directedMoment);
  directedMoment = addGolfCliche(event, directedMoment);
  directedMoment = addHoleSummary(event, directedMoment);

  return directedMoment;
}

function ensureHoleNumber(
  event: CommentaryEvent,
  moment: CommentaryMoment,
): CommentaryMoment {
  const holeNumber = Number(event.holeNumber);

  if (!Number.isFinite(holeNumber) || holeNumber <= 0) {
    return moment;
  }

  const text = String(moment.text ?? "").trim();

  /*
   * Avoid adding the hole again when the selected template or contextual
   * commentary already mentions it.
   */
  const alreadyIncludesHole =
    new RegExp(`\\bhole\\s+${holeNumber}\\b`, "i").test(text) ||
    new RegExp(`\\b${holeNumber}(?:st|nd|rd|th)?\\s+hole\\b`, "i").test(text) ||
    new RegExp(`\\bat\\s+(?:the\\s+)?${holeNumber}\\b`, "i").test(text) ||
    new RegExp(`\\bon\\s+(?:the\\s+)?${holeNumber}\\b`, "i").test(text);

  if (alreadyIncludesHole) {
    return moment;
  }

  const punctuation = /[.!?]$/.test(text)
    ? text.slice(-1)
    : ".";

  const textWithoutPunctuation = /[.!?]$/.test(text)
    ? text.slice(0, -1)
    : text;

  return {
    ...moment,
    text: `${textWithoutPunctuation} on hole ${holeNumber}${punctuation}`,
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

  const personalityMoment = applyPlayerPersonality(
    event,
    contextualMoment
  );

  const directedMoment = applyCommentaryDirector(
  event,
  personalityMoment,
);

return ensureHoleNumber(
  event,
  directedMoment,
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