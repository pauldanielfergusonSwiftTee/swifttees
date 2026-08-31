"use client";

import { useState } from "react";

export default function NotificationsAdminPage() {
  const [title, setTitle] = useState("⛳ Swift Tees");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("/");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function sendNotification() {
    if (!title.trim() || !message.trim()) {
      setStatus("Please enter a title and message.");
      return;
    }

    try {
      setSending(true);
      setStatus("Sending...");

      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "Failed to send notification"
        );
      }

      setStatus(
        `Sent to ${data.sent} device${
          data.sent === 1 ? "" : "s"
        }${data.failed ? ` · ${data.failed} failed` : ""}`
      );
    } catch (error) {
      console.error(error);

      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-widest text-green-700">
            Swift Tees Admin
          </p>

          <h1 className="mt-2 text-3xl font-black text-green-950">
            Send Notification
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Send a push notification to all enabled Swift Tees devices.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Title
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-700"
              placeholder="⛳ Swift Tees"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-bold text-slate-700">
              Message
            </label>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-700"
              placeholder="Teams have been drawn. Check them out now."
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-bold text-slate-700">
              Open page
            </label>

            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-700"
              placeholder="/"
            />

            <p className="mt-2 text-xs text-slate-500">
              Example: /more or /live-centre
            </p>
          </div>

          <button
            onClick={sendNotification}
            disabled={sending}
            className="mt-6 w-full rounded-2xl bg-lime-400 px-5 py-4 font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>

          {status && (
            <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {status}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}