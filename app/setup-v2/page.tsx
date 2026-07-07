"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSES, getCourseById } from "../../lib/courses";
import { getPlayers } from "../../lib/players";
import {
  saveTournamentV2,
  getAllTournamentsV2,
  setActiveTournamentV2,
   deleteTournamentV2,
} from "../../lib/tournaments-v2";

type Player = {
  id: number;
  name: string;
  team?: string;
};

type RoundFormat = "stableford" | "scramble";

type RoundSetup = {
  roundNumber: number;
  courseId: string;
  format: RoundFormat;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function SetupV2Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [eventName, setEventName] = useState("");
  const [roundCount, setRoundCount] = useState<1 | 2>(1);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
const [savedTournaments, setSavedTournaments] = useState<any[]>([]);
const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState("");
const [teamMode, setTeamMode] = useState<"none" | "teams">("none");
const [teams, setTeams] = useState<string[]>(["Team 1", "Team 2"]);
const [playerTeams, setPlayerTeams] = useState<Record<number, string>>({});
const [editingSlug, setEditingSlug] = useState("");

  const [rounds, setRounds] = useState<RoundSetup[]>([
    {
      roundNumber: 1,
      courseId: COURSES[0]?.id ?? "",
      format: "stableford",
    },
  ]);

 useEffect(() => {
  async function loadPage() {
    const data = await getPlayers();
    setPlayers(data);

    await loadSavedTournaments();
  }

  loadPage();
}, []);

  useEffect(() => {
    setRounds((current) => {
      if (roundCount === 1) return current.slice(0, 1);

      if (current.length === 2) return current;

      return [
        current[0],
        {
          roundNumber: 2,
          courseId: COURSES[1]?.id ?? COURSES[0]?.id ?? "",
          format: "stableford",
        },
      ];
    });
  }, [roundCount]);

  const eventSlug = useMemo(() => createSlug(eventName), [eventName]);

  const selectedPlayers = useMemo(() => {
    return players.filter((player) => selectedPlayerIds.includes(player.id));
  }, [players, selectedPlayerIds]);

  const tournamentPreview = useMemo(() => {
    return {
      slug: eventSlug || "event-slug",
      name: eventName || "Untitled Event",
      rounds: rounds.map((round) => {
        const course = getCourseById(round.courseId);

        return {
          roundNumber: round.roundNumber,
          courseId: round.courseId,
          courseName: course?.name,
          format: round.format,
          par: course?.par,
          yards: course?.yards,
          holes: course?.holes ?? [],
        };
      }),
      players: selectedPlayers.map((player) => ({
  id: player.id,
  name: player.name,
  eventTeam: teamMode === "teams" ? playerTeams[player.id] ?? null : null,
})),
teamMode,
teams: teamMode === "teams" ? teams : [],
    };
  }, [eventName, eventSlug, rounds, selectedPlayers]);

  function togglePlayer(playerId: number) {
    setSelectedPlayerIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }

      return [...current, playerId];
    });
  }

  function updateRound(
    roundNumber: number,
    field: keyof RoundSetup,
    value: string
  ) {
    setRounds((current) =>
      current.map((round) =>
        round.roundNumber === roundNumber
          ? {
              ...round,
              [field]: value,
            }
          : round
      )
    );
  }

async function handleSaveTournament() {
  try {
    setIsSaving(true);
    setSaveMessage("");

    if (!eventName.trim()) {
      setSaveMessage("❌ Add an event name first.");
      return;
    }

    if (selectedPlayerIds.length === 0) {
      setSaveMessage("❌ Select at least one player.");
      return;
    }

   await saveTournamentV2({
  slug: editingSlug || eventSlug,
  name: eventName,
  rounds: tournamentPreview.rounds,
  players: tournamentPreview.players,
  teamMode,
  teams: teamMode === "teams" ? teams : [],
});

    setSaveMessage("✅ Tournament saved.");
    await loadSavedTournaments();
  } catch (error: any) {
    setSaveMessage(`❌ ${error.message ?? "Could not save tournament."}`);
  } finally {
    setIsSaving(false);
  }
}

async function loadSavedTournaments() {
  try {
    setIsLoadingTournaments(true);

    const tournaments = await getAllTournamentsV2();

    setSavedTournaments(tournaments ?? []);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoadingTournaments(false);
  }
}
function loadTournamentIntoEditor(tournament: any) {
 setEditingSlug(tournament.slug ?? "");
    setEventName(tournament.name ?? "");

  const loadedRounds = tournament.rounds ?? [];
  setRounds(
    loadedRounds.map((round: any, index: number) => ({
      roundNumber: round.roundNumber ?? index + 1,
      courseId: round.courseId,
      format: round.format ?? "stableford",
    }))
  );

  setRoundCount(loadedRounds.length === 2 ? 2 : 1);

  const loadedPlayers = tournament.players ?? [];
  setSelectedPlayerIds(loadedPlayers.map((player: any) => player.id));

  setTeamMode(tournament.teamMode ?? "none");
  setTeams(tournament.teams?.length ? tournament.teams : ["Team 1", "Team 2"]);

  const loadedPlayerTeams: Record<number, string> = {};

  loadedPlayers.forEach((player: any) => {
    if (player.eventTeam) {
      loadedPlayerTeams[player.id] = player.eventTeam;
    }
  });

  setPlayerTeams(loadedPlayerTeams);
  setSaveMessage(`Loaded ${tournament.name} for editing.`);
}

async function handleSetActive(slug: string) {
  await setActiveTournamentV2(slug);
  setSaveMessage("✅ Active tournament updated.");
  await loadSavedTournaments();
}

async function handleDeleteTournament(slug: string) {
  const confirmed = window.confirm(
    "Delete this tournament? This cannot be undone."
  );

  if (!confirmed) return;

  await deleteTournamentV2(slug);
  setSaveMessage("🗑 Tournament deleted.");
  await loadSavedTournaments();
}

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 pb-24 text-white">
      <div className="mx-auto max-w-3xl space-y-5">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            Swift Tees
          </p>
          <h1 className="text-3xl font-black">Tournament Setup V2</h1>
          <p className="mt-2 text-sm text-slate-300">
            Reusable tournament setup. Existing setup and Live Centre remain untouched.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="text-sm font-bold text-slate-200">Event name</label>
          <input
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
            placeholder="e.g. Carden Park 2026"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <div className="mt-3 rounded-xl bg-slate-900 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Event slug
            </p>
            <p className="font-mono text-sm text-emerald-300">
              {eventSlug || "event-slug"}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-black">How many rounds?</h2>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {[1, 2].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setRoundCount(count as 1 | 2)}
                className={`rounded-xl border px-4 py-4 text-left font-black ${
                  roundCount === count
                    ? "border-emerald-400 bg-emerald-500 text-slate-950"
                    : "border-white/10 bg-slate-900 text-white"
                }`}
              >
                {count} Round{count === 2 ? "s" : ""}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {rounds.map((round) => {
            const course = getCourseById(round.courseId);

            return (
              <div
                key={round.roundNumber}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <h2 className="text-lg font-black">Round {round.roundNumber}</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-slate-200">
                      Course
                    </label>
                    <select
                      value={round.courseId}
                      onChange={(event) =>
                        updateRound(round.roundNumber, "courseId", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    >
                      {COURSES.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-200">
                      Format
                    </label>
                    <select
                      value={round.format}
                      onChange={(event) =>
                        updateRound(round.roundNumber, "format", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                    >
                      <option value="stableford">Stableford</option>
                      <option value="scramble">Scramble</option>
                    </select>
                  </div>
                </div>

                {course && (
                  <div className="mt-4 rounded-xl bg-slate-900 p-3">
                    <p className="text-sm font-black text-emerald-400">
                      {course.shortName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {course.club} • Par {course.par} • {course.yards} yards
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-black">Players</h2>
          <p className="mt-1 text-sm text-slate-400">
            Select exactly who is playing this event.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {players.map((player) => {
              const selected = selectedPlayerIds.includes(player.id);

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className={`rounded-xl border p-3 text-left ${
                    selected
                      ? "border-emerald-400 bg-emerald-500 text-slate-950"
                      : "border-white/10 bg-slate-900 text-white"
                  }`}
                >
                  <p className="font-black">{player.name}</p>
                  {player.team && <p className="text-xs opacity-70">{player.team}</p>}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Selected: {selectedPlayerIds.length}
          </p>
        </section>



<section className="rounded-2xl border border-white/10 bg-white/5 p-4">
  <h2 className="text-lg font-black">Event Type</h2>
  <p className="mt-1 text-sm text-slate-400">
    Optional. Use teams for bigger events, or leave off for singles-only rounds.
  </p>

  <div className="mt-4 grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => setTeamMode("none")}
      className={`rounded-xl border p-4 text-left font-black ${
        teamMode === "none"
          ? "border-emerald-400 bg-emerald-500 text-slate-950"
          : "border-white/10 bg-slate-900 text-white"
      }`}
    >
      👤 Individual Event
    </button>

    <button
      type="button"
      onClick={() => setTeamMode("teams")}
      className={`rounded-xl border p-4 text-left font-black ${
        teamMode === "teams"
          ? "border-emerald-400 bg-emerald-500 text-slate-950"
          : "border-white/10 bg-slate-900 text-white"
      }`}
    >
      👥 Team Event
    </button>
  </div>

  {teamMode === "teams" && (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        {teams.map((team, index) => (
          <input
            key={index}
            value={team}
            onChange={(event) => {
              const value = event.target.value;
              setTeams((current) =>
                current.map((item, itemIndex) =>
                  itemIndex === index ? value : item
                )
              );
            }}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setTeams((current) => [
            ...current,
            `Team ${current.length + 1}`,
          ])
        }
        className="w-full rounded-xl bg-slate-800 px-4 py-3 font-bold"
      >
        + Add Team
      </button>

      <div className="space-y-3">
        <h3 className="font-black">Assign Players</h3>

        {selectedPlayers.map((player) => (
          <div
            key={player.id}
            className="rounded-xl bg-slate-900 p-3"
          >
            <p className="font-bold">{player.name}</p>

            <select
              value={playerTeams[player.id] ?? ""}
              onChange={(event) =>
                setPlayerTeams((current) => ({
                  ...current,
                  [player.id]: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            >
              <option value="">No team selected</option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )}
</section>



<section className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
  <button
    type="button"
    onClick={handleSaveTournament}
    disabled={isSaving}
    className="w-full rounded-xl bg-emerald-500 px-4 py-4 font-black text-slate-950 disabled:opacity-50"
  >
    {isSaving ? "Saving..." : "Save Tournament"}
  </button>

  {saveMessage && (
    <p className="mt-3 text-sm font-bold text-white">{saveMessage}</p>
  )}
</section>

<section className="rounded-2xl border border-white/10 bg-white/5 p-4">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-black">
      Saved Tournaments
    </h2>

    <button
      type="button"
      onClick={loadSavedTournaments}
      className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-bold"
    >
      Refresh
    </button>
  </div>

  {isLoadingTournaments ? (
    <p className="mt-3 text-slate-400">
      Loading...
    </p>
  ) : (
    <div className="mt-4 space-y-2">
      {savedTournaments.map((tournament) => (
        <div
          key={tournament.id}
          className="rounded-xl bg-slate-900 p-3"
        >
          <p className="font-black">
  {tournament.name}
</p>

{tournament.is_active && (
  <p className="mt-1 text-xs font-black text-emerald-400">
    ✅ Active Tournament
  </p>
)}

          <p className="text-xs text-slate-400">
            {tournament.slug}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {tournament.players?.length ?? 0} players •{" "}
            {tournament.rounds?.length ?? 0} rounds
          </p>
         <div className="mt-3 flex gap-2">
  <button
    type="button"
    onClick={() => loadTournamentIntoEditor(tournament)}
    className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-black text-slate-950"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => handleSetActive(tournament.slug)}
    className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-black text-slate-950"
  >
    Set Active
  </button>
  <button
  type="button"
  onClick={() => handleDeleteTournament(tournament.slug)}
  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-black text-white"
>
  Delete
</button>
</div>
        </div>
      ))}
    </div>
  )}
</section>

        <section className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
          <h2 className="text-lg font-black text-emerald-300">Setup Preview</h2>
          <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
            {JSON.stringify(tournamentPreview, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}