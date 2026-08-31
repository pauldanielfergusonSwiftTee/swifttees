import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export async function POST(request: Request) {
  try {
    const { title, message, url } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !vapidPublicKey ||
      !vapidPrivateKey ||
      !vapidSubject
    ) {
      console.error("Missing push environment variables");

      return NextResponse.json(
        { error: "Push configuration is incomplete" },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("enabled", true);

    if (error) {
      console.error("Failed to load subscriptions:", error);

      return NextResponse.json(
        { error: "Failed to load subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: "No enabled subscriptions found",
      });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || "/",
    });

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        );

        sent++;
      } catch (error: any) {
        failed++;

        console.error(
          "Push failed for subscription:",
          subscription.id,
          error
        );

        // If browser/device says subscription is gone,
        // disable it so we stop trying in future.
        if (
          error?.statusCode === 404 ||
          error?.statusCode === 410
        ) {
          await supabase
            .from("push_subscriptions")
            .update({ enabled: false })
            .eq("id", subscription.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Push send route error:", error);

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