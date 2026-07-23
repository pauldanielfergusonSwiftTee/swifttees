export type BroadcastMomentLike = {
  moment_key: string;
  moment_type: string;
  player_name?: string | null;
  team?: string | null;
  hole_number?: number | null;
  title: string;
  text: string;
  icon: string;
  rarity: "common" | "rare" | "major";
  created_at?: string;
};

export type BroadcastLeaderboardRow = {
  name: string;
  pos: number;
  points: number;
  through: number;
};

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function pick<T>(items: T[], seed: string, offset = 0): T {
  return items[(hashString(`${seed}-${offset}`) % items.length + items.length) % items.length];
}

function includesAny(value: string, terms: string[]) {
  const lower = value.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function isPositiveMoment(moment: BroadcastMomentLike) {
  return includesAny(moment.moment_type, [
    "birdie",
    "eagle",
    "lead_taken",
    "lead_joined",
    "lead_extended",
    "movement_up",
    "gap_reduced",
    "gap_cut",
    "new_leader",
    "joined_lead",
    "within_one",
    "big_climber",
    "bounce_back",
    "strong_finish",
    "hot_streak",
  ]);
}

function isNegativeMoment(moment: BroadcastMomentLike) {
  return includesAny(moment.moment_type, [
    "bogey",
    "disaster",
    "movement_down",
    "big_drop",
    "collapse",
    "lost_lead",
    "cold",
  ]);
}

function sameSubject(a: BroadcastMomentLike, b: BroadcastMomentLike) {
  if (a.player_name && b.player_name) {
    return a.player_name === b.player_name;
  }

  if (a.team && b.team) {
    return a.team === b.team;
  }

  return false;
}

function normaliseSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildAlias(
  moment: BroadcastMomentLike,
  leaderboard: BroadcastLeaderboardRow[],
  seed: string
) {
  const name = moment.player_name;
  if (!name || name.includes(" & ")) return null;

  const row = leaderboard.find((player) => player.name === name);
  if (!row) return null;

  const options = ["the scorer"];

  if (row.pos === 1) options.push("the leader");
  if (row.pos === 2) options.push("the nearest challenger");
  if (row.pos <= 3) options.push("the contender");
  if (row.through >= 15) options.push("the player in the closing stretch");

  const alias = pick(options, seed, 11);
  return alias === "the scorer" && moment.rarity === "common" ? null : alias;
}

function applyAlias(
  text: string,
  moment: BroadcastMomentLike,
  leaderboard: BroadcastLeaderboardRow[],
  seed: string
) {
  if (hashString(`${seed}-alias`) % 100 >= 32) return text;

  const name = moment.player_name;
  const alias = buildAlias(moment, leaderboard, seed);

  if (!name || !alias || !text.includes(name)) return text;

  return text.replace(name, alias.charAt(0).toUpperCase() + alias.slice(1));
}

function buildMomentumLine(
  moment: BroadcastMomentLike,
  recentMoments: BroadcastMomentLike[],
  seed: string
) {
  if (!moment.player_name || moment.player_name.includes(" & ")) return null;

  const relevant = recentMoments
    .filter((previous) => previous.player_name === moment.player_name)
    .slice(0, 8);

  const positiveCount = relevant.filter(isPositiveMoment).length + (isPositiveMoment(moment) ? 1 : 0);
  const negativeCount = relevant.filter(isNegativeMoment).length + (isNegativeMoment(moment) ? 1 : 0);

  if (positiveCount >= 3 && isPositiveMoment(moment)) {
    return pick(
      [
        "Everything is moving in the right direction now.",
        "The momentum is building with every hole.",
        "This is becoming a serious scoring run.",
        "The rest of the field have been given a warning.",
      ],
      seed,
      21
    );
  }

  if (negativeCount >= 3 && isNegativeMoment(moment)) {
    return pick(
      [
        "A spark is needed before this gets away from him.",
        "The round is beginning to unravel.",
        "He needs to stop the slide quickly.",
        "The next hole suddenly feels very important.",
      ],
      seed,
      22
    );
  }

  return null;
}

function buildCallbackLine(
  moment: BroadcastMomentLike,
  recentMoments: BroadcastMomentLike[],
  seed: string
) {
  if (hashString(`${seed}-callback`) % 100 >= 38) return null;

  const previous = recentMoments.find((candidate) => sameSubject(moment, candidate));
  if (!previous) return null;

  const previousHole = Number(previous.hole_number ?? 0);
  const currentHole = Number(moment.hole_number ?? 0);
  const holesAgo = currentHole > previousHole ? currentHole - previousHole : 0;

  if (isPositiveMoment(previous) && isPositiveMoment(moment)) {
    return holesAgo > 0 && holesAgo <= 4
      ? `That is another important moment just ${holesAgo} hole${holesAgo === 1 ? "" : "s"} after the last one.`
      : pick(
          [
            "The earlier momentum has not disappeared.",
            "That continues the story we have been watching develop.",
            "The pressure created earlier is beginning to tell.",
          ],
          seed,
          31
        );
  }

  if (isNegativeMoment(previous) && isPositiveMoment(moment)) {
    return pick(
      [
        "That is exactly the response that was needed.",
        "A timely answer after the earlier setback.",
        "The recovery starts here.",
      ],
      seed,
      32
    );
  }

  if (isPositiveMoment(previous) && isNegativeMoment(moment)) {
    return pick(
      [
        "The momentum from earlier has suddenly stalled.",
        "That changes the tone after such a strong spell.",
        "The advantage built earlier is now under pressure.",
      ],
      seed,
      33
    );
  }

  return null;
}

function applyBroadcastStyle(text: string, moment: BroadcastMomentLike, seed: string) {
  const style = hashString(`${seed}-style`) % 4;

  if (style === 1 && isPositiveMoment(moment)) {
    return `${normaliseSentence(text)} Clinical golf.`;
  }

  if (style === 2 && moment.rarity !== "common") {
    return `${normaliseSentence(text)} A significant moment in this round.`;
  }

  if (style === 3 && isNegativeMoment(moment)) {
    return `${normaliseSentence(text)} The course has bitten back.`;
  }

  return normaliseSentence(text);
}

function buildSignature(moment: BroadcastMomentLike, seed: string) {
  if (hashString(`${seed}-signature`) % 100 >= 16) return null;

  const positive = [
    "The chasing pack will have noticed that.",
    "The pressure has shifted.",
    "The leaderboard suddenly looks very different.",
    "That could matter later.",
    "The next tee now feels very different.",
    "Nobody will be ignoring the leaderboard now.",
  ];

  const negative = [
    "There is no hiding place on the scorecard now.",
    "The next hole has become a test of character.",
    "That may prove expensive later.",
    "The pressure is beginning to build.",
  ];

  return pick(isNegativeMoment(moment) ? negative : positive, seed, 41);
}

function buildSocietyHumour(moment: BroadcastMomentLike, seed: string) {
  if (hashString(`${seed}-humour`) % 100 >= 6) return null;

  return pick(
    [
      "The WhatsApp group will enjoy that one.",
      "Expect a few opinions over dinner.",
      "There will be no hiding from that scorecard later.",
      "Somebody is already preparing the group-chat response.",
      "That one may get mentioned more than once tonight.",
    ],
    seed,
    51
  );
}

export function enhanceBroadcastMoment<T extends BroadcastMomentLike>(
  moment: T,
  recentMoments: BroadcastMomentLike[],
  leaderboard: BroadcastLeaderboardRow[]
): T {
  const seed = moment.moment_key || `${moment.moment_type}-${moment.text}`;

  let text = applyAlias(moment.text, moment, leaderboard, seed);
  text = applyBroadcastStyle(text, moment, seed);

  const additions = [
    buildCallbackLine(moment, recentMoments, seed),
    buildMomentumLine(moment, recentMoments, seed),
    buildSignature(moment, seed),
    buildSocietyHumour(moment, seed),
  ].filter(Boolean) as string[];

  // Keep the producer disciplined: never bolt more than two extra thoughts
  // onto one update, and common moments receive at most one.
  const maximumAdditions = moment.rarity === "common" ? 1 : 2;
  const selectedAdditions = additions.slice(0, maximumAdditions);

  return {
    ...moment,
    text: [text, ...selectedAdditions].join(" ").replace(/\s+/g, " ").trim(),
  };
}

export function enhanceBroadcastMoments<T extends BroadcastMomentLike>(
  moments: T[],
  recentMoments: BroadcastMomentLike[],
  leaderboard: BroadcastLeaderboardRow[]
): T[] {
  let memory = [...recentMoments];

  return moments.map((moment) => {
    const enhanced = enhanceBroadcastMoment(moment, memory, leaderboard);
    memory = [enhanced, ...memory].slice(0, 20);
    return enhanced;
  });
}
