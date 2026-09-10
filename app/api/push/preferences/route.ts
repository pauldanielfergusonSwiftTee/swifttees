import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function cleanRounds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  ).sort((a, b) => a - b);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const endpoint = url.searchParams.get("endpoint")?.trim();
    const eventSlug = url.searchParams.get("eventSlug")?.trim();

    if (!endpoint || !eventSlug) {
      return NextResponse.json(
        {
          error: "endpoint and eventSlug are required",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("push_notification_preferences")
      .select(
        "event_slug, live_updates_enabled, results_enabled, enabled_rounds"
      )
      .eq("endpoint", endpoint)
      .eq("event_slug", eventSlug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      preference: data ?? null,
    });
  } catch (error) {
    console.error("Could not load push preferences:", error);

    return NextResponse.json(
      {
        error: "Could not load notification preferences",
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const endpoint = String(body?.endpoint ?? "").trim();
    const eventSlug = String(body?.eventSlug ?? "").trim();

    const enabledRounds = cleanRounds(
      body?.enabledRounds
    );

    const resultsEnabled =
      body?.resultsEnabled !== false;

    if (!endpoint || !eventSlug) {
      return NextResponse.json(
        {
          error: "endpoint and eventSlug are required",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = getAdminSupabase();

    const row = {
      endpoint,
      event_slug: eventSlug,
      live_updates_enabled:
        enabledRounds.length > 0,
      results_enabled:
        resultsEnabled,
      enabled_rounds:
        enabledRounds,
      updated_at:
        new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("push_notification_preferences")
      .upsert(row, {
        onConflict:
          "endpoint,event_slug",
      })
      .select(
        "event_slug, live_updates_enabled, results_enabled, enabled_rounds"
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      preference: data,
    });
  } catch (error) {
    console.error(
      "Could not save push preferences:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not save notification preferences",
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