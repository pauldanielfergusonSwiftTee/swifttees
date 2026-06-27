"use client";

import { useEffect, useState } from "react";

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  return "bg-slate-200 border border-slate-400";
}

export default function LiveScoringPage() {
  const [tournamentSetup, setTournamentSetup] = useState<any>(null);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [hole, setHole] = useState(1);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bonusWinners, setBonusWinners] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const savedSetup = localStorage.getItem("swiftTeesTournamentSetup");

    if (savedSetup) {
      const parsedSetup = JSON.parse(savedSetup);
      setTournamentSetup(parsedSetup);

      const firstRound = parsedSetup.rounds?.[0];

      if (firstRound) {
        setRoundId(firstRound.id);
        setSelectedGroupId(firstRound.groups?.[0]?.id ?? null);
      }
    }
  }, []);

  if (!tournamentSetup || !roundId || !selectedGroupId) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900 p-6">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <h1 className="text-2xl font-black text-green-950">
            No tournament setup found
          </h1>

          <p className="mt-2 text-slate-600 text-sm">
            Go to Tournament Setup first, save the event setup, then return to
            Live Scoring.
          </p>

          <a
            href="/events/carden-park-2026/live-leaderboard/setup"
            className="mt-4 inline-block rounded-2xl bg-green-950 text-white px-5 py-3 font-black"
          >
            ⚙️ Go to Tournament Setup
          </a>
        </div>
      </main>
    );
  }

  const currentRound = tournamentSetup.rounds.find(
    (round: any) => round.id === roundId
  );

  const selectedGroup = currentRound.groups.find(
    (group: any) => group.id === selectedGroupId
  );

  const currentHole = currentRound.holes.find((item: any) => item.hole === hole);

  const bonusHole = currentRound.bonusHoles?.find(
    (bonus: any) => bonus.hole === hole
  );

 const allRoundPlayers = Array.from(
  new Set(
    currentRound.groups.flatMap((group: any) =>
      group.players.map((player: any) => player.name)
    )
  )
);

  function scoreKey(player: string, holeNumber = hole) {
    return `${roundId}-${selectedGroupId}-${holeNumber}-${player}`;
  }

  function bonusKey(holeNumber = hole) {
    return `${roundId}-${holeNumber}`;
  }

  function getScore(player: string) {
    return scores[scoreKey(player)] || 0;
  }

  function changeScore(player: string, amount: number) {
    const key = scoreKey(player);
    const currentScore = scores[key] || 0;
    const newScore = Math.max(0, currentScore + amount);

    setScores((current) => ({
      ...current,
      [key]: newScore,
    }));
  }

  function setScore(player: string, value: string) {
    const key = scoreKey(player);
    const numberValue = Number(value);

    setScores((current) => ({
      ...current,
      [key]: numberValue,
    }));
  }

  function setBonusWinner(playerName: string) {
    setBonusWinners((current) => ({
      ...current,
      [bonusKey()]: playerName,
    }));
  }

  function getBonusWinner(holeNumber = hole) {
    return bonusWinners[bonusKey(holeNumber)] || "";
  }

  function saveHole() {
    const bonusMessage =
      bonusHole && getBonusWinner()
        ? ` Bonus winner: ${getBonusWinner()}.`
        : "";

    setSavedMessage(
      `${currentRound.day} ${currentRound.course} — Hole ${hole} saved.${bonusMessage}`
    );

    if (hole < 18) {
      setTimeout(() => {
        setHole((current) => current + 1);
        setSavedMessage("");
      }, 800);
    }
  }

  function holeHasScores(holeNumber: number) {
    return selectedGroup.players.some(
      (player: any) => scores[scoreKey(player.name, holeNumber)]
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-3 md:p-8">
      <div className="max-w-3xl mx-auto">
        <a
          href="/events/carden-park-2026"
          className="text-green-700 text-sm font-bold"
        >
          ← Back to {tournamentSetup.eventName || "Carden Park"}
        </a>

        <div className="mt-4 mb-4">
          <p className="text-green-700 font-bold text-sm">
            {tournamentSetup.eventName || "Carden Park 2026"}
          </p>

          <h1 className="text-3xl md:text-6xl font-black text-green-950">
            Live Scoring
          </h1>

          <p className="text-slate-600 mt-1 text-sm">
            Pulling rounds, groups, players, handicaps and bonus holes from
            Tournament Setup.
          </p>
        </div>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-3 mb-4">
          <p className="text-sm font-bold text-green-700 mb-2">Select Round</p>

          <div className="grid grid-cols-2 gap-2">
            {tournamentSetup.rounds.map((round: any) => (
              <button
                key={round.id}
                onClick={() => {
                  setRoundId(round.id);
                  setSelectedGroupId(round.groups?.[0]?.id ?? null);
                  setHole(1);
                  setSavedMessage("");
                }}
                className={`rounded-2xl p-3 text-center font-black border ${
                  roundId === round.id
                    ? "bg-green-950 text-white border-green-900"
                    : "bg-slate-50 text-green-950 border-slate-200"
                }`}
              >
                <span className="block text-sm">{round.day}</span>
                <span className="block text-xs opacity-80">{round.course}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-3 mb-4">
          <p className="text-sm font-bold text-green-700 mb-2">Select Group</p>

          <div className="grid grid-cols-3 gap-2">
            {currentRound.groups.map((group: any) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setSavedMessage("");
                }}
                className={`rounded-2xl p-3 text-center font-black border ${
                  selectedGroupId === group.id
                    ? "bg-green-950 text-white border-green-900"
                    : "bg-slate-50 text-green-950 border-slate-200"
                }`}
              >
                <span className="block text-sm">{group.name}</span>
                <span className="block text-xs opacity-80">
                  {group.teeTime}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-green-950 text-white border border-green-900 shadow-sm p-4 mb-4">
          <div className="text-center mb-4">
            <p className="text-green-300 text-xs font-black uppercase tracking-wider">
              {currentRound.day} • {currentRound.course}
            </p>

            <p className="text-green-100 text-xs font-bold mt-1">
              {selectedGroup.name} • {selectedGroup.teeTime} •{" "}
              {currentRound.tee}
            </p>

            <p className="text-green-200 text-xs font-bold mt-1">
              {currentRound.format}
            </p>

            <h2 className="text-4xl font-black mt-2">⛳ Hole {hole} of 18</h2>

            <div className="mt-2 flex justify-center gap-2 text-sm font-bold flex-wrap">
              <span className="rounded-full bg-white/10 px-3 py-1">
                Par {currentHole.par}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1">
                SI {currentHole.strokeIndex}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1">
                {currentHole.yards} yds
              </span>
            </div>

            {bonusHole && (
              <div className="mt-3 rounded-2xl bg-yellow-300 text-green-950 px-4 py-3 text-sm font-black">
                <p>
                  ⭐ Bonus Hole: {bonusHole.type}
                  {bonusHole.points ? ` — ${bonusHole.points} pts` : ""}
                </p>

                <select
                  value={getBonusWinner()}
                  onChange={(e) => setBonusWinner(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-white px-3 py-3 text-green-950 font-black border border-yellow-500"
                >
                  <option value="">Select winner from all players</option>

               {allRoundPlayers.map((playerName: any, index: number) => (
  <option key={`${playerName}-${index}`} value={playerName}>
    {playerName}
  </option>
))}
                </select>

                {getBonusWinner() && (
                  <p className="mt-2 text-xs">
                    Winner selected: {getBonusWinner()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => {
                setHole((current) => Math.max(1, current - 1));
                setSavedMessage("");
              }}
              className="rounded-xl bg-white/10 px-3 py-3 font-bold"
            >
              ← Prev
            </button>

            <select
              value={hole}
              onChange={(e) => {
                setHole(Number(e.target.value));
                setSavedMessage("");
              }}
              className="rounded-xl bg-white text-green-950 px-3 py-3 font-black text-center"
            >
              {currentRound.holes.map((item: any) => (
                <option key={item.hole} value={item.hole}>
                  Hole {item.hole}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setHole((current) => Math.min(18, current + 1));
                setSavedMessage("");
              }}
              className="rounded-xl bg-white/10 px-3 py-3 font-bold"
            >
              Next →
            </button>
          </div>

          <div className="space-y-3">
            {selectedGroup.players.map((player: any) => (
              <div
                key={player.name}
                className="rounded-2xl bg-white text-green-950 p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-3 w-3 rounded-full shrink-0 ${teamDot(
                      player.team
                    )}`}
                  />

                  <div>
                    <label className="text-xl font-black">{player.name}</label>
                    <p className="text-xs font-bold text-slate-500">
                      {player.team || "No Team"} • HCP {player.eventHandicap}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeScore(player.name, -1)}
                    className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-xl font-black"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={getScore(player.name) || ""}
                    onChange={(e) => setScore(player.name, e.target.value)}
                    className="w-16 rounded-xl border border-slate-300 px-2 py-2 text-center text-2xl font-black"
                    placeholder="-"
                  />

                  <button
                    onClick={() => changeScore(player.name, 1)}
                    className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-xl font-black"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {savedMessage && (
            <p className="mt-4 rounded-xl bg-green-600 px-4 py-3 text-center font-bold">
              ✅ {savedMessage}
            </p>
          )}

          <button
            onClick={saveHole}
            className="mt-4 w-full rounded-2xl bg-white text-green-950 px-5 py-4 text-xl font-black"
          >
            Save Hole {hole} Scores
          </button>
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-3">
          <h2 className="text-xl font-black text-green-950 mb-3">
            Hole Overview
          </h2>

          <div className="grid grid-cols-9 gap-2">
            {currentRound.holes.map((item: any) => {
              const holeNumber = item.hole;
              const hasScores = holeHasScores(holeNumber);
              const hasBonus = currentRound.bonusHoles?.some(
                (bonus: any) => bonus.hole === holeNumber
              );
              const bonusWinner = getBonusWinner(holeNumber);

              return (
                <button
                  key={holeNumber}
                  onClick={() => {
                    setHole(holeNumber);
                    setSavedMessage("");
                  }}
                  className={`rounded-xl py-2 text-sm font-black border relative ${
                    hole === holeNumber
                      ? "bg-green-950 text-white border-green-900"
                      : hasScores
                      ? "bg-green-100 text-green-950 border-green-300"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {holeNumber}

                  {hasBonus && (
                    <span
                      className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border border-white ${
                        bonusWinner ? "bg-yellow-400" : "bg-yellow-200"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-bold text-slate-500">
            <p>🟩 Saved</p>
            <p>⬛ Current</p>
            <p>⬜ Empty</p>
            <p>⭐ Bonus</p>
          </div>
        </section>

        <div className="mt-4 text-center">
          <a
            href="/events/carden-park-2026/live-leaderboard/setup"
            className="text-sm font-bold text-green-700"
          >
            ⚙️ Back to Tournament Setup
          </a>
        </div>
      </div>
    </main>
  );
}