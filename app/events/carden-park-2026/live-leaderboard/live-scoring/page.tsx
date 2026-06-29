"use client";

import { useEffect, useState } from "react";

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  return "bg-slate-200 border border-slate-400";
}

function formatLabel(format: string) {
  if (format === "scramblePairs") return "Scramble Pairs";
  return "Stableford";
}

export default function LiveScoringPage() {
  const [tournamentSetup, setTournamentSetup] = useState<any>(null);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [hole, setHole] = useState(1);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bonusWinners, setBonusWinners] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState("");
const [showRoundSelector, setShowRoundSelector] = useState(false);
const [showGroupSelector, setShowGroupSelector] = useState(false);


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
            Update Scorecards.
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

  const isScramble = currentRound.format === "scramblePairs";

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

  function scoreKey(id: string, holeNumber = hole) {
    return `${roundId}-${selectedGroupId}-${holeNumber}-${id}`;
  }

  function bonusKey(holeNumber = hole) {
    return `${roundId}-${holeNumber}`;
  }

  function getScore(id: string) {
    return scores[scoreKey(id)] || 0;
  }

  function changeScore(id: string, amount: number) {
    const key = scoreKey(id);
    const currentScore = scores[key] || 0;
    const newScore = Math.max(0, currentScore + amount);

    setScores((current) => ({
      ...current,
      [key]: newScore,
    }));
  }

  function setScore(id: string, value: string) {
    const key = scoreKey(id);
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

    const formatMessage = isScramble ? "scramble scores" : "scorecards";

    setSavedMessage(
      `${currentRound.day} ${currentRound.course} — Hole ${hole} ${formatMessage} updated.${bonusMessage}`
    );

    if (hole < 18) {
      setTimeout(() => {
        setHole((current) => current + 1);
        setSavedMessage("");
      }, 800);
    }
  }

  function holeHasScores(holeNumber: number) {
    if (isScramble) {
      return selectedGroup.pairs?.some(
        (pair: any) => scores[scoreKey(pair.id, holeNumber)]
      );
    }

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
            {isScramble ? "Update Scramble Scorecards" : "Update Scorecards"}
          </h1>

          <p className="text-slate-600 mt-1 text-sm">
            {isScramble
              ? "Enter one score per scramble pair for each hole."
              : "Enter scores hole-by-hole for your group."}{" "}
            Team standings and the live leaderboard update automatically.
          </p>
        </div>

        <div className="mt-3">
          <a
            href="/events/carden-park-2026/live-leaderboard"
            className="mt-5 mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-lg font-black text-green-950 shadow-sm transition hover:border-green-700 hover:bg-slate-50"
          >
            🏆 Live Leaderboard
          </a>
        </div>

{/* Round / Group Selectors */}

<div className="grid grid-cols-2 gap-3 mb-3">
  {/* Course */}

  <button
    onClick={() => {
      setShowRoundSelector(!showRoundSelector);
      setShowGroupSelector(false);
    }}
    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-green-700 transition"
  >
    <div className="flex items-center justify-between">
      <p className="text-2xl font-black text-green-950 truncate">
        {currentRound.course}
      </p>

      <span className="text-green-700 text-xl font-black">
        {showRoundSelector ? "▲" : "▼"}
      </span>
    </div>

   <p className="mt-2 text-xs font-bold text-slate-400 text-left">
  Change
</p>
  </button>

  {/* Group */}

  <button
    onClick={() => {
      setShowGroupSelector(!showGroupSelector);
      setShowRoundSelector(false);
    }}
    className="rounded-2xl border border-slate-200 bg-white px-4 py-3  shadow-sm hover:border-green-700 transition"
  >
    <div className="flex items-center justify-between">
      <p className="text-2xl font-black text-green-950">
        {selectedGroup.name}
      </p>

      <span className="text-green-700 text-xl font-black">
        {showGroupSelector ? "▲" : "▼"}
      </span>
    </div>

   <p className="mt-2 text-xs font-bold text-slate-400 text-left">
  Change
</p>
  </button>
</div>

{showRoundSelector && (
  <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-3 mb-3">
    <div className="grid grid-cols-2 gap-2">
      {tournamentSetup.rounds.map((round: any) => (
        <button
          key={round.id}
          onClick={() => {
            setRoundId(round.id);
            setSelectedGroupId(round.groups?.[0]?.id ?? null);
            setHole(1);
            setSavedMessage("");
            setShowRoundSelector(false);
          }}
          className={`rounded-2xl p-3 text-center font-black border ${
            roundId === round.id
              ? "bg-green-950 text-white border-green-900"
              : "bg-slate-50 text-green-950 border-slate-200"
          }`}
        >
          <span className="block text-lg">{round.course}</span>

          <span className="block text-xs opacity-80 mt-1">
            {round.day}
          </span>
        </button>
      ))}
    </div>
  </section>
)}

{showGroupSelector && (
  <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-3 mb-3">
    <div className="grid grid-cols-3 gap-2">
      {currentRound.groups.map((group: any) => (
        <button
          key={group.id}
          onClick={() => {
            setSelectedGroupId(group.id);
            setSavedMessage("");
            setShowGroupSelector(false);
          }}
          className={`rounded-2xl p-3 text-center font-black border ${
            selectedGroupId === group.id
              ? "bg-green-950 text-white border-green-900"
              : "bg-slate-50 text-green-950 border-slate-200"
          }`}
        >
          <span className="block text-base">
            {group.name}
          </span>

          <span className="block text-xs opacity-80 mt-1">
            {group.teeTime}
          </span>
        </button>
      ))}
    </div>
  </section>
)}







  

        <section className="rounded-3xl bg-green-950 text-white border border-green-900 shadow-sm p-4 mb-4">
          <div className="text-center mb-4">
     



<h2 className="text-5xl font-black leading-none">
  Hole {hole}
</h2>
            <div className="mt-2 flex justify-center gap-2 text-m font-bold flex-wrap">
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


<div className="mt-4 grid grid-cols-9 gap-2">
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
        className={`relative rounded-xl py-3 text-base font-black border ${
          hole === holeNumber
            ? "bg-white text-green-950 border-white"
            : hasScores
            ? "bg-green-500 text-white border-green-400"
            : "bg-white/10 text-white border-white/20"
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
<div className="mt-3 flex flex-wrap justify-center gap-4 text-xs font-bold text-green-100">
  <span>🟩 Saved</span>
  <span>⬜ Current</span>
  <span>⬛ Empty</span>
  <span>⭐ Bonus</span>
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

          

          <div className="space-y-3">
            {!isScramble &&
              selectedGroup.players.map((player: any) => (
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
                      <label className="text-xl font-black">
                        {player.name}
                      </label>
                      <p className="text-xs font-bold text-slate-500">
                        {player.team || "No Team"} • HCP{" "}
                        {player.eventHandicap}
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

            {isScramble &&
              selectedGroup.pairs?.map((pair: any) => (
                <div
                  key={pair.id}
                  className="rounded-2xl bg-white text-green-950 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>



                    <p className="text-sm font-black text-green-700">
  👥 Pair {pair.pairNumber}
</p>

<p className="text-2xl font-black text-green-950">
  {pair.player1} + {pair.player2}
</p>

<div className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1">
  <span className="text-sm font-black text-green-900">
    {pair.finalHandicap} HCP
  </span>
</div>

{pair.calculatedHandicap !== pair.finalHandicap && (
  <p className="mt-1 text-xs text-slate-500">
    Calculated: {pair.calculatedHandicap}
  </p>
)}



                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeScore(pair.id, -1)}
                        className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-xl font-black"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={getScore(pair.id) || ""}
                        onChange={(e) => setScore(pair.id, e.target.value)}
                        className="w-16 rounded-xl border border-slate-300 px-2 py-2 text-center text-2xl font-black"
                        placeholder="-"
                      />

                      <button
                        onClick={() => changeScore(pair.id, 1)}
                        className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-xl font-black"
                      >
                        +
                      </button>
                    </div>
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
            {isScramble
              ? `Update Hole ${hole} Scramble Scores`
              : `Update Hole ${hole} Scorecards`}
          </button>
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