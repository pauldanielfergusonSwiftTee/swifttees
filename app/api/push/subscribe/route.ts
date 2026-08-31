import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");

      return NextResponse.json(
        { error: "Missing Supabase URL" },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");

      return NextResponse.json(
        { error: "Missing Supabase service role key" },
        { status: 500 }
      );
    }

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      console.error("Invalid push subscription:", subscription);

      return NextResponse.json(
        { error: "Invalid push subscription data" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          enabled: true,
        },
        {
          onConflict: "endpoint",
        }
      )
      .select();

    if (error) {
      console.error("Supabase push subscription error:", error);

      return NextResponse.json(
        {
          error: "Failed to save subscription",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("Push subscription saved:", data);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Push subscribe route error:", error);

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