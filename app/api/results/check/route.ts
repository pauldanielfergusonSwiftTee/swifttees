import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushToAll } from "@/lib/server/push";

type ScoreRow = {
  event_slug: string;
  round_number: number;
  group_number?: number | null;
  player_id?: number | null;
  pair_number?: number | null;
  hole_number: number;
  gross_score?: number | null;
  points?: number | null;
};

type TournamentPlayer = {
  id: number | string;
  name: string;
  team?: string;
  eventTeam?: string;
};

type TournamentPair = {
  id?: number | string;
  pairNumber?: number | string;
  pair_number?: number | string;
  player1_id?: number | string | null;
  player2_id?: number | string | null;
};

type TournamentGroup = {
  id?: number | string;
  groupNumber?: number | string;
  group_number?: number | string;

  players?: Array<{
    id?: number | string;
    player_id?: number | string;
    name?: string;
  }>;

  pairs?: TournamentPair[];
};

type TournamentHole = {
  hole?: number | string;
  number?: number | string;
  hole_number?: number | string;
};

type TournamentRound = {
  id?: number | string;
  roundNumber?: number | string;
  round_number?: number | string;

  format?: string;

  holes?: TournamentHole[];
  groups?: TournamentGroup[];

  course?: string;
  name?: string;
};

type TournamentSetup = {
  slug?: string;
  name?: string;

  team_mode?: string;
  teamMode?: string;

  players?: TournamentPlayer[];
  rounds?: TournamentRound[];
};

type ResultMoment = {
  event_slug: string;
  moment_key: string;
  moment_type: string;

  player_id?: number | null;
  player_name?: string | null;
  team?: string | null;

  round_number?: number | null;
  hole_number?: number | null;

  icon: string;
  title: string;
  text: string;

  rarity: "major";
};

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function getRoundNumber(round: TournamentRound) {
  return toNumber(
    round.roundNumber ??
      round.round_number ??
      round.id
  );
}

function getGroupNumber(group: TournamentGroup) {
  return toNumber(
    group.groupNumber ??
      group.group_number ??
      group.id
  );
}

function getPairNumber(pair: TournamentPair) {
  return toNumber(
    pair.pairNumber ??
      pair.pair_number ??
      pair.id
  );
}

function getHoleNumber(hole: TournamentHole) {
  return toNumber(
    hole.hole ??
      hole.number ??
      hole.hole_number
  );
}

function getHoleNumbers(round: TournamentRound) {
  const holes =
    round.holes
      ?.map(getHoleNumber)
      .filter((hole) => hole > 0) ?? [];

  if (holes.length) {
    return holes;
  }

  return Array.from(
    { length: 18 },
    (_, index) => index + 1
  );
}

function isScrambleRound(round: TournamentRound) {
  return (
    round.format === "scramblePairs" ||
    round.format === "scramble"
  );
}

function getPlayerTeam(
  tournament: TournamentSetup,
  playerId: number
) {
  const player =
    tournament.players?.find(
      (candidate) =>
        Number(candidate.id) === playerId
    );

  return (
    cleanText(player?.eventTeam) ||
    cleanText(player?.team)
  );
}

function getPlayerName(
  tournament: TournamentSetup,
  playerId: number
) {
  return (
    tournament.players?.find(
      (candidate) =>
        Number(candidate.id) === playerId
    )?.name ?? `Player ${playerId}`
  );
}

function getRoundPlayerIds(
  round: TournamentRound,
  tournament: TournamentSetup
) {
  const ids = new Set<number>();

  round.groups?.forEach((group) => {
    group.players?.forEach((player) => {
      const id =
        Number(
          player.player_id ??
            player.id
        );

      if (id > 0) {
        ids.add(id);
      }
    });
  });

  /*
   * Fallback for tournament setups where
   * the round does not explicitly contain
   * player objects.
   */
  if (!ids.size) {
    tournament.players?.forEach(
      (player) => {
        const id = Number(player.id);

        if (id > 0) {
          ids.add(id);
        }
      }
    );
  }

  return Array.from(ids);
}

function getRoundPairs(
  round: TournamentRound,
  tournament: TournamentSetup
) {
  const pairs: Array<{
    groupNumber: number;
    pairNumber: number;
    playerIds: number[];
    pairNames: string;
  }> = [];

  round.groups?.forEach((group) => {
    const groupNumber =
      getGroupNumber(group);

    group.pairs?.forEach((pair) => {
      const pairNumber =
        getPairNumber(pair);

      const playerIds = [
        pair.player1_id,
        pair.player2_id,
      ]
        .map(Number)
        .filter(
          (id) =>
            Number.isFinite(id) &&
            id > 0
        );

      if (
        !groupNumber ||
        !pairNumber ||
        !playerIds.length
      ) {
        return;
      }

      const pairNames =
        playerIds
          .map((playerId) =>
            getPlayerName(
              tournament,
              playerId
            )
          )
          .join(" & ");

      pairs.push({
        groupNumber,
        pairNumber,
        playerIds,
        pairNames,
      });
    });
  });

  return pairs;
}

function stablefordRoundComplete(
  round: TournamentRound,
  tournament: TournamentSetup,
  stablefordScores: ScoreRow[]
) {
  const roundNumber =
    getRoundNumber(round);

  const holes =
    getHoleNumbers(round);

  const playerIds =
    getRoundPlayerIds(
      round,
      tournament
    );

  if (
    !playerIds.length ||
    !holes.length
  ) {
    return false;
  }

  return playerIds.every((playerId) =>
    holes.every((holeNumber) =>
      stablefordScores.some(
        (score) =>
          Number(
            score.round_number
          ) === roundNumber &&
          Number(score.player_id) ===
            playerId &&
          Number(score.hole_number) ===
            holeNumber
      )
    )
  );
}

function scrambleRoundComplete(
  round: TournamentRound,
  tournament: TournamentSetup,
  scrambleScores: ScoreRow[]
) {
  const roundNumber =
    getRoundNumber(round);

  const holes =
    getHoleNumbers(round);

  const pairs =
    getRoundPairs(
      round,
      tournament
    );

  if (
    !pairs.length ||
    !holes.length
  ) {
    return false;
  }

  return pairs.every((pair) =>
    holes.every((holeNumber) =>
      scrambleScores.some(
        (score) =>
          Number(
            score.round_number
          ) === roundNumber &&
          Number(
            score.group_number
          ) === pair.groupNumber &&
          Number(
            score.pair_number
          ) === pair.pairNumber &&
          Number(
            score.hole_number
          ) === holeNumber
      )
    )
  );
}

function isRoundComplete(
  round: TournamentRound,
  tournament: TournamentSetup,
  stablefordScores: ScoreRow[],
  scrambleScores: ScoreRow[]
) {
  if (isScrambleRound(round)) {
    return scrambleRoundComplete(
      round,
      tournament,
      scrambleScores
    );
  }

  return stablefordRoundComplete(
    round,
    tournament,
    stablefordScores
  );
}

function buildStablefordRoundResult(
  round: TournamentRound,
  tournament: TournamentSetup,
  stablefordScores: ScoreRow[]
): ResultMoment | null {
  const roundNumber =
    getRoundNumber(round);

  const playerIds =
    getRoundPlayerIds(
      round,
      tournament
    );

  const results =
    playerIds.map((playerId) => {
      const points =
        stablefordScores
          .filter(
            (score) =>
              Number(
                score.round_number
              ) === roundNumber &&
              Number(
                score.player_id
              ) === playerId
          )
          .reduce(
            (total, score) =>
              total +
              Number(
                score.points ?? 0
              ),
            0
          );

      return {
        playerId,
        name:
          getPlayerName(
            tournament,
            playerId
          ),
        points,
      };
    });

  if (!results.length) {
    return null;
  }

  results.sort(
    (a, b) =>
      b.points - a.points
  );

  const winningPoints =
    results[0].points;

  const winners =
    results.filter(
      (result) =>
        result.points ===
        winningPoints
    );

  const winnerNames =
    winners
      .map((winner) => winner.name)
      .join(" & ");

  const course =
    cleanText(round.course) ||
    cleanText(round.name);

  const courseText =
    course
      ? ` at ${course}`
      : "";

  const text =
    winners.length === 1
      ? `${winnerNames} wins Round ${roundNumber}${courseText} with ${winningPoints} Stableford points.`
      : `Round ${roundNumber}${courseText} finishes tied — ${winnerNames} share top spot on ${winningPoints} points.`;

  return {
    event_slug:
      tournament.slug ?? "",

    moment_key:
      `result-round-${roundNumber}`,

    moment_type:
      "result_round",

    player_id:
      winners.length === 1
        ? winners[0].playerId
        : null,

    player_name:
      winnerNames,

    team: null,

    round_number:
      roundNumber,

    hole_number:
      null,

    icon: "🏆",

    title:
      winners.length === 1
        ? `Round ${roundNumber} Winner`
        : `Round ${roundNumber} Result`,

    text,

    rarity: "major",
  };
}

function buildScrambleRoundResult(
  round: TournamentRound,
  tournament: TournamentSetup,
  scrambleScores: ScoreRow[]
): ResultMoment | null {
  const roundNumber =
    getRoundNumber(round);

  const pairs =
    getRoundPairs(
      round,
      tournament
    );

  const results =
    pairs.map((pair) => {
      const points =
        scrambleScores
          .filter(
            (score) =>
              Number(
                score.round_number
              ) === roundNumber &&
              Number(
                score.group_number
              ) === pair.groupNumber &&
              Number(
                score.pair_number
              ) === pair.pairNumber
          )
          .reduce(
            (total, score) =>
              total +
              Number(
                score.points ?? 0
              ),
            0
          );

      return {
        ...pair,
        points,
      };
    });

  if (!results.length) {
    return null;
  }

  results.sort(
    (a, b) =>
      b.points - a.points
  );

  const winningPoints =
    results[0].points;

  const winners =
    results.filter(
      (result) =>
        result.points ===
        winningPoints
    );

  const winnerNames =
    winners
      .map(
        (winner) =>
          winner.pairNames
      )
      .join(" / ");

  const course =
    cleanText(round.course) ||
    cleanText(round.name);

  const courseText =
    course
      ? ` at ${course}`
      : "";

  const text =
    winners.length === 1
      ? `${winnerNames} win Round ${roundNumber}${courseText} with ${winningPoints} points.`
      : `Round ${roundNumber}${courseText} finishes tied — ${winnerNames} share the win on ${winningPoints} points.`;

  return {
    event_slug:
      tournament.slug ?? "",

    moment_key:
      `result-round-${roundNumber}`,

    moment_type:
      "result_round",

    player_id: null,

    player_name:
      winnerNames,

    team: null,

    round_number:
      roundNumber,

    hole_number:
      null,

    icon: "🏆",

    title:
      winners.length === 1
        ? `Round ${roundNumber} Winners`
        : `Round ${roundNumber} Result`,

    text,

    rarity: "major",
  };
}

function buildIndividualOverallTotals(
  tournament: TournamentSetup,
  stablefordScores: ScoreRow[],
  scrambleScores: ScoreRow[],
  bonusWinners: any[]
) {
  const totals =
    new Map<
      number,
      {
        playerId: number;
        name: string;
        team: string;
        points: number;
      }
    >();

  tournament.players?.forEach(
    (player) => {
      const playerId =
        Number(player.id);

      totals.set(playerId, {
        playerId,
        name: player.name,

        team:
          cleanText(
            player.eventTeam
          ) ||
          cleanText(player.team),

        points: 0,
      });
    }
  );

  /*
   * Stableford:
   * each player receives their own points.
   */
  stablefordScores.forEach(
    (score) => {
      const playerId =
        Number(score.player_id);

      const player =
        totals.get(playerId);

      if (!player) return;

      player.points +=
        Number(score.points ?? 0);
    }
  );

  /*
   * Scramble:
   * both members of the pair receive
   * the pair's Stableford points on the
   * individual leaderboard.
   */
  scrambleScores.forEach(
    (score) => {
      const round =
        tournament.rounds?.find(
          (candidate) =>
            getRoundNumber(candidate) ===
            Number(
              score.round_number
            )
        );

      const group =
        round?.groups?.find(
          (candidate) =>
            getGroupNumber(candidate) ===
            Number(
              score.group_number
            )
        );

      const pair =
        group?.pairs?.find(
          (candidate) =>
            getPairNumber(candidate) ===
            Number(
              score.pair_number
            )
        );

      const playerIds = [
        pair?.player1_id,
        pair?.player2_id,
      ]
        .map(Number)
        .filter(
          (id) =>
            Number.isFinite(id) &&
            id > 0
        );

      playerIds.forEach(
        (playerId) => {
          const player =
            totals.get(playerId);

          if (!player) return;

          player.points +=
            Number(
              score.points ?? 0
            );
        }
      );
    }
  );

  /*
   * Bonus points are already part of the
   * Swift Tees overall leaderboard, so
   * include them in the final result too.
   */
  bonusWinners.forEach(
    (bonus) => {
      if (
        !bonus.winner_player_name
      ) {
        return;
      }

      const winner =
        Array.from(
          totals.values()
        ).find(
          (player) =>
            player.name ===
            bonus.winner_player_name
        );

      if (!winner) return;

      winner.points +=
        Number(
          bonus.points ?? 0
        );
    }
  );

  return Array.from(
    totals.values()
  ).sort(
    (a, b) =>
      b.points - a.points
  );
}

function buildOverallResult(
  tournament: TournamentSetup,
  stablefordScores: ScoreRow[],
  scrambleScores: ScoreRow[],
  bonusWinners: any[]
): ResultMoment | null {
  const standings =
    buildIndividualOverallTotals(
      tournament,
      stablefordScores,
      scrambleScores,
      bonusWinners
    );

  if (!standings.length) {
    return null;
  }

  const winningPoints =
    standings[0].points;

  const winners =
    standings.filter(
      (player) =>
        player.points ===
        winningPoints
    );

  const winnerNames =
    winners
      .map((player) => player.name)
      .join(" & ");

  const tournamentName =
    tournament.name ||
    "the tournament";

  const text =
    winners.length === 1
      ? `${winnerNames} is the ${tournamentName} champion with ${winningPoints} points.`
      : `${tournamentName} finishes tied — ${winnerNames} share the overall lead on ${winningPoints} points.`;

  return {
    event_slug:
      tournament.slug ?? "",

    moment_key:
      "result-overall-individual",

    moment_type:
      "result_overall",

    player_id:
      winners.length === 1
        ? winners[0].playerId
        : null,

    player_name:
      winnerNames,

    team: null,

    round_number: null,
    hole_number: null,

    icon: "🏆",

    title:
      winners.length === 1
        ? "Overall Champion"
        : "Overall Result",

    text,

    rarity: "major",
  };
}

function buildTeamResult(
  tournament: TournamentSetup,
  stablefordScores: ScoreRow[],
  scrambleScores: ScoreRow[],
  bonusWinners: any[]
): ResultMoment | null {
  const teamMode =
    tournament.team_mode ===
      "teams" ||
    tournament.teamMode ===
      "teams";

  if (!teamMode) {
    return null;
  }

  const teamTotals =
    new Map<string, number>();

  tournament.players?.forEach(
    (player) => {
      const team =
        cleanText(
          player.eventTeam
        ) ||
        cleanText(player.team);

      if (
        team &&
        !teamTotals.has(team)
      ) {
        teamTotals.set(
          team,
          0
        );
      }
    }
  );

  /*
   * Individual Stableford points all
   * count towards the player's team.
   */
  stablefordScores.forEach(
    (score) => {
      const playerId =
        Number(score.player_id);

      const team =
        getPlayerTeam(
          tournament,
          playerId
        );

      if (!team) return;

      teamTotals.set(
        team,
        (
          teamTotals.get(team) ??
          0
        ) +
          Number(
            score.points ?? 0
          )
      );
    }
  );

  /*
   * Swift Tees scramble team rule:
   * pair score counts ONCE towards
   * the team total using player 1.
   */
  scrambleScores.forEach(
    (score) => {
      const round =
        tournament.rounds?.find(
          (candidate) =>
            getRoundNumber(candidate) ===
            Number(
              score.round_number
            )
        );

      const group =
        round?.groups?.find(
          (candidate) =>
            getGroupNumber(candidate) ===
            Number(
              score.group_number
            )
        );

      const pair =
        group?.pairs?.find(
          (candidate) =>
            getPairNumber(candidate) ===
            Number(
              score.pair_number
            )
        );

      const firstPlayerId =
        Number(
          pair?.player1_id
        );

      if (!firstPlayerId) {
        return;
      }

      const team =
        getPlayerTeam(
          tournament,
          firstPlayerId
        );

      if (!team) return;

      teamTotals.set(
        team,
        (
          teamTotals.get(team) ??
          0
        ) +
          Number(
            score.points ?? 0
          )
      );
    }
  );

  /*
   * Bonus points count normally
   * towards the winner's team.
   */
  bonusWinners.forEach(
    (bonus) => {
      const player =
        tournament.players?.find(
          (candidate) =>
            candidate.name ===
            bonus.winner_player_name
        );

      if (!player) return;

      const team =
        cleanText(
          player.eventTeam
        ) ||
        cleanText(player.team);

      if (!team) return;

      teamTotals.set(
        team,
        (
          teamTotals.get(team) ??
          0
        ) +
          Number(
            bonus.points ?? 0
          )
      );
    }
  );

  const standings =
    Array.from(
      teamTotals.entries()
    )
      .map(
        ([team, points]) => ({
          team,
          points,
        })
      )
      .sort(
        (a, b) =>
          b.points - a.points
      );

  if (!standings.length) {
    return null;
  }

  const winningPoints =
    standings[0].points;

  const winners =
    standings.filter(
      (team) =>
        team.points ===
        winningPoints
    );

  const winnerNames =
    winners
      .map(
        (winner) =>
          winner.team
      )
      .join(" & ");

  const text =
    winners.length === 1
      ? `${winnerNames} win the team competition with ${winningPoints} points.`
      : `The team competition finishes tied — ${winnerNames} share top spot on ${winningPoints} points.`;

  return {
    event_slug:
      tournament.slug ?? "",

    moment_key:
      "result-overall-team",

    moment_type:
      "result_team",

    player_id: null,
    player_name: null,

    team:
      winnerNames,

    round_number: null,
    hole_number: null,

    icon: "🏆",

    title:
      winners.length === 1
        ? "Team Champions"
        : "Team Result",

    text,

    rarity: "major",
  };
}

async function saveResultAndPush(
  supabase: any,
  moment: ResultMoment
) {
  /*
   * INSERT rather than UPSERT.
   *
   * Your unique:
   * event_slug + moment_key
   *
   * constraint guarantees the result
   * notification only happens once.
   */
  const {
    error,
  } =
    await supabase
      .from("live_moments")
      .insert(moment);

  if (
    error?.code === "23505"
  ) {
    return {
      created: false,
      duplicate: true,
      pushed: false,
    };
  }

  if (error) {
    console.error(
      "Could not save result moment:",
      error
    );

    return {
      created: false,
      duplicate: false,
      pushed: false,
    };
  }

  let pushed = false;

  try {
    const result =
      await sendPushToAll({
        title:
          "🏆 Results",

        message:
          `${moment.icon} ${moment.title} — ${moment.text}`,

        url:
          "/live-centre",
      });

    pushed =
      result.sent > 0;
  } catch (error) {
    console.error(
      "Result push failed:",
      error
    );
  }

  return {
    created: true,
    duplicate: false,
    pushed,
  };
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const eventSlug =
      cleanText(
        body.eventSlug
      );

    const tournament =
      body.tournament as
        TournamentSetup;

    if (
      !eventSlug ||
      !tournament ||
      !Array.isArray(
        tournament.rounds
      )
    ) {
      return NextResponse.json(
        {
          error:
            "eventSlug and tournament are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      tournament.slug &&
      tournament.slug !==
        eventSlug
    ) {
      return NextResponse.json(
        {
          error:
            "Tournament slug does not match event slug",
        },
        {
          status: 400,
        }
      );
    }

    tournament.slug =
      eventSlug;

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env
        .SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase server configuration is incomplete",
        },
        {
          status: 500,
        }
      );
    }

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey
      );

    const [
      stablefordResult,
      scrambleResult,
      bonusResult,
    ] =
      await Promise.all([
        supabase
          .from("scores")
          .select("*")
          .eq(
            "event_slug",
            eventSlug
          ),

        supabase
          .from(
            "scramble_scores"
          )
          .select("*")
          .eq(
            "event_slug",
            eventSlug
          ),

        supabase
          .from(
            "bonus_winners"
          )
          .select("*")
          .eq(
            "event_slug",
            eventSlug
          ),
      ]);

    if (
      stablefordResult.error
    ) {
      throw stablefordResult.error;
    }

    if (
      scrambleResult.error
    ) {
      throw scrambleResult.error;
    }

    if (
      bonusResult.error
    ) {
      throw bonusResult.error;
    }

    const stablefordScores =
      (
        stablefordResult.data ??
        []
      ) as ScoreRow[];

    const scrambleScores =
      (
        scrambleResult.data ??
        []
      ) as ScoreRow[];

    const bonusWinners =
      bonusResult.data ?? [];

    const completedRounds =
      tournament.rounds.filter(
        (round) =>
          isRoundComplete(
            round,
            tournament,
            stablefordScores,
            scrambleScores
          )
      );

    const moments:
      ResultMoment[] = [];

    /*
     * Create a result for every
     * completed round.
     *
     * Existing result keys will simply
     * hit the duplicate constraint.
     */
    for (
      const round of
        completedRounds
    ) {
      const moment =
        isScrambleRound(round)
          ? buildScrambleRoundResult(
              round,
              tournament,
              scrambleScores
            )
          : buildStablefordRoundResult(
              round,
              tournament,
              stablefordScores
            );

      if (moment) {
        moments.push(moment);
      }
    }

    const tournamentComplete =
      tournament.rounds.length >
        0 &&
      completedRounds.length ===
        tournament.rounds.length;

    /*
     * Only declare the overall champions
     * when EVERY tournament round is complete.
     */
    if (tournamentComplete) {
      const overallResult =
        buildOverallResult(
          tournament,
          stablefordScores,
          scrambleScores,
          bonusWinners
        );

      if (overallResult) {
        moments.push(
          overallResult
        );
      }

      const teamResult =
        buildTeamResult(
          tournament,
          stablefordScores,
          scrambleScores,
          bonusWinners
        );

      if (teamResult) {
        moments.push(
          teamResult
        );
      }
    }

    let created = 0;
    let duplicates = 0;
    let pushed = 0;

    for (
      const moment of moments
    ) {
      const result =
        await saveResultAndPush(
          supabase,
          moment
        );

      if (result.created) {
        created += 1;
      }

      if (result.duplicate) {
        duplicates += 1;
      }

      if (result.pushed) {
        pushed += 1;
      }
    }

    return NextResponse.json({
      success: true,

      completedRounds:
        completedRounds.map(
          getRoundNumber
        ),

      tournamentComplete,

      resultsChecked:
        moments.length,

      created,
      duplicates,
      pushed,
    });
  } catch (error) {
    console.error(
      "Results check error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected results check error",

        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}