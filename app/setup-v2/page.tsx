"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COURSES, getCourseById } from "../../lib/courses";
import { getPlayers } from "../../lib/players";
import {
  saveTournamentV2,
  getAllTournamentsV2,
  setActiveTournamentV2,
  deleteTournamentV2,
} from "../../lib/tournaments-v2";
import { resetEventScores } from "../../lib/scores";
type Player = {
  id: number;
  name: string;
  team?: string;
};

type RoundFormat = "stableford" | "scramble";

const TEAM_COLOURS = ["White", "Blue", "Green", "Red"] as const;

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
  date: string;
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
  date: "",
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
function formatRoundDate(dateValue: string) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
export default function SetupV2Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [eventName, setEventName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
const [showEditor, setShowEditor] = useState(false);
const [savedTournamentsOpen, setSavedTournamentsOpen] = useState(true);
const editorRef = useRef<HTMLDivElement | null>(null);
  const [roundCount, setRoundCount] = useState<1 | 2>(1);
  const [rounds, setRounds] = useState<RoundSetup[]>([
    makeRound(1, COURSES[0]?.id ?? ""),
  ]);

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [handicaps, setHandicaps] = useState<Record<number, PlayerHandicaps>>(
    {}
  );

  const [teamMode, setTeamMode] = useState<"none" | "teams">("none");
  const teams = [...TEAM_COLOURS];
  const [playerTeams, setPlayerTeams] = useState<Record<number, string>>({});

  const [savedTournaments, setSavedTournaments] = useState<any[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const [resettingSlug, setResettingSlug] = useState("");
const [saveMessage, setSaveMessage] = useState("");
const [useGroups, setUseGroups] = useState(false);
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

  function calculatePairHandicap(player1Id: string, player2Id: string) {
  const h1 = getStablefordHandicap(player1Id);
  const h2 = getStablefordHandicap(player2Id);

  if (!player1Id || !player2Id || h1 === "" || h2 === "") {
    return "";
  }

  return (
  Math.round(
    (((Number(h1) + Number(h2)) / 2) * 0.75) * 10
  ) / 10
);
}

function getFinalPairHandicap(pair: PairSetup) {
  const calculated = calculatePairHandicap(
    pair.player1Id,
    pair.player2Id
  );

  if (pair.finalHandicap !== "") {
    return pair.finalHandicap;
  }

  return calculated;
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
scrambleHandicap: handicaps[player.id]?.stableford || 0,
      })),
      rounds: rounds.map((round) => {
        const course = getCourseById(round.courseId);

        const buildPlayerObject = (playerId: string | number) => {
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
  handicaps[Number(playerId)]?.stableford === ""
    ? 0
    : handicaps[Number(playerId)]?.stableford ?? 0,
  };
};

const groups = useGroups
  ? Array.from({ length: round.groupCount }).map((_, groupIndex) => {
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
        players: groupPlayers.map(buildPlayerObject),
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
                  id: `${round.roundNumber}-${groupIndex + 1}-${pairIndex + 1}`,
                  pairNumber: pairIndex + 1,
                  player1_id: pair.player1Id ? Number(pair.player1Id) : null,
                  player2_id: pair.player2Id ? Number(pair.player2Id) : null,
                  player1: player1?.name ?? "",
                  player2: player2?.name ?? "",
                  calculatedHandicap,
                  finalHandicap,
                };
              })
            : [],
      };
    })
 : [
    {
      id: 1,
      groupNumber: 1,
      name: "All Players",
      teeTime: "",
      players: selectedPlayers.map((player) => buildPlayerObject(player.id)),
      pairs:
        round.format === "scramble"
          ? (round.pairs[0] ?? [])
              .filter((pair) => pair.player1Id || pair.player2Id)
              .map((pair, pairIndex) => {
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
                  id: `${round.roundNumber}-1-${pairIndex + 1}`,
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
    },
  ];

       
         return {
  id: round.roundNumber,
  roundNumber: round.roundNumber,
  day: `Round ${round.roundNumber}`,
  date: round.date,
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
useGroups,
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

function openEditor() {
  setShowEditor(true);
  setSavedTournamentsOpen(false);

  setTimeout(() => {
    editorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

function handleNewTournament() {
  setEditingSlug("");
  setEventName("");
  setRoundCount(1);
  setRounds([makeRound(1, COURSES[0]?.id ?? "")]);
  setSelectedPlayerIds([]);
  setPlayerTeams({});
  setTeamMode("none");

  setUseGroups(false);
  setSaveMessage("New tournament started.");
  openEditor();
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

await setActiveTournamentV2(tournamentPreview.slug);

setEditingSlug(tournamentPreview.slug);
setSaveMessage("✅ Tournament saved and set active.");
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
    
const savedRounds = tournament.rounds ?? [];
const hasRealGroups = savedRounds.some((round: any) =>
  round.groups?.some((group: any) => group.name !== "All Players")
);

setUseGroups(Boolean(tournament.useGroups ?? hasRealGroups));
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
  date: round.date ?? round.roundDate ?? round.round_date ?? "",
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

async function handleResetTournament(tournament: any) {
  const tournamentName = tournament.name ?? "this tournament";
  const tournamentSlug = tournament.slug;

  if (!tournamentSlug) {
    setSaveMessage("❌ Tournament slug could not be found.");
    return;
  }

  const confirmed = window.confirm(
    `Reset all scores for ${tournamentName}?\n\nThis will permanently delete:\n• Stableford scores\n• Scramble scores\n• Bonus-hole winners\n• Live scoring progress\n• Moments generated from these scores\n\nThe tournament setup itself will not be deleted.`
  );

  if (!confirmed) return;

  try {
    setResettingSlug(tournamentSlug);
    setSaveMessage("");

    await resetEventScores(tournamentSlug);

    /*
      Save a reset marker for the Live Centre.
      The Moments feed can listen for this marker and clear itself.
    */
    localStorage.setItem(
      `swift-tees-reset-${tournamentSlug}`,
      new Date().toISOString()
    );

    window.dispatchEvent(
      new CustomEvent("swift-tees-tournament-reset", {
        detail: {
          eventSlug: tournamentSlug,
        },
      })
    );

    setSaveMessage(
      `✅ ${tournamentName} scores, bonus winners, progress and commentary reset.`
    );
  } catch (error: any) {
    console.error("Could not reset tournament:", error);

    setSaveMessage(
      `❌ Could not reset ${tournamentName}. ${
        error?.message ?? "Please try again."
      }`
    );
  } finally {
    setResettingSlug("");
  }
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
  <main className="min-h-screen bg-slate-100 text-slate-900 p-4 pb-24">
      <div className="mx-auto max-w-4xl space-y-5">
        <section>
    

<h1 className="text-4xl font-black text-green-950">
  Tournament Builder
</h1>


          
        </section>
<button
  type="button"
  onClick={handleNewTournament}
  className="w-full rounded-2xl border border-green-400 bg-green-100 px-4 py-3 font-black text-green-950 shadow-sm hover:bg-green-200"
>
  + New Tournament
</button>


 <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
  <div className="flex items-center justify-between gap-3 p-4">
    <button
      type="button"
      onClick={() => setSavedTournamentsOpen((current) => !current)}
      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
    >
      <div>
        <h2 className="text-lg font-black text-green-950">
          Saved Tournaments
        </h2>

        <p className="mt-1 text-xs font-semibold text-slate-500">
          {savedTournaments.length} saved
          {!savedTournamentsOpen && showEditor ? " • Editing below" : ""}
        </p>
      </div>

      <span className="shrink-0 text-sm font-black text-green-700">
        {savedTournamentsOpen ? "Collapse ▲" : "Open ▼"}
      </span>
    </button>

    {savedTournamentsOpen && (
      <button
        type="button"
        onClick={loadSavedTournaments}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-green-950 hover:bg-green-50"
      >
        Refresh
      </button>
    )}
  </div>

  {savedTournamentsOpen && (
    <div className="border-t border-slate-200 p-4">

          {isLoadingTournaments ? (
            <p className="mt-3 text-slate-400">Loading...</p>
          ) : (
            <div className="mt-4 space-y-2">
              {savedTournaments.map((tournament) => (
                
<div
  key={tournament.id}
  className={`rounded-2xl border p-4 shadow-sm ${
    tournament.is_active
      ? "border-green-600 bg-green-100 shadow-md ring-2 ring-green-200"
      : "border-slate-200 bg-white"
  }`}
>
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-black text-green-950">
          {tournament.name}
        </h3>

        {tournament.is_active && (
          <span className="rounded-full bg-green-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
            Active
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-semibold text-slate-400">
        {tournament.slug}
      </p>
    </div>

    <div className="text-2xl">
      {tournament.is_active ? "🔥" : "⛳"}
    </div>
  </div>

  <div className="mt-2 space-y-1.5">
  <p className="text-xs font-semibold text-slate-600">
    👥 {tournament.players?.length ?? 0} players
    {" • "}
    ⛳ {tournament.rounds?.length ?? 0} rounds
    {" • "}
    {tournament.team_mode === "teams" ||
    tournament.teamMode === "teams"
      ? "Teams"
      : "Singles"}
  </p>

  <div className="flex flex-wrap gap-1.5">
    {(tournament.rounds ?? []).map((round: any, index: number) => {
      const course =
        round.courseName ??
        round.course ??
        round.courseId ??
        "Course";

      const format =
        round.format === "scramblePairs" ||
        round.format === "scramble"
          ? "Scramble"
          : "Stableford";

      return (
        <span
          key={round.id ?? round.roundNumber ?? index}
          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600"
        >
          {round.date ? `${formatRoundDate(round.date)} · ` : ""}
{course} · {format}
        </span>
      );
    })}
  </div>
</div>

<div className="mt-3 flex flex-wrap gap-2">
  


                    <button
                      type="button"
                      onClick={() => {
  loadTournamentIntoEditor(tournament);
  openEditor();
}}
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
  onClick={() => handleResetTournament(tournament)}
  disabled={resettingSlug === tournament.slug}
  className="rounded-lg border border-orange-300 bg-orange-100 px-3 py-2 text-sm font-black text-orange-900 disabled:cursor-not-allowed disabled:opacity-60"
>
  {resettingSlug === tournament.slug
    ? "Resetting..."
    : "Reset Scores"}
</button>

<button
  type="button"
  onClick={() => handleDeleteTournament(tournament.slug)}
  disabled={resettingSlug === tournament.slug}
  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-black text-white disabled:opacity-60"
>
  Delete
</button>
                  </div>
                </div>
              ))}
            </div>
                    )}
        </div>
      )}
    </section>

{showEditor && (
  <div ref={editorRef} className="scroll-mt-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  

  <h2 className="mt-1 text-2xl font-black text-green-950">
    Event Name
  </h2>



  <input
    value={eventName}
    onChange={(event) => {
      setEventName(event.target.value);
      if (!editingSlug) setSaveMessage("");
    }}
    placeholder="e.g. Carden Park 2026"
    className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-700"
  />

  
</section>

    

        <details className="group rounded-3xl border border-slate-200 bg-white shadow-sm">
  <summary className="cursor-pointer list-none px-4 py-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-green-950">
          Select Players
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {selectedPlayerIds.length} selected
        </p>
      </div>

      <span className="text-sm font-black text-green-700 group-open:hidden">
        Open
      </span>

      <span className="hidden text-sm font-black text-green-700 group-open:inline">
        Close
      </span>
    </div>
  </summary>

  <div className="border-t border-slate-200 p-4">
    <p className="text-sm text-slate-500">
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
                      : "border-slate-200 bg-white text-green-950"
                  }`}
                >
                  <p className="font-black">{player.name}</p>
                </button>
              );
            })}
          </div>

              <p className="mt-3 text-sm text-slate-500">
      Selected: {selectedPlayerIds.length}
    </p>
  </div>
</details>

      

<details className="group rounded-3xl border border-slate-200 bg-white shadow-sm">
  <summary className="cursor-pointer list-none px-4 py-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-green-950">
  Tournament Setup
</h2>

        <p className="mt-1 text-sm text-slate-500">
  {roundCount} round{roundCount === 1 ? "" : "s"}
  {" • "}
  {selectedPlayers.length} players
  {" • "}
  {teamMode === "teams" ? "Team event" : "Individual event"}
</p>
      </div>

      <span className="text-sm font-black text-green-700 group-open:hidden">
        Open
      </span>

      <span className="hidden text-sm font-black text-green-700 group-open:inline">
        Close
      </span>
    </div>
  </summary>

  <div className="border-t border-slate-200 p-4">
  <div>
    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
      Number of Rounds
    </p>

    <div className="mt-2 grid grid-cols-2 gap-2">
      {[1, 2].map((count) => (
        <button
          key={count}
          type="button"
          onClick={() => setRoundCount(count as 1 | 2)}
          className={`rounded-xl border px-3 py-3 text-sm font-black ${
            roundCount === count
              ? "border-emerald-500 bg-emerald-500 text-slate-950"
              : "border-slate-200 bg-white text-green-950"
          }`}
        >
          {count} Round{count === 2 ? "s" : ""}
        </button>
      ))}
    </div>
  </div>

  <div className="mt-5 border-t border-slate-200 pt-4">
    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
      Event Type
    </p>

    <div className="mt-2 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => setTeamMode("none")}
        className={`rounded-xl border px-3 py-3 text-sm font-black ${
          teamMode === "none"
            ? "border-emerald-500 bg-emerald-500 text-slate-950"
            : "border-slate-200 bg-white text-green-950"
        }`}
      >
        👤 Individual
      </button>

      <button
        type="button"
        onClick={() => setTeamMode("teams")}
        className={`rounded-xl border px-3 py-3 text-sm font-black ${
          teamMode === "teams"
            ? "border-emerald-500 bg-emerald-500 text-slate-950"
            : "border-slate-200 bg-white text-green-950"
        }`}
      >
        👥 Teams
      </button>
       </div>
  </div>

  <div className="mt-5 border-t border-slate-200 pt-4">
    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
      Playing Structure
    </p>

    <div className="mt-2 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => setUseGroups(false)}
        className={`rounded-xl border px-3 py-3 text-sm font-black ${
          !useGroups
            ? "border-emerald-500 bg-emerald-500 text-slate-950"
            : "border-slate-200 bg-white text-green-950"
        }`}
      >
        👥 Single Tee Time
      </button>

      <button
        type="button"
        onClick={() => setUseGroups(true)}
        className={`rounded-xl border px-3 py-3 text-sm font-black ${
          useGroups
            ? "border-emerald-500 bg-emerald-500 text-slate-950"
            : "border-slate-200 bg-white text-green-950"
        }`}
      >
        ⛳ Multiple Tee Times
      </button>
    </div>
  </div>

  <div className="mt-5 border-t border-slate-200 pt-4">
    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
      Player Handicaps
    </p>

    <p className="mt-1 text-sm text-slate-500">
      Enter each player&apos;s tournament handicap
      {teamMode === "teams" ? " and assign their team." : "."}
    </p>
  </div>

    {selectedPlayers.length > 0 && (
      <div
        className={`mt-4 grid gap-2 px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 ${
          teamMode === "teams"
            ? "grid-cols-[minmax(0,1fr)_64px_105px]"
            : "grid-cols-[minmax(0,1fr)_70px]"
        }`}
      >
        <span>Player</span>

        <span className="text-center">HCP</span>

        {teamMode === "teams" && (
          <span className="text-center">Team</span>
        )}
      </div>
    )}

    <div className="mt-2 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      {selectedPlayers.map((player) => (
        <div
          key={player.id}
          className={`grid items-center gap-2 px-3 py-2 ${
            teamMode === "teams"
              ? "grid-cols-[minmax(0,1fr)_64px_105px]"
              : "grid-cols-[minmax(0,1fr)_70px]"
          }`}
        >
          <p className="truncate text-sm font-black text-green-950">
            {player.name}
          </p>

          <input
            type="number"
            inputMode="decimal"
            aria-label={`${player.name} tournament handicap`}
            value={handicaps[player.id]?.stableford ?? ""}
            onChange={(event) =>
              updateHandicap(
                player.id,
                "stableford",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-1 py-2 text-center text-sm font-black text-slate-900"
          />

          {teamMode === "teams" && (
            <select
              value={playerTeams[player.id] ?? ""}
              onChange={(event) =>
                setPlayerTeams((current) => ({
                  ...current,
                  [player.id]: event.target.value,
                }))
              }
              aria-label={`${player.name} team`}
              className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-1.5 py-2 text-xs font-bold text-green-950"
            >
              <option value="">No team</option>

              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  </div>
</details>




        {rounds.map((round) => {
          const course = getCourseById(round.courseId);

          return (
            <details
  key={round.roundNumber}
  className="group rounded-3xl border border-slate-200 bg-white shadow-sm"
>
  <summary className="cursor-pointer list-none px-5 py-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-black text-green-950">
          Round {round.roundNumber}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
  {round.date && (
    <>
      {formatRoundDate(round.date)}
      {" • "}
    </>
  )}

  {course?.shortName ?? course?.name ?? "Choose course"}
  {" • "}
  {round.format === "scramble"
    ? "Scramble Pairs"
    : "Stableford"}
</p>
      </div>

      <span className="text-sm font-black text-green-700 group-open:hidden">
        Open
      </span>

      <span className="hidden text-sm font-black text-green-700 group-open:inline">
        Close
      </span>
    </div>
  </summary>

  <div className="border-t border-slate-200 p-5">
    <div className="grid gap-3 sm:grid-cols-3">
  <div>
    <label className="text-sm font-bold text-slate-600">
      Round Date
    </label>

    <input
      type="date"
      value={round.date}
      onChange={(event) =>
        updateRound(
          round.roundNumber,
          "date",
          event.target.value
        )
      }
      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-green-950"
    />
  </div>

  <div>
    <label className="text-sm font-bold text-slate-600">
      Course
    </label>
                  <select
                    value={round.courseId}
                    onChange={(event) =>
                      updateRound(round.roundNumber, "courseId", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-green-950"
                  >
                    {COURSES.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600">
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
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-green-950"
                  >
                    <option value="stableford">Stableford</option>
                    <option value="scramble">Scramble Pairs</option>
                  </select>
                </div>
              </div>

              {course && (
                <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm font-black text-green-950">
                    {course.shortName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {course.club} • Par {course.par} • {course.yards} yards
                  </p>
                </div>
              )}

              {useGroups && (
  <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <h3 className="font-black">No. of Tee Times </h3>

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
                          : "border-slate-200 bg-slate-50 text-green-950"
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
  className={`rounded-2xl border-2 p-3 ${
    groupIndex % 4 === 0
      ? "border-blue-200 bg-blue-50"
      : groupIndex % 4 === 1
      ? "border-green-200 bg-green-50"
      : groupIndex % 4 === 2
      ? "border-amber-200 bg-amber-50"
      : "border-red-200 bg-red-50"
  }`}
>
                       <div className="flex items-center justify-between gap-2">
  <h4 className="font-black text-green-950">
    Group {groupIndex + 1}
  </h4>

  <span
    className={`h-3 w-3 rounded-full ${
      groupIndex % 4 === 0
        ? "bg-blue-500"
        : groupIndex % 4 === 1
        ? "bg-green-500"
        : groupIndex % 4 === 2
        ? "bg-amber-500"
        : "bg-red-500"
    }`}
  />
</div>

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
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
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
                                  className="rounded-xl border border-white/10 bg-slate-50 border border-slate-200 p-3"
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
                                      className="w-full rounded-xl border border-white/10 bg-white px-3 py-2 text-slate-900"
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
                                      className="w-full rounded-xl border border-white/10 bg-white px-3 py-2 text-slate-900"
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

                                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                                    <p className="text-xs font-bold text-slate-500">
  Calculated Scramble HCP
</p>

<p className="mt-1 text-sm font-black text-green-950">
  {calculatedHandicap === ""
    ? "Select both players"
    : `((${getStablefordHandicap(pair.player1Id)} + ${getStablefordHandicap(
        pair.player2Id
      )}) ÷ 2) × 0.75 = ${calculatedHandicap}`}
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
                                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-black text-slate-900"
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
)}
{!useGroups && round.format === "scramble" && (
  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <h3 className="font-black text-green-950">Scramble Pairs</h3>

    <p className="mt-1 text-sm text-slate-500">
      Select the two players in each scramble pair.
    </p>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {[0, 1].map((pairIndex) => {
        const pair =
          round.pairs[0]?.[pairIndex] ?? makeEmptyPairs()[pairIndex];

        const calculatedHandicap = calculatePairHandicap(
          pair.player1Id,
          pair.player2Id
        );

        const finalHandicap = getFinalPairHandicap(pair);

        return (
          <div
            key={pairIndex}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="font-black text-green-950">
              Pair {pairIndex + 1}
            </p>

            <div className="mt-3 space-y-2">
              <select
                value={pair.player1Id}
                onChange={(event) =>
                  updatePairPlayer(
                    round.roundNumber,
                    0,
                    pairIndex,
                    "player1Id",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              >
                <option value="">Player 1</option>

                {selectedPlayers.map((player) => (
                  <option key={player.id} value={String(player.id)}>
                    {player.name}
                  </option>
                ))}
              </select>

              <select
                value={pair.player2Id}
                onChange={(event) =>
                  updatePairPlayer(
                    round.roundNumber,
                    0,
                    pairIndex,
                    "player2Id",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              >
                <option value="">Player 2</option>

                {selectedPlayers.map((player) => (
                  <option key={player.id} value={String(player.id)}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">
  Calculated Scramble HCP (75%)
</p>

<p className="mt-1 text-sm font-black text-green-950">
  {calculatedHandicap === ""
    ? "Select both players"
    : `((${getStablefordHandicap(pair.player1Id)} + ${getStablefordHandicap(
    pair.player2Id
  )}) ÷ 2) × 0.75 = ${calculatedHandicap}`}
</p>

              <label className="mt-3 block text-xs font-bold text-slate-500">
                Final Pair HCP
              </label>

              <input
                type="number"
                inputMode="numeric"
                value={finalHandicap}
                onChange={(event) =>
                  updatePairFinalHandicap(
                    round.roundNumber,
                    0,
                    pairIndex,
                    event.target.value
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-black text-slate-900"
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
              <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-3">
                <h3 className="font-black">Bonus Holes</h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center font-black text-slate-900"
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
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-slate-200 bg-slate-50 text-green-950"
                            }`}
                          >
                            H{hole}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                 <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center font-black text-slate-900"
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
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-slate-200 bg-slate-50 text-green-950"
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
            </div>
          </details>
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

          <a
  href="/live-scoring-v2"
  className="mt-3 flex w-full items-center justify-center rounded-xl border border-green-700 bg-white px-4 py-4 font-black text-green-950"
>
  ⛳ Go to Scorecards
</a>
</section>
    </div>
)} 
      </div>
    </main>
  );
}