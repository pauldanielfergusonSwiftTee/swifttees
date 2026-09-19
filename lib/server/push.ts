import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { sendApnsNotification } from "@/lib/server/apns";

export type PushCategory = "live" | "results" | "admin";

type SendPushInput = {
  title: string;
  message: string;
  url?: string;
  eventSlug?: string;
  roundNumber?: number;
  category?: PushCategory;
};

type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled?: boolean | null;
};

type NativePushSubscriptionRow = {
  device_token: string;
  enabled?: boolean | null;
};

type PreferenceRow = {
  endpoint: string;
  event_slug: string;
  live_updates_enabled: boolean;
  results_enabled: boolean;
  enabled_rounds: number[] | null;
};

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

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  const subject =
    process.env.VAPID_SUBJECT ??
    process.env.VAPID_EMAIL ??
    "mailto:swifttees@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID environment variables.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function shouldReceive(
  subscription: PushSubscriptionRow,
  preferenceMap: Map<string, PreferenceRow>,
  input: SendPushInput
) {
  const category = input.category ?? "admin";

  // Manual admin messages are intentionally global.
  if (category === "admin") return true;

  // Without an event context, preserve the old behaviour.
  if (!input.eventSlug) return true;

  const preference = preferenceMap.get(subscription.endpoint);

  // No preference row = default everything ON.
  if (!preference) return true;

  if (category === "results") {
    return preference.results_enabled !== false;
  }

  if (preference.live_updates_enabled === false) {
    return false;
  }

  if (typeof input.roundNumber === "number") {
    const enabledRounds = Array.isArray(preference.enabled_rounds)
      ? preference.enabled_rounds.map(Number)
      : [];

    return enabledRounds.includes(Number(input.roundNumber));
  }

  return true;
}

export async function sendPushToAll(input: SendPushInput) {
  configureWebPush();

  const supabase = getAdminSupabase();

  const [
    { data: subscriptionData, error: subscriptionsError },
    { data: nativeSubscriptionData, error: nativeSubscriptionsError },
  ] = await Promise.all([
    supabase
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth,enabled")
      .eq("enabled", true),

    supabase
      .from("native_push_subscriptions")
      .select("device_token,enabled")
      .eq("enabled", true),
  ]);

  if (subscriptionsError) {
    throw subscriptionsError;
  }

  if (nativeSubscriptionsError) {
    throw nativeSubscriptionsError;
  }

  const subscriptions =
    (subscriptionData ?? []) as PushSubscriptionRow[];

  const nativeSubscriptions =
    (nativeSubscriptionData ?? []) as NativePushSubscriptionRow[];

  const preferenceMap = new Map<string, PreferenceRow>();

  if (
    input.eventSlug &&
    input.category &&
    input.category !== "admin" &&
    subscriptions.length > 0
  ) {
    const endpoints = subscriptions.map((row) => row.endpoint);

    const { data: preferenceData, error: preferenceError } =
      await supabase
        .from("push_notification_preferences")
        .select(
          "endpoint,event_slug,live_updates_enabled,results_enabled,enabled_rounds"
        )
        .eq("event_slug", input.eventSlug)
        .in("endpoint", endpoints);

    if (preferenceError) {
      // Preference failure should not silently send unwanted alerts.
      console.error(
        "Could not load push preferences:",
        preferenceError
      );
      throw preferenceError;
    }

    for (const row of (preferenceData ?? []) as PreferenceRow[]) {
      preferenceMap.set(row.endpoint, row);
    }
  }

  const url = input.url ?? "/live-centre";

  const payload = JSON.stringify({
    title: input.title,
    body: input.message,
    url,
  });

  let webSent = 0;
  let webFailed = 0;
  let webSkipped = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      if (!shouldReceive(subscription, preferenceMap, input)) {
        webSkipped += 1;
        return;
      }

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

        webSent += 1;
      } catch (error: any) {
        webFailed += 1;

        const statusCode = Number(error?.statusCode ?? 0) || 0;

        if (statusCode === 404 || statusCode === 410) {
          const { error: disableError } = await supabase
            .from("push_subscriptions")
            .update({ enabled: false })
            .eq("endpoint", subscription.endpoint);

          if (disableError) {
            console.error(
              "Could not disable expired push subscription:",
              disableError
            );
          }
        } else {
          console.error("Web push send failed:", error);
        }
      }
    })
  );

  let nativeSent = 0;
  let nativeFailed = 0;

  await Promise.all(
    nativeSubscriptions.map(async (subscription) => {
      try {
        const result = await sendApnsNotification({
          deviceToken: subscription.device_token,
          title: input.title,
          message: input.message,
          url,
        });

        if (result.success) {
          nativeSent += 1;
          return;
        }

        nativeFailed += 1;

        console.error(
          "Native APNs send failed:",
          result.status,
          result.reason
        );

        if (
          result.status === 410 ||
          result.reason === "Unregistered"
        ) {
          const { error: disableError } = await supabase
            .from("native_push_subscriptions")
            .update({
              enabled: false,
              updated_at: new Date().toISOString(),
            })
            .eq("device_token", subscription.device_token);

          if (disableError) {
            console.error(
              "Could not disable expired native push subscription:",
              disableError
            );
          }
        }
      } catch (error) {
        nativeFailed += 1;
        console.error("Native push send failed:", error);
      }
    })
  );

  return {
    sent: webSent + nativeSent,
    failed: webFailed + nativeFailed,
    skipped: webSkipped,
    total: subscriptions.length + nativeSubscriptions.length,

    web: {
      sent: webSent,
      failed: webFailed,
      skipped: webSkipped,
      total: subscriptions.length,
    },

    native: {
      sent: nativeSent,
      failed: nativeFailed,
      total: nativeSubscriptions.length,
    },
  };
}