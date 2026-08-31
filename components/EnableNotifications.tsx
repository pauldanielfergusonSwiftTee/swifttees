"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function EnableNotifications() {
  const [status, setStatus] = useState("");

  async function enableNotifications() {
    try {
      setStatus("Enabling...");

      if (!("serviceWorker" in navigator)) {
        setStatus("Service workers not supported.");
        return;
      }

      if (!("PushManager" in window)) {
        setStatus("Push notifications not supported.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("Notifications not allowed.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
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

      setStatus("Notifications enabled ✅");
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong.");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-lg font-bold">Live Notifications</h3>

      <p className="mt-1 text-sm text-white/70">
        Get important Swift Tees updates during events.
      </p>

      <button
        onClick={enableNotifications}
        className="mt-4 rounded-xl bg-lime-400 px-4 py-3 font-bold text-black"
      >
        Enable Notifications
      </button>

      {status && (
        <p className="mt-3 text-sm text-white/70">
          {status}
        </p>
      )}
    </div>
  );
}