"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export default function EnableNotifications() {
  const [status, setStatus] = useState("");
  const [permission, setPermission] =
    useState<NotificationPermission | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  async function enableNotifications() {
    try {
      setLoading(true);
      setStatus("");

      if (!("serviceWorker" in navigator)) {
        setStatus("Service workers aren't supported on this device.");
        return;
      }

      if (!("PushManager" in window)) {
        setStatus("Push notifications aren't supported on this device.");
        return;
      }

      const notificationPermission =
        await Notification.requestPermission();

      setPermission(notificationPermission);

      if (notificationPermission !== "granted") {
        setStatus("Notifications haven't been allowed.");
        return;
      }

      const registration =
        await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error("Missing VAPID public key");
        }

        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(publicKey),
          });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setStatus("Live notifications are enabled on this device.");
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong enabling notifications.");
    } finally {
      setLoading(false);
    }
  }

  const enabled = permission === "granted";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl">
          {enabled ? "✅" : "📲"}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-green-950">
            {enabled
              ? "Notifications Enabled"
              : "Enable Live Notifications"}
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            {enabled
              ? "This device can receive live Swift Tees updates."
              : "Get important live updates on this device during events."}
          </p>
        </div>
      </div>

      {!enabled && (
        <button
          type="button"
          onClick={enableNotifications}
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-green-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Enabling..."
            : "Enable Notifications"}
        </button>
      )}

      {enabled && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-900">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
          Ready for Swift Tees push notifications
        </div>
      )}

      {status && !enabled && (
        <p className="mt-3 text-sm text-slate-500">
          {status}
        </p>
      )}
    </div>
  );
}