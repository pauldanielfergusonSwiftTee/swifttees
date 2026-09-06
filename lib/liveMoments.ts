import { supabase } from "@/lib/supabase";

export async function getLiveMoments(
  eventSlug: string
) {
  const { data, error } = await supabase
    .from("live_moments")
    .select("*")
    .eq("event_slug", eventSlug)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  if (error) {
    console.error(
      "Error loading live moments:",
      error
    );

    return [];
  }

  return data ?? [];
}

export async function saveLiveMoment(
  moment: any
) {
  try {
    const response = await fetch(
      "/api/live-moments",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(moment),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Error saving live moment:",
        result
      );

      return null;
    }

    return result;
  } catch (error) {
    console.error(
      "Error saving live moment:",
      error
    );

    return null;
  }
}