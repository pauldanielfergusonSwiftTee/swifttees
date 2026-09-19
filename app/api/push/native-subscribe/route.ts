import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { deviceToken, platform = "ios" } = await request.json();

    if (!deviceToken || typeof deviceToken !== "string") {
      return NextResponse.json(
        { error: "Device token is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase server environment variables" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const { error } = await supabase
      .from("native_push_subscriptions")
      .upsert(
        {
          device_token: deviceToken,
          platform,
          enabled: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "device_token",
        }
      );

    if (error) {
      console.error(
        "Native push subscription error:",
        error
      );

      return NextResponse.json(
        {
          error: "Failed to save native push subscription",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Native push subscribe route error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unexpected server error",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}