import { supabase } from "./supabase";

type ScoreRow = {
  id?: number | string;

  event_slug: string;
  round_number: number;
  group_number?: number | null;
  player_id?: number | null;
  pair_number?: number | null;
  hole_number: number;

  gross_score?: number | null;
  points?: number | null;
  event_handicap?: number | null;
  score_type?: string | null;
  updated_at?: string | null;
};

type SaveHoleScoresOptions = {
  tournament?: any;
};

function scoreIdentity(row: ScoreRow) {
  if (row.player_id) {
    return [
      "stableford",
      row.event_slug,
      row.round_number,
      row.player_id,
      row.hole_number,
    ].join(":");
  }

  return [
    "scramble",
    row.event_slug,
    row.round_number,
    row.group_number,
    row.pair_number,
    row.hole_number,
  ].join(":");
}

function getStablefordRows(rows: ScoreRow[]) {
  return rows.filter((row) =>
    Boolean(row.player_id)
  );
}

function getScrambleRows(rows: ScoreRow[]) {
  return rows.filter(
    (row) =>
      !row.player_id &&
      Boolean(row.group_number)
  );
}

async function getPreviousStablefordRows(
  rows: ScoreRow[]
) {
  if (!rows.length) return [];

  const previousRows: ScoreRow[] = [];

  for (const row of rows) {
    const { data, error } =
      await supabase
        .from("scores")
        .select("*")
        .eq(
          "event_slug",
          row.event_slug
        )
        .eq(
          "round_number",
          row.round_number
        )
        .eq(
          "player_id",
          row.player_id
        )
        .eq(
          "hole_number",
          row.hole_number
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      previousRows.push(data);
    }
  }

  return previousRows;
}

async function getPreviousScrambleRows(
  rows: ScoreRow[]
) {
  if (!rows.length) return [];

  const previousRows: ScoreRow[] = [];

  for (const row of rows) {
    const { data, error } =
      await supabase
        .from("scramble_scores")
        .select("*")
        .eq(
          "event_slug",
          row.event_slug
        )
        .eq(
          "round_number",
          row.round_number
        )
        .eq(
          "group_number",
          row.group_number
        )
        .eq(
          "pair_number",
          row.pair_number
        )
        .eq(
          "hole_number",
          row.hole_number
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      previousRows.push(data);
    }
  }

  return previousRows;
}

async function triggerCommentaryRefresh(
  rows: ScoreRow[],
  previousRows: ScoreRow[],
  tournament: any
) {
  if (!rows.length) return;

  if (!tournament) {
    console.warn(
      "Commentary refresh skipped because tournament setup was not supplied."
    );

    return;
  }

  const eventSlug =
    rows[0]?.event_slug ??
    tournament?.slug ??
    "";

  if (!eventSlug) {
    console.warn(
      "Commentary refresh skipped because event slug was missing."
    );

    return;
  }

  try {
    const response = await fetch(
      "/api/commentary/refresh",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          eventSlug,
          savedRows: rows,
          previousRows,
          tournament,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      console.error(
        "Commentary refresh failed:",
        result
      );

      return;
    }

    console.log(
      "COMMENTARY REFRESH:",
      result
    );
  } catch (error) {
    /*
     * Scores have already saved successfully.
     * Commentary failure must not make the
     * scorer believe the golf scores failed.
     */
    console.error(
      "Commentary refresh request failed:",
      error
    );
  }
}

/*
 * Call this only AFTER the complete Save Hole
 * operation has finished, including any
 * bonus-hole winner.
 *
 * This prevents a final result being declared
 * before bonus points have reached Supabase.
 */
export async function checkTournamentResults(
  tournament: any
) {
  if (!tournament) {
    console.warn(
      "Results check skipped because tournament setup was not supplied."
    );

    return null;
  }

  const eventSlug =
    tournament?.slug ?? "";

  if (!eventSlug) {
    console.warn(
      "Results check skipped because tournament slug was missing."
    );

    return null;
  }

  try {
    const response = await fetch(
      "/api/results/check",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          eventSlug,
          tournament,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      console.error(
        "Results check failed:",
        result
      );

      return null;
    }

    console.log(
      "RESULTS CHECK:",
      result
    );

    return result;
  } catch (error) {
    /*
     * Again, score saving must remain successful
     * even if a notification/results check fails.
     */
    console.error(
      "Results check request failed:",
      error
    );

    return null;
  }
}

export async function saveHoleScores(
  rows: ScoreRow[],
  options: SaveHoleScoresOptions = {}
) {
  if (!rows.length) return;

  const stablefordRows =
    getStablefordRows(rows);

  const scrambleRows =
    getScrambleRows(rows);

  console.log(
    "SCRAMBLE ROWS TO SAVE:",
    scrambleRows
  );

  /*
   * Capture exactly what was in Supabase
   * before this Save Hole batch.
   *
   * The commentary server uses this to
   * calculate genuine before/after movement.
   */
  const [
    previousStablefordRows,
    previousScrambleRows,
  ] = await Promise.all([
    getPreviousStablefordRows(
      stablefordRows
    ),

    getPreviousScrambleRows(
      scrambleRows
    ),
  ]);

  const previousRows = [
    ...previousStablefordRows,
    ...previousScrambleRows,
  ];

  /*
   * Every score in this person's Save Hole
   * action receives the same timestamp.
   */
  const batchUpdatedAt =
    new Date().toISOString();

  const savedRows: ScoreRow[] = [];

  if (stablefordRows.length) {
    const stablefordRowsForTable =
      stablefordRows.map((row) => ({
        ...row,

        updated_at:
          batchUpdatedAt,
      }));

    const { data, error } =
      await supabase
        .from("scores")
        .upsert(
          stablefordRowsForTable,
          {
            onConflict:
              "event_slug,round_number,player_id,hole_number",
          }
        )
        .select("*");

    if (error) {
      throw error;
    }

    savedRows.push(
      ...((data ?? []) as ScoreRow[])
    );
  }

  if (scrambleRows.length) {
    const scrambleRowsForTable =
      scrambleRows.map((row) => ({
        event_slug:
          row.event_slug,

        round_number:
          row.round_number,

        group_number:
          row.group_number,

        pair_number:
          row.pair_number,

        hole_number:
          row.hole_number,

        gross_score:
          row.gross_score,

        event_handicap:
          row.event_handicap,

        points:
          row.points ?? 0,

        updated_at:
          batchUpdatedAt,
      }));

    const { data, error } =
      await supabase
        .from("scramble_scores")
        .upsert(
          scrambleRowsForTable,
          {
            onConflict:
              "event_slug,round_number,group_number,pair_number,hole_number",
          }
        )
        .select("*");

    if (error) {
      throw error;
    }

    savedRows.push(
      ...((data ?? []) as ScoreRow[])
    );
  }

  /*
   * Normally Supabase returns exactly what
   * was written.
   *
   * Keep a fallback so commentary still works
   * if no returned rows are supplied.
   */
  const rowsForCommentary =
    savedRows.length
      ? savedRows
      : rows.map((row) => ({
          ...row,

          updated_at:
            batchUpdatedAt,
        }));

  /*
   * Do not allow the same logical score row
   * to appear twice in the commentary batch.
   */
  const uniqueRowsMap =
    new Map<string, ScoreRow>();

  for (
    const row of rowsForCommentary
  ) {
    uniqueRowsMap.set(
      scoreIdentity(row),
      row
    );
  }

  const uniqueRows =
    Array.from(
      uniqueRowsMap.values()
    );

  /*
   * Commentary runs immediately after the
   * score batch has successfully saved.
   */
  await triggerCommentaryRefresh(
    uniqueRows,
    previousRows,
    options.tournament
  );
}

export async function deleteHoleScores(
  rows: ScoreRow[]
) {
  if (!rows.length) return;

  const stablefordRows =
    getStablefordRows(rows);

  const scrambleRows =
    getScrambleRows(rows);

  for (
    const row of stablefordRows
  ) {
    const { error } =
      await supabase
        .from("scores")
        .delete()
        .eq(
          "event_slug",
          row.event_slug
        )
        .eq(
          "round_number",
          row.round_number
        )
        .eq(
          "player_id",
          row.player_id
        )
        .eq(
          "hole_number",
          row.hole_number
        );

    if (error) {
      throw error;
    }
  }

  for (
    const row of scrambleRows
  ) {
    const { error } =
      await supabase
        .from("scramble_scores")
        .delete()
        .eq(
          "event_slug",
          row.event_slug
        )
        .eq(
          "round_number",
          row.round_number
        )
        .eq(
          "group_number",
          row.group_number
        )
        .eq(
          "pair_number",
          row.pair_number
        )
        .eq(
          "hole_number",
          row.hole_number
        );

    if (error) {
      throw error;
    }
  }
}

export async function getScores(
  eventSlug: string
) {
  const { data, error } =
    await supabase
      .from("scores")
      .select("*")
      .eq(
        "event_slug",
        eventSlug
      );

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveBonusWinner(
  data: any
) {
  const { error } =
    await supabase
      .from("bonus_winners")
      .upsert(
        data,
        {
          onConflict:
            "event_slug,round_number,hole,bonus_type",
        }
      );

  if (error) {
    throw error;
  }
}

export async function getBonusWinners(
  eventSlug: string
) {
  const { data, error } =
    await supabase
      .from("bonus_winners")
      .select("*")
      .eq(
        "event_slug",
        eventSlug
      );

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getScrambleScores(
  eventSlug: string
) {
  const { data, error } =
    await supabase
      .from("scramble_scores")
      .select("*")
      .eq(
        "event_slug",
        eventSlug
      );

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function resetEventScores(
  eventSlug: string
) {
  console.log(
    "RESETTING EVENT:",
    eventSlug
  );

  const {
    error: scoresError,
  } =
    await supabase
      .from("scores")
      .delete()
      .eq(
        "event_slug",
        eventSlug
      );

  if (scoresError) {
    throw scoresError;
  }

  const {
    error: scrambleError,
  } =
    await supabase
      .from("scramble_scores")
      .delete()
      .eq(
        "event_slug",
        eventSlug
      );

  if (scrambleError) {
    throw scrambleError;
  }

  const {
    error: bonusError,
  } =
    await supabase
      .from("bonus_winners")
      .delete()
      .eq(
        "event_slug",
        eventSlug
      );

  if (bonusError) {
    throw bonusError;
  }

  const {
    error: momentsError,
  } =
    await supabase
      .from("live_moments")
      .delete()
      .eq(
        "event_slug",
        eventSlug
      );

  if (momentsError) {
    throw momentsError;
  }
}