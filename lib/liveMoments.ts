import { supabase } from "@/lib/supabase";

export async function getLiveMoments(eventSlug: string) {
  const { data, error } = await supabase
    .from("live_moments")
    .select("*")
    .eq("event_slug", eventSlug)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error loading live moments:", error);
    return [];
  }

  return data ?? [];
}

export async function saveLiveMoment(moment: any) {
  const { error } = await supabase
    .from("live_moments")
    .upsert(moment, {
      onConflict: "event_slug,moment_key",
    });

  if (error) {
    console.error("Error saving live moment:", error);
  }
}