"use client";

import { useState } from "react";

const notificationTypes = [
  {
    value: "live",
    label: "Live Update",
    title: "⛳ Live Update",
    description: "Scores, leaderboard changes and anything happening live.",
  },
  {
    value: "weekend",
    label: "Weekend Info",
    title: "📅 Weekend Update",
    description: "Tee times, teams, plans, timings and general weekend info.",
  },
  {
    value: "important",
    label: "Important",
    title: "📣 Important Update",
    description: "Something everyone needs to see.",
  },
];

const destinations = [
  {
    value: "/",
    label: "Home",
  },
  {
    value: "/live-centre",
    label: "Live Centre",
  },
  {
    value: "/live-scoring-v2",
    label: "Scorecard",
  },
  {
    value: "/overall-leaderboard",
    label: "Overall Leaderboard",
  },
  {
    value: "/events",
    label: "Events",
  },
  {
    value: "/more",
    label: "More",
  },
  {
    value: "custom",
    label: "Custom page...",
  },
];

export default function NotificationsAdminPage() {
  const [category, setCategory] = useState("live");
  const [title, setTitle] = useState("⛳ Live Update");
  const [message, setMessage] = useState("");

  const [destination, setDestination] =
    useState("/live-centre");

  const [customUrl, setCustomUrl] = useState("");

  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const selectedType =
    notificationTypes.find(
      (item) => item.value === category
    ) ?? notificationTypes[0];

  const finalUrl =
    destination === "custom"
      ? customUrl.trim() || "/"
      : destination;

  function handleCategoryChange(value: string) {
    setCategory(value);

    const selected = notificationTypes.find(
      (item) => item.value === value
    );

    if (selected) {
      setTitle(selected.title);
    }

    setStatus("");
  }

  async function sendNotification() {
    if (!title.trim()) {
      setStatus("Please enter a title.");
      return;
    }

    if (!message.trim()) {
      setStatus("Please enter a message.");
      return;
    }

    if (
      destination === "custom" &&
      !customUrl.trim()
    ) {
      setStatus("Please enter the page to open.");
      return;
    }

    const confirmed = window.confirm(
      `Send this notification to all subscribed Swift Tees devices?\n\n${title}\n${message}`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSending(true);
      setStatus("Sending notification...");

      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          url: finalUrl,
          category,
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

      const sent = data.sent ?? 0;
      const failed = data.failed ?? 0;

      if (failed > 0) {
        setStatus(
          `✅ Sent to ${sent} device${
            sent === 1 ? "" : "s"
          } · ${failed} failed`
        );
      } else {
        setStatus(
          `✅ Sent successfully to ${sent} device${
            sent === 1 ? "" : "s"
          }`
        );
      }

      // Ready for another notification
      setMessage("");
    } catch (error) {
      console.error(error);

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Something went wrong."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 pt-8 pb-32 text-slate-900">
      <div className="mx-auto max-w-xl">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-widest text-green-700">
            Swift Tees Admin
          </p>

          <h1 className="mt-2 text-3xl font-black text-green-950">
            Send Notification
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Send an update directly to everyone with
            Swift Tees notifications enabled.
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {/* CATEGORY */}
          <div>
            <label className="text-sm font-bold text-slate-700">
              What&apos;s this about?
            </label>

            <select
              value={category}
              onChange={(event) =>
                handleCategoryChange(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-green-700"
            >
              {notificationTypes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {selectedType.description}
            </p>
          </div>

          {/* TITLE */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-slate-700">
                Title
              </label>

              <span className="text-xs text-slate-400">
                You can edit this
              </span>
            </div>

            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setStatus("");
              }}
              maxLength={60}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
              placeholder="⛳ Live Update"
            />
          </div>

          {/* MESSAGE */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-slate-700">
                Message
              </label>

              <span
                className={`text-xs ${
                  message.length > 140
                    ? "font-bold text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {message.length}/180
              </span>
            </div>

            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setStatus("");
              }}
              maxLength={180}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-700"
              placeholder="Team Green take the lead with four holes remaining..."
            />

            <p className="mt-2 text-xs text-slate-500">
              Short messages work best on the Lock Screen.
            </p>
          </div>

          {/* DESTINATION */}
          <div className="mt-5">
            <label className="text-sm font-bold text-slate-700">
              Open when tapped
            </label>

            <select
              value={destination}
              onChange={(event) => {
                setDestination(event.target.value);
                setStatus("");
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-green-700"
            >
              {destinations.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            {destination === "custom" && (
              <input
                value={customUrl}
                onChange={(event) => {
                  setCustomUrl(event.target.value);
                  setStatus("");
                }}
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-700"
                placeholder="/events/worsley-park-2026"
              />
            )}

            <p className="mt-2 text-xs text-slate-500">
              Tapping the notification will take them
              directly to this part of Swift Tees.
            </p>
          </div>

          {/* PREVIEW */}
          <div className="mt-7">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Notification Preview
            </p>

            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-950 text-xl">
                  ⛳
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-black leading-5 text-slate-900">
                    {title || "Notification title"}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {message ||
                      "Your notification message will appear here."}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    from Swift Tees
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEND INFO */}
          <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3">
            <div className="flex gap-3">
              <span>📲</span>

              <p className="text-sm leading-5 text-green-950">
                This will be sent to{" "}
                <strong>
                  all devices with Swift Tees
                  notifications enabled.
                </strong>
              </p>
            </div>
          </div>

          {/* SEND BUTTON */}
          <button
            type="button"
            onClick={sendNotification}
            disabled={
              sending ||
              !title.trim() ||
              !message.trim()
            }
            className="mt-5 w-full rounded-2xl bg-green-950 px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending
              ? "Sending..."
              : "Send Notification"}
          </button>

          {/* STATUS */}
          {status && (
            <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700">
              {status}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}