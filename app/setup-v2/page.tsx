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

type PlayerHandicaps = {
  stableford: number | "";
  scramble: number | "";
};

type PairSetup = {
  player1Id: string;
  player2Id: string;
  finalHandicap: number | "";
};

type RoundSetup = {
  roundNumber: number;
  courseId: string;
  format: RoundFormat;
  groupCount: number;
  teeTimes: string[];
  groups: string[][];
  pairs: PairSetup[][];
  longestDrivePoints: number;
  nearestPinPoints: number;
  longestDriveHoles: number[];
  nearestPinHoles: number[];
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function makeEmptyGroup() {
  return ["", "", "", ""];
}

function makeEmptyPairs(): PairSetup[] {
  return [
  {
    player1Id: "",
    player2Id: "",
    finalHandicap: "" as number | "",
  },
  {
    player1Id: "",
    player2Id: "",
    finalHandicap: "" as number | "",
  },
];
}

function makeRound(roundNumber: number, courseId: string): RoundSetup {
  return {
    roundNumber,
    courseId,
    format: "stableford",
    groupCount: 1,
    teeTimes: [""],
    groups: [makeEmptyGroup()],
    pairs: [makeEmptyPairs()],
    longestDrivePoints: 2,
    nearestPinPoints: 2,
    longestDriveHoles: [],
    nearestPinHoles: [],
  };
}

export default function SetupV2Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [eventName, setEventName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");

  const [roundCount, setRoundCount] = useState<1 | 2>(1);
  const [rounds, setRounds] = useState<RoundSetup[]>([
    makeRound(1, COURSES[0]?.id ?? ""),
  ]);

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [handicaps, setHandicaps] = useState<Record<number, PlayerHandicaps>>(
    {}
  );

  const [teamMode, setTeamMode] = useState<"none" | "teams">("none");
  const [teams, setTeams] = useState<string[]>(["Team 1", "Team 2"]);
  const [playerTeams, setPlayerTeams] = useState<Record<number, string>>({});

  const [savedTournaments, setSavedTournaments] = useState<any[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      const data = await getPlayers();
      setPlayers(data);

      setHandicaps((current) => {
        const updated = { ...current };

        data.forEach((player: Player) => {
          if (!updated[player.id]) {
            updated[player.id] = {
              stableford: "",
              scramble: "",
            };
          }
        });

        return updated;
      });

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
        makeRound(2, COURSES[1]?.id ?? COURSES[0]?.id ?? ""),
      ];
    });
  }, [roundCount]);

  const eventSlug = useMemo(() => createSlug(eventName), [eventName]);

  const selectedPlayers = useMemo(() => {
    return players.filter((player) => selectedPlayerIds.includes(player.id));
  }, [players, selectedPlayerIds]);

  function getPlayer(playerId: string | number) {
    return players.find((player) => Number(player.id) === Number(playerId));
  }

  function getStablefordHandicap(playerId: string | number) {
    return handicaps[Number(playerId)]?.stableford ?? "";
  }

  function getScrambleHandicap(playerId: string | number) {
    return handicaps[Number(playerId)]?.scramble ?? "";
  }

  function calculatePairHandicap(player1Id: string, player2Id: string) {
    const h1 = getScrambleHandicap(player1Id);
    const h2 = getScrambleHandicap(player2Id);

    if (!player1Id || !player2Id || h1 === "" || h2 === "") return "";

    return Math.round(((Number(h1) + Number(h2)) / 2) * 10) / 10;
  }

  function getFinalPairHandicap(pair: PairSetup) {
    const calculated = calculatePairHandicap(pair.player1Id, pair.player2Id);

    if (pair.finalHandicap !== "") return pair.finalHandicap;
    if (calculated !== "") return calculated;

    return "";
  }

  const tournamentPreview = useMemo(() => {
    return {
      slug: editingSlug || eventSlug || "event-slug",
      name: eventName || "Untitled Event",
      teamMode,
      teams: teamMode === "teams" ? teams : [],
      players: selectedPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        eventTeam: teamMode === "teams" ? playerTeams[player.id] ?? null : null,
        stablefordHandicap: handicaps[player.id]?.stableford || 0,
        scrambleHandicap: handicaps[player.id]?.scramble || 0,
      })),
      rounds: rounds.map((round) => {
        const course = getCourseById(round.courseId);

        const groups = Array.from({ length: round.groupCount }).map(
          (_, groupIndex) => {
            const stablefordPlayers = round.groups[groupIndex] ?? [];
            const scramblePairs = round.pairs[groupIndex] ?? [];

            const groupPlayers =
              round.format === "scramble"
                ? scramblePairs
                    .flatMap((pair) => [pair.player1Id, pair.player2Id])
                    .filter(Boolean)
                : stablefordPlayers.filter(Boolean);

            return {
              id: groupIndex + 1,
              groupNumber: groupIndex + 1,
              name: `Group ${groupIndex + 1}`,
              teeTime: round.teeTimes[groupIndex] ?? "",
              players: groupPlayers.map((playerId) => {
                const player = getPlayer(playerId);

                return {
                  player_id: Number(playerId),
                  name: player?.name ?? "",
                  team:
                    teamMode === "teams"
                      ? playerTeams[Number(playerId)] ?? ""
                      : "",
                  eventHandicap:
                    handicaps[Number(playerId)]?.stableford === ""
                      ? 0
                      : handicaps[Number(playerId)]?.stableford ?? 0,
                  stablefordHandicap:
                    handicaps[Number(playerId)]?.stableford === ""
                      ? 0
                      : handicaps[Number(playerId)]?.stableford ?? 0,
                  scrambleHandicap:
                    handicaps[Number(playerId)]?.scramble === ""
                      ? 0
                      : handicaps[Number(playerId)]?.scramble ?? 0,
                };
              }),
              pairs:
                round.format === "scramble"
                  ? scramblePairs.map((pair, pairIndex) => {
                      const player1 = getPlayer(pair.player1Id);
                      const player2 = getPlayer(pair.player2Id);
                      const calculatedHandicap = calculatePairHandicap(
                        pair.player1Id,
                        pair.player2Id
                      );

                      const finalHandicap =
                        pair.finalHandicap !== ""
                          ? pair.finalHandicap
                          : calculatedHandicap !== ""
                          ? calculatedHandicap
                          : 0;

                      return {
                        id: `${round.roundNumber}-${groupIndex + 1}-${
                          pairIndex + 1
                        }`,
                        pairNumber: pairIndex + 1,
                        player1_id: pair.player1Id
                          ? Number(pair.player1Id)
                          : null,
                        player2_id: pair.player2Id
                          ? Number(pair.player2Id)
                          : null,
                        player1: player1?.name ?? "",
                        player2: player2?.name ?? "",
                        calculatedHandicap,
                        finalHandicap,
                      };
                    })
                  : [],
            };
          }
        );

        return {
          id: round.roundNumber,
          roundNumber: round.roundNumber,
          day: `Round ${round.roundNumber}`,
          courseId: round.courseId,
          courseName: course?.name,
          course: course?.shortName ?? course?.name,
          format: round.format === "scramble" ? "scramblePairs" : "stableford",
          par: course?.par,
          yards: course?.yards,
          holes: course?.holes ?? [],
          groups,
          bonusHoles: [
            ...round.longestDriveHoles.map((hole) => ({
              hole,
              type: "Longest Drive",
              points: round.longestDrivePoints,
            })),
            ...round.nearestPinHoles.map((hole) => ({
              hole,
              type: "Nearest Pin",
              points: round.nearestPinPoints,
            })),
          ],
        };
      }),
    };
  }, [
    editingSlug,
    eventSlug,
    eventName,
    teamMode,
    teams,
    selectedPlayers,
    playerTeams,
    handicaps,
    rounds,
    players,
  ]);

  function togglePlayer(playerId: number) {
    setSelectedPlayerIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }

      return [...current, playerId];
    });
  }

  function updateHandicap(
    playerId: number,
    type: "stableford" | "scramble",
    value: string
  ) {
    setHandicaps((current) => ({
      ...current,
      [playerId]: {
        stableford: current[playerId]?.stableford ?? "",
        scramble: current[playerId]?.scramble ?? "",
        [type]: value === "" ? "" : Number(value),
      },
    }));
  }

  function updateRound(
    roundNumber: number,
    field: keyof RoundSetup,
    value: any
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

  function updateRoundGroupCount(roundNumber: number, groupCount: number) {
    setRounds((current) =>
      current.map((round) => {
        if (round.roundNumber !== roundNumber) return round;

        const teeTimes = [...round.teeTimes];
        const groups = round.groups.map((group) => [...group]);
        const pairs = round.pairs.map((groupPairs) =>
          groupPairs.map((pair) => ({ ...pair }))
        );

        while (teeTimes.length < groupCount) teeTimes.push("");
        while (groups.length < groupCount) groups.push(makeEmptyGroup());
        while (pairs.length < groupCount) pairs.push(makeEmptyPairs());

        return {
          ...round,
          groupCount,
          teeTimes: teeTimes.slice(0, groupCount),
          groups: groups.slice(0, groupCount),
          pairs: pairs.slice(0, groupCount),
        };
      })
    );
  }

  function updateTeeTime(
    roundNumber: number,
    groupIndex: number,
    value: string
  ) {
    setRounds((current) =>
      current.map((round) => {
        if (round.roundNumber !== roundNumber) return round;

        const teeTimes = [...round.teeTimes];
        teeTimes[groupIndex] = value;

        return {
          ...round,
          teeTimes,
        };
      })
    );
  }

  function updateGroupPlayer(
    roundNumber: number,
    groupIndex: number,
    slotIndex: number,
    playerId: string
  ) {
    setRounds((current) =>
      current.map((round) => {
        if (round.roundNumber !== roundNumber) return round;

        const groups = round.groups.map((group) => [...group]);
        groups[groupIndex][slotIndex] = playerId;

        return {
          ...round,
          groups,
        };
      })
    );
  }

  function updatePairPlayer(
    roundNumber: number,
    groupIndex: number,
    pairIndex: number,
    playerSlot: "player1Id" | "player2Id",
    playerId: string
  ) {
    setRounds((current) =>
      current.map((round) => {
        if (round.roundNumber !== roundNumber) return round;

        const pairs = round.pairs.map((groupPairs) =>
          groupPairs.map((pair) => ({ ...pair }))
        );

        pairs[groupIndex][pairIndex][playerSlot] = playerId;
        pairs[groupIndex][pairIndex].finalHandicap = "";

        return {
          ...round,
          pairs,
        };
      })
    );
  }

  function updatePairFinalHandicap(
    roundNumber: number,
    groupIndex: number,
    pairIndex: number,
    value: string
  ) {
    setRounds((current) =>
      current.map((round) => {
        if (round.roundNumber !== roundNumber) return round;

        const pairs = round.pairs.map((groupPairs) =>
          groupPairs.map((pair) => ({ ...pair }))
        );

        pairs[groupIndex][pairIndex].finalHandicap =
          value === "" ? "" : Number(value);

        return {
          ...round,
          pairs,
        };
      })
    );
  }

  function toggleBonusHole(
    roundNumber: number,
    field: "longestDriveHoles" | "nearestPinHoles",
    hole: number
  ) {
    setRounds((current) =>
      current.map((round) => {
        if (round.roundNumber !== roundNumber) return round;

        const currentHoles = round[field];
        const updatedHoles = currentHoles.includes(hole)
          ? currentHoles.filter((item) => item !== hole)
          : [...currentHoles, hole].sort((a, b) => a - b);

        return {
          ...round,
          [field]: updatedHoles,
        };
      })
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
  slug: tournamentPreview.slug,
  name: tournamentPreview.name,
  rounds: tournamentPreview.rounds,
  players: tournamentPreview.players,
  team_mode: tournamentPreview.teamMode,
  teams: tournamentPreview.teams,
});

      setEditingSlug(tournamentPreview.slug);
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
    setTeamMode(tournament.team_mode ?? tournament.teamMode ?? "none");
    setTeams(tournament.teams?.length ? tournament.teams : ["Team 1", "Team 2"]);

    const loadedPlayers = tournament.players ?? [];
    setSelectedPlayerIds(loadedPlayers.map((player: any) => player.id));

    const loadedTeams: Record<number, string> = {};
    const loadedHandicaps: Record<number, PlayerHandicaps> = {};

    loadedPlayers.forEach((player: any) => {
      loadedTeams[player.id] = player.eventTeam ?? "";
      loadedHandicaps[player.id] = {
        stableford: player.stablefordHandicap ?? player.eventHandicap ?? "",
        scramble: player.scrambleHandicap ?? "",
      };
    });

    setPlayerTeams(loadedTeams);
    setHandicaps((current) => ({
      ...current,
      ...loadedHandicaps,
    }));

    const loadedRounds = tournament.rounds ?? [];

    setRoundCount(loadedRounds.length === 2 ? 2 : 1);

    setRounds(
      loadedRounds.map((round: any, index: number) => {
        const groupCount = round.groups?.length || 1;

        return {
          roundNumber: round.roundNumber ?? round.id ?? index + 1,
          courseId: round.courseId,
          format:
            round.format === "scramblePairs" || round.format === "scramble"
              ? "scramble"
              : "stableford",
          groupCount,
          teeTimes: round.groups?.map((group: any) => group.teeTime ?? "") ?? [
            "",
          ],
          groups:
            round.groups?.map((group: any) => {
              const playerIds =
                group.players?.map((player: any) =>
                  String(player.player_id ?? player.id)
                ) ?? [];

              return [...playerIds, "", "", "", ""].slice(0, 4);
            }) ?? [makeEmptyGroup()],
          pairs:
            round.groups?.map((group: any) => {
              if (!group.pairs?.length) return makeEmptyPairs();

              return group.pairs.map((pair: any) => ({
                player1Id: pair.player1_id ? String(pair.player1_id) : "",
                player2Id: pair.player2_id ? String(pair.player2_id) : "",
                finalHandicap:
  pair.finalHandicap === "" || pair.finalHandicap == null
    ? ""
    : Number(pair.finalHandicap),
              }));
            }) ?? [makeEmptyPairs()],
          longestDrivePoints:
            round.bonusHoles?.find((bonus: any) => bonus.type === "Longest Drive")
              ?.points ?? 2,
          nearestPinPoints:
            round.bonusHoles?.find((bonus: any) => bonus.type === "Nearest Pin")
              ?.points ?? 2,
          longestDriveHoles:
            round.bonusHoles
              ?.filter((bonus: any) => bonus.type === "Longest Drive")
              .map((bonus: any) => bonus.hole) ?? [],
          nearestPinHoles:
            round.bonusHoles
              ?.filter((bonus: any) => bonus.type === "Nearest Pin")
              .map((bonus: any) => bonus.hole) ?? [],
        };
      })
    );

    setSaveMessage(`Loaded ${tournament.name} for editing.`);
  }

  async function handleSetActive(tournament: any) {
  await setActiveTournamentV2(tournament.slug);
  loadTournamentIntoEditor(tournament);
  setSaveMessage("✅ Active tournament updated and loaded.");
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
      <div className="mx-auto max-w-4xl space-y-5">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            Swift Tees
          </p>
          <h1 className="text-3xl font-black">Tournament Setup V2</h1>
          <p className="mt-2 text-sm text-slate-300">
            Reusable tournament builder with players, teams, handicaps, groups,
            scramble pairs and bonus holes.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="text-sm font-bold text-slate-200">Event name</label>
          <input
            value={eventName}
            onChange={(event) => {
              setEventName(event.target.value);
              if (!editingSlug) setSaveMessage("");
            }}
            placeholder="e.g. Carden Park 2026"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <div className="mt-3 rounded-xl bg-slate-900 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Event slug
            </p>
            <p className="font-mono text-sm text-emerald-300">
              {editingSlug || eventSlug || "event-slug"}
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
                <h3 className="font-black">Assign Players to Teams</h3>

                {selectedPlayers.map((player) => (
                  <div key={player.id} className="rounded-xl bg-slate-900 p-3">
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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-black">Tournament Handicaps</h2>
          <p className="mt-1 text-sm text-slate-400">
            Stableford handicap is used for individual scoring. Scramble handicap
            is used for pair calculations.
          </p>

          <div className="mt-4 grid gap-3">
            {selectedPlayers.map((player) => (
              <div key={player.id} className="rounded-xl bg-slate-900 p-3">
                <p className="font-black">{player.name}</p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      Stableford HCP
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={handicaps[player.id]?.stableford ?? ""}
                      onChange={(event) =>
                        updateHandicap(
                          player.id,
                          "stableford",
                          event.target.value
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 font-black text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      Scramble HCP
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={handicaps[player.id]?.scramble ?? ""}
                      onChange={(event) =>
                        updateHandicap(
                          player.id,
                          "scramble",
                          event.target.value
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 font-black text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {rounds.map((round) => {
          const course = getCourseById(round.courseId);

          return (
            <section
              key={round.roundNumber}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h2 className="text-xl font-black">Round {round.roundNumber}</h2>

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
                      updateRound(
                        round.roundNumber,
                        "format",
                        event.target.value as RoundFormat
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  >
                    <option value="stableford">Stableford</option>
                    <option value="scramble">Scramble Pairs</option>
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

              <div className="mt-5 rounded-xl bg-slate-900 p-3">
                <h3 className="font-black">Groups</h3>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() =>
                        updateRoundGroupCount(round.roundNumber, count)
                      }
                      className={`rounded-xl border p-3 font-black ${
                        round.groupCount === count
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-white/10 bg-slate-950 text-white"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {Array.from({ length: round.groupCount }).map(
                    (_, groupIndex) => (
                      <div
                        key={groupIndex}
                        className="rounded-xl border border-white/10 bg-slate-950 p-3"
                      >
                        <h4 className="font-black">Group {groupIndex + 1}</h4>

                        <input
                          value={round.teeTimes[groupIndex] ?? ""}
                          onChange={(event) =>
                            updateTeeTime(
                              round.roundNumber,
                              groupIndex,
                              event.target.value
                            )
                          }
                          placeholder="Tee time"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
                        />

                        {round.format === "stableford" && (
                          <div className="mt-3 space-y-2">
                            {[0, 1, 2, 3].map((slotIndex) => (
                              <select
                                key={slotIndex}
                                value={
                                  round.groups[groupIndex]?.[slotIndex] ?? ""
                                }
                                onChange={(event) =>
                                  updateGroupPlayer(
                                    round.roundNumber,
                                    groupIndex,
                                    slotIndex,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
                              >
                                <option value="">Player {slotIndex + 1}</option>
                                {selectedPlayers.map((player) => (
                                  <option key={player.id} value={String(player.id)}>
                                    {player.name}
                                  </option>
                                ))}
                              </select>
                            ))}
                          </div>
                        )}

                        {round.format === "scramble" && (
                          <div className="mt-3 space-y-3">
                            {[0, 1].map((pairIndex) => {
                              const pair =
                                round.pairs[groupIndex]?.[pairIndex] ??
                                makeEmptyPairs()[pairIndex];

                              const calculatedHandicap = calculatePairHandicap(
                                pair.player1Id,
                                pair.player2Id
                              );

                              const finalHandicap = getFinalPairHandicap(pair);

                              return (
                                <div
                                  key={pairIndex}
                                  className="rounded-xl border border-white/10 bg-slate-900 p-3"
                                >
                                  <p className="text-sm font-black text-emerald-400">
                                    Pair {pairIndex + 1}
                                  </p>

                                  <div className="mt-2 space-y-2">
                                    <select
                                      value={pair.player1Id}
                                      onChange={(event) =>
                                        updatePairPlayer(
                                          round.roundNumber,
                                          groupIndex,
                                          pairIndex,
                                          "player1Id",
                                          event.target.value
                                        )
                                      }
                                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
                                    >
                                      <option value="">Player 1</option>
                                      {selectedPlayers.map((player) => (
                                        <option
                                          key={player.id}
                                          value={String(player.id)}
                                        >
                                          {player.name}
                                        </option>
                                      ))}
                                    </select>

                                    <select
                                      value={pair.player2Id}
                                      onChange={(event) =>
                                        updatePairPlayer(
                                          round.roundNumber,
                                          groupIndex,
                                          pairIndex,
                                          "player2Id",
                                          event.target.value
                                        )
                                      }
                                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
                                    >
                                      <option value="">Player 2</option>
                                      {selectedPlayers.map((player) => (
                                        <option
                                          key={player.id}
                                          value={String(player.id)}
                                        >
                                          {player.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="mt-3 rounded-xl bg-slate-950 p-3">
                                    <p className="text-xs font-bold text-slate-400">
                                      Calculated Scramble HCP
                                    </p>
                                    <p className="text-xl font-black">
                                      {calculatedHandicap === ""
                                        ? "-"
                                        : calculatedHandicap}
                                    </p>

                                    <label className="mt-3 block text-xs font-bold text-slate-400">
                                      Final Pair HCP
                                    </label>
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      value={finalHandicap}
                                      onChange={(event) =>
                                        updatePairFinalHandicap(
                                          round.roundNumber,
                                          groupIndex,
                                          pairIndex,
                                          event.target.value
                                        )
                                      }
                                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-black text-white"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-900 p-3">
                <h3 className="font-black">Bonus Holes</h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-black">💣 Longest Drive</p>
                      <input
                        type="number"
                        value={round.longestDrivePoints}
                        onChange={(event) =>
                          updateRound(
                            round.roundNumber,
                            "longestDrivePoints",
                            Number(event.target.value)
                          )
                        }
                        className="w-16 rounded-lg bg-slate-950 px-2 py-1 text-center font-black"
                      />
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {[...Array(18)].map((_, index) => {
                        const hole = index + 1;

                        return (
                          <button
                            key={hole}
                            type="button"
                            onClick={() =>
                              toggleBonusHole(
                                round.roundNumber,
                                "longestDriveHoles",
                                hole
                              )
                            }
                            className={`rounded-lg border p-2 text-xs font-black ${
                              round.longestDriveHoles.includes(hole)
                                ? "border-yellow-300 bg-yellow-300 text-slate-950"
                                : "border-white/10 bg-slate-950 text-white"
                            }`}
                          >
                            H{hole}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-black">🎯 Nearest Pin</p>
                      <input
                        type="number"
                        value={round.nearestPinPoints}
                        onChange={(event) =>
                          updateRound(
                            round.roundNumber,
                            "nearestPinPoints",
                            Number(event.target.value)
                          )
                        }
                        className="w-16 rounded-lg bg-slate-950 px-2 py-1 text-center font-black"
                      />
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {[...Array(18)].map((_, index) => {
                        const hole = index + 1;

                        return (
                          <button
                            key={hole}
                            type="button"
                            onClick={() =>
                              toggleBonusHole(
                                round.roundNumber,
                                "nearestPinHoles",
                                hole
                              )
                            }
                            className={`rounded-lg border p-2 text-xs font-black ${
                              round.nearestPinHoles.includes(hole)
                                ? "border-yellow-300 bg-yellow-300 text-slate-950"
                                : "border-white/10 bg-slate-950 text-white"
                            }`}
                          >
                            H{hole}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

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
            <h2 className="text-lg font-black">Saved Tournaments</h2>

            <button
              type="button"
              onClick={loadSavedTournaments}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-bold"
            >
              Refresh
            </button>
          </div>

          {isLoadingTournaments ? (
            <p className="mt-3 text-slate-400">Loading...</p>
          ) : (
            <div className="mt-4 space-y-2">
              {savedTournaments.map((tournament) => (
                <div key={tournament.id} className="rounded-xl bg-slate-900 p-3">
                  <p className="font-black">{tournament.name}</p>

                  {tournament.is_active && (
                    <p className="mt-1 text-xs font-black text-emerald-400">
                      ✅ Active Tournament
                    </p>
                  )}

                  <p className="text-xs text-slate-400">{tournament.slug}</p>

                  <p className="mt-1 text-xs text-slate-500">
                    {tournament.players?.length ?? 0} players •{" "}
                    {tournament.rounds?.length ?? 0} rounds
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadTournamentIntoEditor(tournament)}
                      className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-black text-slate-950"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetActive(tournament)}
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
          <h2 className="text-lg font-black text-emerald-300">
            Setup Preview
          </h2>
          <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
            {JSON.stringify(tournamentPreview, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}