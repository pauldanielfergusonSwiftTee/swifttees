import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

type SendPushOptions = {
  title: string;
  message: string;
  url?: string;
};

type SendPushResult = {
  sent: number;
  failed: number;
};

export async function sendPushToAll({
  title,
  message,
  url = "/live-centre",
}: SendPushOptions): Promise<SendPushResult> {
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
    throw new Error("Push configuration is incomplete");
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
    throw new Error(
      `Failed to load push subscriptions: ${error.message}`
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return {
      sent: 0,
      failed: 0,
    };
  }

  const payload = JSON.stringify({
    title,
    body: message,
    url,
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

  return {
    sent,
    failed,
  };
}