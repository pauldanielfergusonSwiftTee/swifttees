import { supabase } from "./supabase";

export async function saveHoleScores(rows: any[]) {
  if (!rows.length) return;

  const stablefordRows = rows.filter((row) => row.player_id);
  const scrambleRows = rows.filter((row) => !row.player_id && row.group_number);

  console.log("SCRAMBLE ROWS TO SAVE:", scrambleRows);

  if (stablefordRows.length) {
    const { error } = await supabase.from("scores").upsert(stablefordRows, {
      onConflict: "event_slug,round_number,player_id,hole_number",
    });

    if (error) throw error;
  }

if (scrambleRows.length) {
  const scrambleRowsForTable = scrambleRows.map((row) => ({
  event_slug: row.event_slug,
  round_number: row.round_number,
  group_number: row.group_number,
  pair_number: row.pair_number,
  hole_number: row.hole_number,
  gross_score: row.gross_score,
  event_handicap: row.event_handicap,
  points: row.points ?? 0,
  updated_at: new Date().toISOString(),
}));

  const { error } = await supabase
    .from("scramble_scores")
    .upsert(scrambleRowsForTable, {
      onConflict: "event_slug,round_number,group_number,pair_number,hole_number",
    });

  if (error) throw error;
}
}

export async function deleteHoleScores(rows: any[]) {
  if (!rows.length) return;

  const stablefordRows = rows.filter((row) => row.player_id);
  const scrambleRows = rows.filter((row) => !row.player_id && row.group_number);

  for (const row of stablefordRows) {
    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("event_slug", row.event_slug)
  .eq("round_number", row.round_number)
  .eq("group_number", row.group_number)
  .eq("pair_number", row.pair_number)
  .eq("hole_number", row.hole_number);

    if (error) throw error;
  }

  for (const row of scrambleRows) {
    const { error } = await supabase
      .from("scramble_scores")
      .delete()
      .eq("event_slug", row.event_slug)
      .eq("round_number", row.round_number)
      .eq("pair_number", row.pair_number)
      .eq("hole_number", row.hole_number);

    if (error) throw error;
  }
}

export async function getScores(eventSlug: string) {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("event_slug", eventSlug);

  if (error) throw error;

  return data ?? [];
}

export async function saveBonusWinner(data: any) {
  const { error } = await supabase
    .from("bonus_winners")
    .upsert(data, {
      onConflict: "event_slug,round_number,hole,bonus_type",
    });

  if (error) throw error;
}

export async function getBonusWinners(eventSlug: string) {
  const { data, error } = await supabase
    .from("bonus_winners")
    .select("*");

  if (error) throw error;

  return data ?? [];
}
export async function getScrambleScores(eventSlug: string) {
  const { data, error } = await supabase
    .from("scramble_scores")
    .select("*")
    .eq("event_slug", eventSlug);

  if (error) throw error;

  return data ?? [];
}
export async function resetEventScores(eventSlug: string) {
  console.log("RESETTING EVENT:", eventSlug);

  const { error: scoresError, count } = await supabase
    .from("scores")
    .delete({ count: "exact" })
    .eq("event_slug", eventSlug);

  console.log("DELETE SCORES:", { count, scoresError });

  if (scoresError) throw scoresError;

  const { error: scrambleError, count: scrambleCount } = await supabase
    .from("scramble_scores")
    .delete({ count: "exact" })
    .eq("event_slug", eventSlug);

  console.log("DELETE SCRAMBLE:", {
    count: scrambleCount,
    scrambleError,
  });

  if (scrambleError) throw scrambleError;
}