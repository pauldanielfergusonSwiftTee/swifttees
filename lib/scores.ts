import { supabase } from "./supabase";

export async function saveHoleScores(rows: any[]) {
  const { error } = await supabase.from("scores").upsert(rows, {
    onConflict: "event_slug,round_number,player_id,hole_number",
  });

  if (error) throw error;
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