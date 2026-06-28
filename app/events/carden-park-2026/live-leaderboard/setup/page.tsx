"use client";

import { useEffect, useState } from "react";

const players = [
  "Gav",
  "Wrighty",
  "Carl",
  "Adam",
  "Dan",
  "Liam",
  "Stu",
  "Phil",
  "Painy",
  "Paul",
  "Ian",
  "Taz",
];

const rounds = [
  {
    round: 1,
    day: "Day 1",
    defaultCourse: "Cheshire Course",
    defaultTeeTimes: ["13:10", "13:20", "13:30"],
  },
  {
    round: 2,
    day: "Day 2",
    defaultCourse: "Nicklaus Course",
    defaultTeeTimes: ["12:25", "12:35", "12:45"],
  },
];

const courseHoles: Record<string, any[]> = {
  "Cheshire Course": [
    { hole: 1, yards: 170, par: 3, strokeIndex: 17 },
    { hole: 2, yards: 568, par: 5, strokeIndex: 7 },
    { hole: 3, yards: 379, par: 4, strokeIndex: 9 },
    { hole: 4, yards: 371, par: 4, strokeIndex: 15 },
    { hole: 5, yards: 413, par: 4, strokeIndex: 3 },
    { hole: 6, yards: 545, par: 5, strokeIndex: 5 },
    { hole: 7, yards: 434, par: 4, strokeIndex: 13 },
    { hole: 8, yards: 231, par: 3, strokeIndex: 11 },
    { hole: 9, yards: 476, par: 4, strokeIndex: 1 },
    { hole: 10, yards: 356, par: 4, strokeIndex: 16 },
    { hole: 11, yards: 581, par: 5, strokeIndex: 6 },
    { hole: 12, yards: 374, par: 4, strokeIndex: 4 },
    { hole: 13, yards: 360, par: 4, strokeIndex: 8 },
    { hole: 14, yards: 467, par: 5, strokeIndex: 10 },
    { hole: 15, yards: 145, par: 3, strokeIndex: 18 },
    { hole: 16, yards: 402, par: 4, strokeIndex: 2 },
    { hole: 17, yards: 201, par: 3, strokeIndex: 12 },
    { hole: 18, yards: 351, par: 4, strokeIndex: 14 },
  ],
  "Nicklaus Course": [
    { hole: 1, yards: 445, par: 4, strokeIndex: 8 },
    { hole: 2, yards: 363, par: 4, strokeIndex: 18 },
    { hole: 3, yards: 201, par: 3, strokeIndex: 16 },
    { hole: 4, yards: 546, par: 5, strokeIndex: 6 },
    { hole: 5, yards: 446, par: 4, strokeIndex: 10 },
    { hole: 6, yards: 373, par: 4, strokeIndex: 12 },
    { hole: 7, yards: 423, par: 4, strokeIndex: 2 },
    { hole: 8, yards: 174, par: 3, strokeIndex: 14 },
    { hole: 9, yards: 568, par: 5, strokeIndex: 4 },
    { hole: 10, yards: 424, par: 4, strokeIndex: 3 },
    { hole: 11, yards: 454, par: 4, strokeIndex: 5 },
    { hole: 12, yards: 230, par: 3, strokeIndex: 13 },
    { hole: 13, yards: 574, par: 5, strokeIndex: 7 },
    { hole: 14, yards: 355, par: 4, strokeIndex: 15 },
    { hole: 15, yards: 425, par: 4, strokeIndex: 1 },
    { hole: 16, yards: 159, par: 3, strokeIndex: 17 },
    { hole: 17, yards: 378, par: 4, strokeIndex: 11 },
    { hole: 18, yards: 507, par: 5, strokeIndex: 9 },
  ],
};

const playerTeams: Record<string, string> = {
  Gav: "White",
  Wrighty: "White",
  Carl: "White",
  Adam: "White",
  Dan: "Blue",
  Liam: "Blue",
  Stu: "Blue",
  Phil: "Blue",
  Painy: "Green",
  Paul: "Green",
  Ian: "Green",
  Taz: "Green",
};

type RoundFormat = "stableford" | "scramblePairs";

type PairSetup = {
  player1: string;
  player2: string;
  finalHandicap: number | "";
};

type RoundSetup = {
  course: string;
  format: RoundFormat;
  teeTimes: string[];
  groups: string[][];
  pairs: PairSetup[][];
  longestDrivePoints: number;
  nearestPinPoints: number;
  longestDriveHoles: number[];
  nearestPinHoles: number[];
};

type SetupState = {
  handicaps: Record<string, number | "">;
  rounds: Record<number, RoundSetup>;
};

function makeInitialSetup(): SetupState {
  return {
    handicaps: Object.fromEntries(players.map((player) => [player, ""])),
    rounds: Object.fromEntries(
      rounds.map((round) => [
        round.round,
        {
          course: round.defaultCourse,
          format: "stableford",
          teeTimes: round.defaultTeeTimes,
          groups: [
            ["", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
          ],
          pairs: [
            [
              { player1: "", player2: "", finalHandicap: "" },
              { player1: "", player2: "", finalHandicap: "" },
            ],
            [
              { player1: "", player2: "", finalHandicap: "" },
              { player1: "", player2: "", finalHandicap: "" },
            ],
            [
              { player1: "", player2: "", finalHandicap: "" },
              { player1: "", player2: "", finalHandicap: "" },
            ],
          ],
          longestDrivePoints: 2,
          nearestPinPoints: 2,
          longestDriveHoles: [],
          nearestPinHoles: [],
        },
      ])
    ),
  };
}

function normaliseSetup(savedSetup: SetupState): SetupState {
  const initial = makeInitialSetup();

  return {
    ...initial,
    ...savedSetup,
    rounds: Object.fromEntries(
      rounds.map((round) => {
        const savedRound = savedSetup.rounds?.[round.round];
        const initialRound = initial.rounds[round.round];

        return [
          round.round,
          {
            ...initialRound,
            ...savedRound,
            format: savedRound?.format || "stableford",
            pairs: savedRound?.pairs || initialRound.pairs,
          },
        ];
      })
    ),
  };
}

export default function TournamentSetupPage() {
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState("handicaps");
  const [setup, setSetup] = useState<SetupState>(makeInitialSetup());

  useEffect(() => {
    const savedSetup = localStorage.getItem("swiftTeesRawSetup");

    if (savedSetup) {
      setSetup(normaliseSetup(JSON.parse(savedSetup)));
      setSaved(true);
    }
  }, []);

  function getHandicap(player: string) {
    return setup.handicaps[player];
  }

  function calculatePairHandicap(player1: string, player2: string) {
    const handicap1 = getHandicap(player1);
    const handicap2 = getHandicap(player2);

    if (handicap1 === "" || handicap2 === "" || !player1 || !player2) {
      return "";
    }

    return Math.round(((Number(handicap1) + Number(handicap2)) / 2) * 10) / 10;
  }

  function getFinalPairHandicap(pair: PairSetup) {
    const calculated = calculatePairHandicap(pair.player1, pair.player2);

    if (pair.finalHandicap !== "") return pair.finalHandicap;
    if (calculated !== "") return calculated;

    return "";
  }

  function saveSetup() {
    const tournamentSetup = {
      eventName: "Carden Park 2026",

      rounds: rounds.map((round) => {
        const roundSetup = setup.rounds[round.round];

        return {
          id: round.round,
          day: round.day,
          course: roundSetup.course,
          tee: "",
          format: roundSetup.format,
          groups: roundSetup.groups.map((group, groupIndex) => {
            const scramblePlayers = roundSetup.pairs[groupIndex]
              .flatMap((pair) => [pair.player1, pair.player2])
              .filter((player) => player !== "");

            const groupPlayers =
              roundSetup.format === "scramblePairs" ? scramblePlayers : group;

            return {
              id: groupIndex + 1,
              name: `Group ${groupIndex + 1}`,
              teeTime: roundSetup.teeTimes[groupIndex],
              players: groupPlayers
                .filter((player) => player !== "")
                .map((player) => ({
                  name: player,
                  team: playerTeams[player] || "",
                  eventHandicap:
                    setup.handicaps[player] === "" ? 0 : setup.handicaps[player],
                })),
              pairs:
                roundSetup.format === "scramblePairs"
                  ? roundSetup.pairs[groupIndex].map((pair, pairIndex) => {
                      const calculatedHandicap = calculatePairHandicap(
                        pair.player1,
                        pair.player2
                      );

                      const finalHandicap =
                        pair.finalHandicap !== ""
                          ? pair.finalHandicap
                          : calculatedHandicap !== ""
                          ? calculatedHandicap
                          : 0;

                      return {
                        id: `${round.round}-${groupIndex + 1}-${pairIndex + 1}`,
                        pairNumber: pairIndex + 1,
                        player1: pair.player1,
                        player2: pair.player2,
                        calculatedHandicap,
                        finalHandicap,
                      };
                    })
                  : [],
            };
          }),
          bonusHoles: [
            ...roundSetup.longestDriveHoles.map((hole) => ({
              hole,
              type: "Longest Drive",
              points: roundSetup.longestDrivePoints,
            })),
            ...roundSetup.nearestPinHoles.map((hole) => ({
              hole,
              type: "Nearest Pin",
              points: roundSetup.nearestPinPoints,
            })),
          ],
          holes: courseHoles[roundSetup.course],
        };
      }),
    };

    localStorage.setItem("swiftTeesRawSetup", JSON.stringify(setup));

    localStorage.setItem(
      "swiftTeesTournamentSetup",
      JSON.stringify(tournamentSetup)
    );

    setSaved(true);
  }

  function toggleSection(section: string) {
    setOpenSection(openSection === section ? "" : section);
  }

  function updateHandicap(player: string, value: number | "") {
    setSaved(false);

    setSetup((current) => ({
      ...current,
      handicaps: {
        ...current.handicaps,
        [player]: value,
      },
    }));
  }

  function updateRoundCourse(roundNumber: number, course: string) {
    setSaved(false);

    setSetup((current) => ({
      ...current,
      rounds: {
        ...current.rounds,
        [roundNumber]: {
          ...current.rounds[roundNumber],
          course,
        },
      },
    }));
  }

  function updateRoundFormat(roundNumber: number, format: RoundFormat) {
    setSaved(false);

    setSetup((current) => ({
      ...current,
      rounds: {
        ...current.rounds,
        [roundNumber]: {
          ...current.rounds[roundNumber],
          format,
        },
      },
    }));
  }

  function updateTeeTime(roundNumber: number, groupIndex: number, value: string) {
    setSaved(false);

    setSetup((current) => {
      const roundSetup = current.rounds[roundNumber];
      const teeTimes = [...roundSetup.teeTimes];
      teeTimes[groupIndex] = value;

      return {
        ...current,
        rounds: {
          ...current.rounds,
          [roundNumber]: {
            ...roundSetup,
            teeTimes,
          },
        },
      };
    });
  }

  function updateGroupPlayer(
    roundNumber: number,
    groupIndex: number,
    slotIndex: number,
    player: string
  ) {
    setSaved(false);

    setSetup((current) => {
      const roundSetup = current.rounds[roundNumber];
      const groups = roundSetup.groups.map((group) => [...group]);
      groups[groupIndex][slotIndex] = player;

      return {
        ...current,
        rounds: {
          ...current.rounds,
          [roundNumber]: {
            ...roundSetup,
            groups,
          },
        },
      };
    });
  }

  function updatePairPlayer(
    roundNumber: number,
    groupIndex: number,
    pairIndex: number,
    playerSlot: "player1" | "player2",
    player: string
  ) {
    setSaved(false);

    setSetup((current) => {
      const roundSetup = current.rounds[roundNumber];
      const pairs = roundSetup.pairs.map((groupPairs) =>
        groupPairs.map((pair) => ({ ...pair }))
      );

      pairs[groupIndex][pairIndex][playerSlot] = player;
      pairs[groupIndex][pairIndex].finalHandicap = "";

      return {
        ...current,
        rounds: {
          ...current.rounds,
          [roundNumber]: {
            ...roundSetup,
            pairs,
          },
        },
      };
    });
  }

  function updatePairFinalHandicap(
    roundNumber: number,
    groupIndex: number,
    pairIndex: number,
    value: string
  ) {
    setSaved(false);

    setSetup((current) => {
      const roundSetup = current.rounds[roundNumber];
      const pairs = roundSetup.pairs.map((groupPairs) =>
        groupPairs.map((pair) => ({ ...pair }))
      );

      pairs[groupIndex][pairIndex].finalHandicap =
        value === "" ? "" : Number(value);

      return {
        ...current,
        rounds: {
          ...current.rounds,
          [roundNumber]: {
            ...roundSetup,
            pairs,
          },
        },
      };
    });
  }

  function updateBonusPoints(
    roundNumber: number,
    type: "longestDrivePoints" | "nearestPinPoints",
    value: string
  ) {
    setSaved(false);

    setSetup((current) => ({
      ...current,
      rounds: {
        ...current.rounds,
        [roundNumber]: {
          ...current.rounds[roundNumber],
          [type]: Number(value),
        },
      },
    }));
  }

  function toggleBonusHole(
    roundNumber: number,
    type: "longestDriveHoles" | "nearestPinHoles",
    hole: number
  ) {
    setSaved(false);

    setSetup((current) => {
      const roundSetup = current.rounds[roundNumber];
      const currentHoles = roundSetup[type];
      const updatedHoles = currentHoles.includes(hole)
        ? currentHoles.filter((item) => item !== hole)
        : [...currentHoles, hole].sort((a, b) => a - b);

      return {
        ...current,
        rounds: {
          ...current.rounds,
          [roundNumber]: {
            ...roundSetup,
            [type]: updatedHoles,
          },
        },
      };
    });
  }

  function handicapComplete() {
    return Object.values(setup.handicaps).every((value) => value !== "");
  }

  function roundComplete(roundNumber: number) {
    const roundSetup = setup.rounds[roundNumber];

    if (!roundSetup.course) return false;

    if (roundSetup.format === "stableford") {
      return roundSetup.groups.every((group) =>
        group.every((player) => player !== "")
      );
    }

    return roundSetup.pairs.every((groupPairs) =>
      groupPairs.every((pair) => pair.player1 !== "" && pair.player2 !== "")
    );
  }

  function roundSummary(roundNumber: number) {
    const roundSetup = setup.rounds[roundNumber];

    const formatLabel =
      roundSetup.format === "scramblePairs"
        ? "Scramble Pairs"
        : "Stableford";

    const groupCount =
      roundSetup.format === "stableford"
        ? roundSetup.groups.filter((group) =>
            group.every((player) => player !== "")
          ).length
        : roundSetup.pairs.filter((groupPairs) =>
            groupPairs.every((pair) => pair.player1 !== "" && pair.player2 !== "")
          ).length;

    const ld =
      roundSetup.longestDriveHoles.length > 0
        ? `LD: H${roundSetup.longestDriveHoles.join("/H")}`
        : "LD: none";

    const np =
      roundSetup.nearestPinHoles.length > 0
        ? `NP: H${roundSetup.nearestPinHoles.join("/H")}`
        : "NP: none";

    return `${roundSetup.course} • ${formatLabel} • ${groupCount}/3 groups complete • ${ld} • ${np}`;
  }

  function SectionHeader({
    id,
    title,
    subtitle,
    summary,
    complete,
  }: {
    id: string;
    title: string;
    subtitle: string;
    summary: string;
    complete: boolean;
  }) {
    const isOpen = openSection === id;

    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <div>
          <p
            className={`text-xs font-black mb-1 ${
              complete ? "text-green-700" : "text-amber-600"
            }`}
          >
            {complete ? "✅ Complete" : "⚠️ Needs update"}
          </p>

          <h2 className="text-2xl md:text-3xl font-black text-green-950">
            {title}
          </h2>

          <p className="text-sm text-slate-500 font-semibold mt-1">
            {subtitle}
          </p>

          <p className="text-xs text-slate-400 font-bold mt-1">{summary}</p>
        </div>

        <span className="text-2xl font-black text-green-950">
          {isOpen ? "−" : "+"}
        </span>
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-3 md:p-8">
      <div className="max-w-6xl mx-auto">
        <a
          href="/events/carden-park-2026/live-leaderboard"
          className="text-green-700 text-sm font-bold"
        >
          ← Back to Live Leaderboard
        </a>

        <div className="mt-4 mb-5">
          <p className="text-green-700 font-bold text-sm">Carden Park 2026</p>

          <h1 className="text-3xl md:text-6xl font-black text-green-950">
            Tournament Setup
          </h1>

          <p className="text-slate-600 mt-1 text-sm md:text-base">
            Set handicaps, rounds, groups and bonus holes before live scoring
            starts.
          </p>
        </div>

        <section className="rounded-3xl bg-green-950 text-white p-4 md:p-6 mb-4">
          <p className="text-green-300 font-bold text-sm mb-1">Event Status</p>

          <h2 className="text-2xl md:text-3xl font-black mb-1">
            {saved ? "Setup Saved" : "Setup Not Saved"}
          </h2>

          <p className="text-green-100 text-sm">
            {saved
              ? "Ready for live scoring."
              : "Complete the sections below, then save setup."}
          </p>
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 mb-4">
          <SectionHeader
            id="handicaps"
            title="Event Handicaps"
            subtitle="Set the handicap used for Stableford and pair calculations."
            summary={`${players.length} players configured`}
            complete={handicapComplete()}
          />

          {openSection === "handicaps" && (
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {players.map((player) => (
                  <div
                    key={player}
                    className="rounded-2xl bg-slate-50 border border-slate-200 p-3"
                  >
                    <label className="block text-sm font-black text-green-950 mb-1">
                      {player}
                    </label>

                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={setup.handicaps[player]}
                      onChange={(e) =>
                        updateHandicap(
                          player,
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {rounds.map((round) => {
          const roundSetup = setup.rounds[round.round];

          return (
            <section
              key={round.round}
              className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 mb-4"
            >
              <SectionHeader
                id={`round-${round.round}`}
                title={`${round.day} Setup`}
                subtitle={roundSetup.course}
                summary={roundSummary(round.round)}
                complete={roundComplete(round.round)}
              />

              {openSection === `round-${round.round}` && (
                <div className="mt-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Course
                    </label>

                    <select
                      value={roundSetup.course}
                      onChange={(e) =>
                        updateRoundCourse(round.round, e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 font-bold"
                    >
                      <option>Cheshire Course</option>
                      <option>Nicklaus Course</option>
                    </select>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 mb-4">
                    <p className="text-xs font-bold text-slate-500 mb-2">
                      Round Format
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateRoundFormat(round.round, "stableford")
                        }
                        className={`rounded-xl px-3 py-3 text-sm font-black border ${
                          roundSetup.format === "stableford"
                            ? "bg-green-950 text-white border-green-900"
                            : "bg-white text-green-950 border-slate-200"
                        }`}
                      >
                        Stableford
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateRoundFormat(round.round, "scramblePairs")
                        }
                        className={`rounded-xl px-3 py-3 text-sm font-black border ${
                          roundSetup.format === "scramblePairs"
                            ? "bg-green-950 text-white border-green-900"
                            : "bg-white text-green-950 border-slate-200"
                        }`}
                      >
                        Scramble Pairs
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-3">
                      <div>
                        <p className="text-green-700 text-sm font-bold">
                          {roundSetup.format === "scramblePairs"
                            ? "Scramble Pairs"
                            : "Playing Groups"}
                        </p>

                        <h3 className="text-2xl font-black text-green-950">
                          Tee Time Groups
                        </h3>
                      </div>

                      <p className="text-sm text-slate-500 font-bold">
                        One scorer per group
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      {[1, 2, 3].map((groupNumber, groupIndex) => (
                        <div
                          key={groupNumber}
                          className="rounded-2xl bg-slate-50 border border-slate-200 p-3"
                        >
                          <h4 className="text-lg font-black text-green-950 mb-2">
                            Group {groupNumber}
                          </h4>

                          <label className="block text-xs font-bold text-slate-500 mb-1">
                            Tee Time
                          </label>

                          <input
                            value={roundSetup.teeTimes[groupIndex]}
                            onChange={(e) =>
                              updateTeeTime(
                                round.round,
                                groupIndex,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold mb-3"
                          />

                          {roundSetup.format === "stableford" && (
                            <div className="space-y-2">
                              {[1, 2, 3, 4].map((slot, slotIndex) => (
                                <select
                                  key={slot}
                                  value={
                                    roundSetup.groups[groupIndex][slotIndex]
                                  }
                                  onChange={(e) =>
                                    updateGroupPlayer(
                                      round.round,
                                      groupIndex,
                                      slotIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                                >
                                  <option value="">Player {slot}</option>

                                  {players.map((player) => (
                                    <option key={player} value={player}>
                                      {player}
                                    </option>
                                  ))}
                                </select>
                              ))}
                            </div>
                          )}

                          {roundSetup.format === "scramblePairs" && (
                            <div className="space-y-3">
                              {[1, 2].map((pairNumber, pairIndex) => {
                                const pair =
                                  roundSetup.pairs[groupIndex][pairIndex];

                                const calculatedHandicap =
                                  calculatePairHandicap(
                                    pair.player1,
                                    pair.player2
                                  );

                                const finalHandicap =
                                  getFinalPairHandicap(pair);

                                return (
                                  <div
                                    key={pairNumber}
                                    className="rounded-2xl bg-white border border-slate-200 p-3"
                                  >
                                    <p className="text-sm font-black text-green-950 mb-2">
                                      Pair {pairNumber}
                                    </p>

                                    <div className="space-y-2">
                                      <select
                                        value={pair.player1}
                                        onChange={(e) =>
                                          updatePairPlayer(
                                            round.round,
                                            groupIndex,
                                            pairIndex,
                                            "player1",
                                            e.target.value
                                          )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                                      >
                                        <option value="">Player 1</option>

                                        {players.map((player) => (
                                          <option key={player} value={player}>
                                            {player}
                                          </option>
                                        ))}
                                      </select>

                                      <select
                                        value={pair.player2}
                                        onChange={(e) =>
                                          updatePairPlayer(
                                            round.round,
                                            groupIndex,
                                            pairIndex,
                                            "player2",
                                            e.target.value
                                          )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                                      >
                                        <option value="">Player 2</option>

                                        {players.map((player) => (
                                          <option key={player} value={player}>
                                            {player}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                                      <p className="text-xs font-bold text-slate-500">
                                        Calculated Pair HCP
                                      </p>

                                      <p className="text-xl font-black text-green-950">
                                        {calculatedHandicap === ""
                                          ? "-"
                                          : calculatedHandicap}
                                      </p>

                                      {calculatedHandicap !== "" && (
                                        <p className="text-xs font-bold text-slate-400">
                                          ({getHandicap(pair.player1)} +{" "}
                                          {getHandicap(pair.player2)}) ÷ 2
                                        </p>
                                      )}

                                      <label className="block text-xs font-bold text-slate-500 mt-3 mb-1">
                                        Final Pair HCP
                                      </label>

                                      <input
                                        type="number"
                                        inputMode="numeric"
                                        value={finalHandicap}
                                        onChange={(e) =>
                                          updatePairFinalHandicap(
                                            round.round,
                                            groupIndex,
                                            pairIndex,
                                            e.target.value
                                          )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-black"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-green-700 text-sm font-bold">
                      Bonus Points
                    </p>

                    <h3 className="text-2xl font-black text-green-950 mb-3">
                      Longest Drive & Nearest Pin
                    </h3>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h4 className="text-lg font-black text-green-950">
                            💣 Longest Drive
                          </h4>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={roundSetup.longestDrivePoints}
                              onChange={(e) =>
                                updateBonusPoints(
                                  round.round,
                                  "longestDrivePoints",
                                  e.target.value
                                )
                              }
                              className="w-16 rounded-xl border border-slate-300 px-2 py-2 text-center font-black"
                            />

                            <span className="text-xs font-bold text-slate-500">
                              pts
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm font-bold">
                          {[...Array(18)].map((_, index) => {
                            const hole = index + 1;

                            return (
                              <label
                                key={hole}
                                className={`rounded-xl border p-2 ${
                                  roundSetup.longestDriveHoles.includes(hole)
                                    ? "bg-green-100 border-green-300 text-green-950"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={roundSetup.longestDriveHoles.includes(
                                    hole
                                  )}
                                  onChange={() =>
                                    toggleBonusHole(
                                      round.round,
                                      "longestDriveHoles",
                                      hole
                                    )
                                  }
                                />
                                H{hole}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h4 className="text-lg font-black text-green-950">
                            🎯 Nearest Pin
                          </h4>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={roundSetup.nearestPinPoints}
                              onChange={(e) =>
                                updateBonusPoints(
                                  round.round,
                                  "nearestPinPoints",
                                  e.target.value
                                )
                              }
                              className="w-16 rounded-xl border border-slate-300 px-2 py-2 text-center font-black"
                            />

                            <span className="text-xs font-bold text-slate-500">
                              pts
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm font-bold">
                          {[...Array(18)].map((_, index) => {
                            const hole = index + 1;

                            return (
                              <label
                                key={hole}
                                className={`rounded-xl border p-2 ${
                                  roundSetup.nearestPinHoles.includes(hole)
                                    ? "bg-green-100 border-green-300 text-green-950"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={roundSetup.nearestPinHoles.includes(
                                    hole
                                  )}
                                  onChange={() =>
                                    toggleBonusHole(
                                      round.round,
                                      "nearestPinHoles",
                                      hole
                                    )
                                  }
                                />
                                H{hole}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      Selected holes will show bonus winner dropdowns on the
                      live scoring page.
                    </p>
                  </div>
                </div>
              )}
            </section>
          );
        })}

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 md:p-5">
          <p className="text-green-700 text-sm font-bold">Save Setup</p>

          <h2 className="text-2xl md:text-3xl font-black text-green-950 mb-2">
            Tournament Ready
          </h2>

          <p className="text-slate-600 text-sm mb-4">
            Save the setup, then start updating scorecards or view the live
            leaderboard.
          </p>

          <button
            onClick={saveSetup}
            className="w-full rounded-2xl bg-green-950 text-white px-5 py-4 text-xl font-black"
          >
            💾 Save Tournament Setup
          </button>

          {saved && (
            <div className="mt-4">
              <p className="rounded-xl bg-green-100 text-green-900 px-4 py-3 text-center font-black mb-3">
                ✅ Tournament setup saved
              </p>

              <a
                href="/events/carden-park-2026/live-leaderboard"
                className="block rounded-2xl bg-green-950 text-white px-4 py-3 text-center font-black mb-3"
              >
                🏆 View Live Leaderboard
              </a>

              <a
                href="/events/carden-park-2026/live-leaderboard/live-scoring"
                className="block rounded-2xl bg-green-950 text-white px-4 py-3 text-center font-black mt-3"
              >
                ⛳ Update Scorecards
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}