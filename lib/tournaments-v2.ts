import { supabase } from "./supabase";

export async function saveTournamentV2(data: any) {
  const { error } = await supabase
    .from("tournaments_v2")
    .upsert(data, {
      onConflict: "slug",
    });

  if (error) throw error;
}

export async function getTournamentV2(slug: string) {
  const { data, error } = await supabase
    .from("tournaments_v2")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data;
}

export async function getAllTournamentsV2() {
  const { data, error } = await supabase
    .from("tournaments_v2")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}
export async function setActiveTournamentV2(slug: string) {
  const { error: clearError } = await supabase
    .from("tournaments_v2")
    .update({ is_active: false })
    .neq("slug", "");

  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from("tournaments_v2")
    .update({ is_active: true })
    .eq("slug", slug);

  if (setError) throw setError;
}

export async function getActiveTournamentV2() {
  const { data, error } = await supabase
    .from("tournaments_v2")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) throw error;

  return data;
}
export async function deleteTournamentV2(slug: string) {
  const { error } = await supabase
    .from("tournaments_v2")
    .delete()
    .eq("slug", slug);

  if (error) throw error;
}