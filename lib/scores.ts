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
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("scramble_scores")
    .upsert(scrambleRowsForTable, {
      onConflict: "event_slug,round_number,pair_number,hole_number",
    });

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
  const { error } = await supabase.from("bonus_winners").upsert(data, {
    onConflict: "event_slug,round_number,hole_number,bonus_type",
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