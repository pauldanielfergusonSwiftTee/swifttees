"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import EnableNotifications from "@/components/EnableNotifications";
import { getAllTournamentsV2 } from "@/lib/tournaments-v2";

type EventPreference = {
  enabledRounds: number[];
  resultsEnabled: boolean;
  saving?: boolean;
  saved?: boolean;
};

function getRoundNumber(round: any, index: number) {
  return Number(
    round?.roundNumber ??
      round?.round_number ??
      round?.id ??
      index + 1
  );
}

function getCourseName(round: any) {
  return (
    round?.course ??
    round?.courseName ??
    round?.course_name ??
    "Course"
  );
}

function getRoundDate(round: any) {
  return String(
    round?.date ??
      round?.roundDate ??
      round?.round_date ??
      ""
  );
}

function formatDate(value: string) {
  if (!value) return "";

  const parsed = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isCurrentOrUpcomingTournament(tournament: any) {
  const rounds = Array.isArray(tournament?.rounds)
    ? tournament.rounds
    : [];

  const dates = rounds
    .map((round: any) => getRoundDate(round))
    .filter(Boolean)
    .map(
      (value: string) =>
        new Date(`${value}T23:59:59`).getTime()
    )
    .filter(
      (value: number) => !Number.isNaN(value)
    );

  if (dates.length === 0) return true;

  const latestRound = Math.max(...dates);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return latestRound >= today.getTime();
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-green-700" : "bg-slate-300"
      } ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : ""
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [endpoint, setEndpoint] = useState("");
  const [preferences, setPreferences] = useState<
    Record<string, EventPreference>
  >({});
  const [loading, setLoading] = useState(true);
  const [pushAvailable, setPushAvailable] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const visibleTournaments = useMemo(
    () =>
      tournaments.filter(
        isCurrentOrUpcomingTournament
      ),
    [tournaments]
  );

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setErrorMessage("");

        const savedTournaments =
          await getAllTournamentsV2();

        const tournamentList = Array.isArray(
          savedTournaments
        )
          ? savedTournaments
          : [];

        setTournaments(tournamentList);

        if (
          typeof window === "undefined" ||
          !("serviceWorker" in navigator) ||
          !("PushManager" in window)
        ) {
          setPushAvailable(false);
          return;
        }

        const registration =
          await navigator.serviceWorker.ready;

        const subscription =
          await registration.pushManager.getSubscription();

        if (!subscription) {
          setPushAvailable(false);
          return;
        }

        setPushAvailable(true);

        const deviceEndpoint =
          subscription.endpoint;

        setEndpoint(deviceEndpoint);

        const initial: Record<
          string,
          EventPreference
        > = {};

        for (const tournament of tournamentList.filter(
          isCurrentOrUpcomingTournament
        )) {
          const rounds = Array.isArray(
            tournament?.rounds
          )
            ? tournament.rounds
            : [];

          const allRoundNumbers = rounds.map(
            (round: any, index: number) =>
              getRoundNumber(round, index)
          );

          const response = await fetch(
            `/api/push/preferences?endpoint=${encodeURIComponent(
              deviceEndpoint
            )}&eventSlug=${encodeURIComponent(
              tournament.slug
            )}`,
            {
              cache: "no-store",
            }
          );

          if (!response.ok) {
            throw new Error(
              `Could not load preferences for ${tournament.name}`
            );
          }

          const result = await response.json();
          const saved = result?.preference;

          initial[tournament.slug] = saved
            ? {
                enabledRounds: Array.isArray(
                  saved.enabled_rounds
                )
                  ? saved.enabled_rounds.map(Number)
                  : [],
                resultsEnabled:
                  saved.results_enabled !== false,
              }
            : {
                enabledRounds: allRoundNumbers,
                resultsEnabled: true,
              };
        }

        setPreferences(initial);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load notification settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  async function savePreference(
    tournament: any,
    next: EventPreference
  ) {
    if (!endpoint) return;

    const slug = tournament.slug;

    setPreferences((current) => ({
      ...current,
      [slug]: {
        ...next,
        saving: true,
        saved: false,
      },
    }));

    try {
      const response = await fetch(
        "/api/push/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint,
            eventSlug: slug,
            enabledRounds: next.enabledRounds,
            resultsEnabled: next.resultsEnabled,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Could not save preferences."
        );
      }

      setPreferences((current) => ({
        ...current,
        [slug]: {
          enabledRounds: next.enabledRounds,
          resultsEnabled: next.resultsEnabled,
          saving: false,
          saved: true,
        },
      }));

      window.setTimeout(() => {
        setPreferences((current) => ({
          ...current,
          [slug]: {
            ...current[slug],
            saved: false,
          },
        }));
      }, 1200);
    } catch (error) {
      console.error(error);

      setPreferences((current) => ({
        ...current,
        [slug]: {
          ...current[slug],
          saving: false,
        },
      }));

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save notification settings."
      );
    }
  }

  function toggleWholeEvent(tournament: any) {
    const rounds = Array.isArray(
      tournament?.rounds
    )
      ? tournament.rounds
      : [];

    const allRoundNumbers = rounds.map(
      (round: any, index: number) =>
        getRoundNumber(round, index)
    );

    const current =
      preferences[tournament.slug] ?? {
        enabledRounds: allRoundNumbers,
        resultsEnabled: true,
      };

    const allLiveEnabled =
      allRoundNumbers.length > 0 &&
      allRoundNumbers.every((number: number) =>
        current.enabledRounds.includes(number)
      );

    savePreference(tournament, {
      enabledRounds: allLiveEnabled
        ? []
        : allRoundNumbers,
      resultsEnabled: current.resultsEnabled,
    });
  }

  function toggleRound(
    tournament: any,
    roundNumber: number
  ) {
    const current =
      preferences[tournament.slug];

    if (!current) return;

    const enabled =
      current.enabledRounds.includes(
        roundNumber
      );

    const nextRounds = enabled
      ? current.enabledRounds.filter(
          (number) => number !== roundNumber
        )
      : [
          ...current.enabledRounds,
          roundNumber,
        ].sort((a, b) => a - b);

    savePreference(tournament, {
      enabledRounds: nextRounds,
      resultsEnabled: current.resultsEnabled,
    });
  }

  function toggleResults(tournament: any) {
    const current =
      preferences[tournament.slug];

    if (!current) return;

    savePreference(tournament, {
      enabledRounds: current.enabledRounds,
      resultsEnabled: !current.resultsEnabled,
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 pb-28 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-[2rem] bg-green-950 p-6 text-white shadow-lg">
          <Link
            href="/more"
            className="text-sm font-black text-lime-300"
          >
            ← More
          </Link>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-green-300">
            Swift Tees
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            🔔 Notifications
          </h1>

          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-green-100">
            Choose which live golf updates you want on
            this phone.
          </p>
        </section>

        {/* DEVICE NOTIFICATIONS */}
        <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Your Device
            </p>

            <h2 className="mt-1 text-xl font-black text-green-950">
              Push Notifications
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Enable or disable Swift Tees notifications
              on this device.
            </p>
          </div>

          <EnableNotifications />
        </section>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <section className="mt-4 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-green-800" />

            <p className="mt-4 font-black text-green-950">
              Loading notification settings...
            </p>
          </section>
        ) : !pushAvailable ? (
          <section className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-3xl">🔕</p>

            <h2 className="mt-3 text-2xl font-black text-green-950">
              Notifications aren&apos;t enabled on this
              phone
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enable Swift Tees notifications above to
              choose the tournaments and rounds you want.
            </p>
          </section>
        ) : visibleTournaments.length === 0 ? (
          <section className="mt-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-3xl">⛳</p>

            <h2 className="mt-3 text-xl font-black text-green-950">
              No upcoming tournaments
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New tournament setups will appear here
              automatically.
            </p>
          </section>
        ) : (
          <div className="mt-4 space-y-4">
            {visibleTournaments.map(
              (tournament) => {
                const rounds = Array.isArray(
                  tournament?.rounds
                )
                  ? tournament.rounds
                  : [];

                const allRoundNumbers =
                  rounds.map(
                    (
                      round: any,
                      index: number
                    ) =>
                      getRoundNumber(
                        round,
                        index
                      )
                  );

                const preference =
                  preferences[
                    tournament.slug
                  ] ?? {
                    enabledRounds:
                      allRoundNumbers,
                    resultsEnabled: true,
                  };

                const allLiveEnabled =
                  allRoundNumbers.length > 0 &&
                  allRoundNumbers.every(
                    (number: number) =>
                      preference.enabledRounds.includes(
                        number
                      )
                  );

                const someLiveEnabled =
                  preference.enabledRounds
                    .length > 0 &&
                  !allLiveEnabled;

                return (
                  <section
                    key={tournament.slug}
                    className="overflow-hidden rounded-[1.8rem] bg-white shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="border-b border-slate-100 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                            Tournament
                          </p>

                          <h2 className="mt-1 text-2xl font-black tracking-tight text-green-950">
                            {tournament.name ??
                              tournament.slug}
                          </h2>

                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {preference.saving
                              ? "Saving..."
                              : preference.saved
                              ? "✓ Saved"
                              : `${
                                  rounds.length
                                } round${
                                  rounds.length ===
                                  1
                                    ? ""
                                    : "s"
                                }`}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
                            allLiveEnabled
                              ? "bg-green-100 text-green-800"
                              : someLiveEnabled
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {allLiveEnabled
                            ? "All On"
                            : someLiveEnabled
                            ? "Custom"
                            : "Live Off"}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <div className="flex items-center justify-between gap-4 p-5">
                        <div>
                          <p className="font-black text-green-950">
                            🔔 Entire event
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Turn all live round
                            updates on or off
                          </p>
                        </div>

                        <Toggle
                          checked={
                            allLiveEnabled
                          }
                          disabled={
                            preference.saving
                          }
                          onChange={() =>
                            toggleWholeEvent(
                              tournament
                            )
                          }
                        />
                      </div>

                      {rounds.map(
                        (
                          round: any,
                          index: number
                        ) => {
                          const roundNumber =
                            getRoundNumber(
                              round,
                              index
                            );

                          const enabled =
                            preference.enabledRounds.includes(
                              roundNumber
                            );

                          return (
                            <div
                              key={`${tournament.slug}-${roundNumber}`}
                              className="flex items-center justify-between gap-4 px-5 py-4"
                            >
                              <div className="min-w-0">
                                <p className="font-black text-green-950">
                                  ⛳ Round{" "}
                                  {roundNumber}
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-slate-600">
                                  {getCourseName(
                                    round
                                  )}
                                </p>

                                {(round?.day ||
                                  getRoundDate(
                                    round
                                  )) && (
                                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                    {round?.day ??
                                      formatDate(
                                        getRoundDate(
                                          round
                                        )
                                      )}
                                  </p>
                                )}
                              </div>

                              <Toggle
                                checked={
                                  enabled
                                }
                                disabled={
                                  preference.saving
                                }
                                onChange={() =>
                                  toggleRound(
                                    tournament,
                                    roundNumber
                                  )
                                }
                              />
                            </div>
                          );
                        }
                      )}

                      <div className="flex items-center justify-between gap-4 p-5">
                        <div>
                          <p className="font-black text-green-950">
                            🏆 Results
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Round and final
                            results
                          </p>
                        </div>

                        <Toggle
                          checked={
                            preference.resultsEnabled
                          }
                          disabled={
                            preference.saving
                          }
                          onChange={() =>
                            toggleResults(
                              tournament
                            )
                          }
                        />
                      </div>
                    </div>
                  </section>
                );
              }
            )}
          </div>
        )}

        <p className="mt-5 px-2 text-center text-xs font-semibold leading-5 text-slate-400">
          These choices only affect this phone. Manual
          admin announcements are still sent to everyone
          with Swift Tees notifications enabled.
        </p>
      </div>
    </main>
  );
}