import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendApnsNotification } from "@/lib/server/apns";

export async function POST() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Missing Supabase server environment variables",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data, error } = await supabase
      .from("native_push_subscriptions")
      .select("device_token")
      .eq("enabled", true);

    if (error) {
      console.error(
        "Could not load native push subscriptions:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Could not load native push subscriptions",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            "No enabled native push subscriptions found",
        },
        { status: 404 }
      );
    }

    const results = [];

    for (const subscription of data) {
      try {
        const result = await sendApnsNotification({
          deviceToken: subscription.device_token,
          title: "Swift Tees",
          message:
            "Native notifications are working! ⛳️",
          url: "/live-centre",
        });

        results.push({
          success: result.success,
          status: result.status,
          reason: result.reason,
        });
      } catch (error) {
        console.error(
          "Native push test failed:",
          error
        );

        results.push({
          success: false,
          status: 0,
          reason:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
      }
    }

    const sent = results.filter(
      (result) => result.success
    ).length;

    const failed = results.length - sent;

    return NextResponse.json({
      success: failed === 0,
      sent,
      failed,
      results,
    });
  } catch (error) {
    console.error(
      "Native push test route error:",
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