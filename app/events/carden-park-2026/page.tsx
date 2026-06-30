"use client";

import { useState } from "react";

const players = [
  { name: "Gav", team: "White", note: "Reliable society operator. Usually involved somewhere near the sharp end." },
  { name: "Wrighty", team: "White", note: "Dangerous when the swing behaves. Always capable of a big weekend moment." },
  { name: "Carl", team: "White", note: "Club-adjustment enthusiast. Never far from a tactical tweak." },
  { name: "Adam", team: "White", note: "The shark. Long drive claims expected, evidence optional." },

  { name: "Dan", team: "Blue", note: "Steady presence and likely to quietly collect points." },
  { name: "Liam", team: "Blue", note: "Can produce scoring bursts when it clicks." },
  { name: "Stu", team: "Blue", note: "Birthday weekend energy. Central figure whether he likes it or not." },
  { name: "Phil", team: "Blue", note: "Golf, squash cans and Saturday Flight 22 lore." },

  { name: "Painy", team: "Green", note: "Competitive, dangerous and rarely short of confidence." },
  { name: "Paul", team: "Green", note: "Elite admin. Questionable golf. Building the system and hoping it behaves." },
  { name: "Ian", team: "Green", note: "Could quietly become a problem for the rest of the field." },
  { name: "Taz", team: "Green", note: "Group content supplier. Golf form may vary. Entertainment value guaranteed." },
];

const teams = [
  {
    name: "White Team",
    colour: "bg-slate-50 border-slate-200 text-slate-700",
    players: "Gav • Wrighty • Carl • Adam",
  },
  {
    name: "Blue Team",
    colour: "bg-blue-50 border-blue-200 text-blue-700",
    players: "Dan • Liam • Stu • Phil",
  },
  {
    name: "Green Team",
    colour: "bg-green-50 border-green-200 text-green-700",
    players: "Painy • Paul • Ian • Taz",
  },
];

export default function CardenParkEventPage() {
  const [openPlayers, setOpenPlayers] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openTeams, setOpenTeams] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <section className="mt-4 mb-4 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden p-3 md:p-4">
          <div className="relative h-72 md:h-[420px] rounded-2xl overflow-hidden">
            <img
              src="/carden-park.jpg"
              alt="Carden Park"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-950/45 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="inline-block bg-green-600 text-white text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl mb-3">
                Weekend Hub
              </p>

              <h1 className="text-4xl md:text-7xl font-black leading-tight">
                Carden Park 2026
              </h1>

              <p className="text-base md:text-xl text-green-100 mt-2 max-w-2xl">
                26–27 July · Cheshire Course + Nicklaus Course · twelve golfers,
                two days and plenty of leaderboard movement.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-green-950 text-white p-4 md:p-6">
          <h2 className="text-2xl md:text-4xl font-black mb-2">
            Weekend Controls
          </h2>

          <p className="text-green-100 text-sm mb-4">
            Main links for setup, scoring and following the live action.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <a
              href="/events/carden-park-2026/live-leaderboard"
              className="rounded-2xl bg-white text-green-950 px-5 py-4 text-center font-black text-lg"
            >
              🏆 Live Leaderboard
            </a>

            <a
              href="/events/carden-park-2026/live-leaderboard/live-scoring"
              className="rounded-2xl bg-green-500 text-white px-5 py-4 text-center font-black text-lg"
            >
              ⛳ Update Scorecards
            </a>

            <a
              href="/events/carden-park-2026/live-leaderboard/setup"
              className="rounded-2xl bg-white/10 border border-green-400 text-white px-5 py-4 text-center font-black text-lg"
            >
              ⚙️ Tournament Setup
            </a>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm text-center">
            <p className="text-green-700 text-xs font-bold">Dates</p>
            <p className="text-lg font-black text-green-950">26–27 Jul</p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm text-center">
            <p className="text-green-700 text-xs font-bold">Rounds</p>
            <p className="text-lg font-black text-green-950">2</p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm text-center">
            <p className="text-green-700 text-xs font-bold">Players</p>
            <p className="text-lg font-black text-green-950">12</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 mb-4">
          <button
            onClick={() => setOpenSchedule(!openSchedule)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="text-green-700 text-sm font-bold">Schedule</p>
              <h2 className="text-2xl font-black text-green-950">
                Key Weekend Details
              </h2>
            </div>

            <span className="text-2xl font-black text-green-950">
              {openSchedule ? "−" : "+"}
            </span>
          </button>

          {openSchedule && (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-green-700 text-sm font-bold">Day 1</p>
                <p className="font-black text-green-950">
                  13:10 · Cheshire Course
                </p>
                <p className="text-sm text-slate-600">
                  First round, check-in and dinner later.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-green-700 text-sm font-bold">Day 2</p>
                <p className="font-black text-green-950">
                  12:25 · Nicklaus Course
                </p>
                <p className="text-sm text-slate-600">
                  Final round, leaderboard pressure and awards afterwards.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-green-700 text-sm font-bold">Venue</p>
                <p className="font-black text-green-950">
                  Carden Park Hotel, Golf Resort & Spa
                </p>
                <p className="text-sm text-slate-600">
                  Dinner, bed and breakfast.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 mb-4">
          <button
            onClick={() => setOpenTeams(!openTeams)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="text-green-700 text-sm font-bold">Carden Cup</p>
              <h2 className="text-2xl font-black text-green-950">
                Teams
              </h2>
            </div>

            <span className="text-2xl font-black text-green-950">
              {openTeams ? "−" : "+"}
            </span>
          </button>

          {openTeams && (
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              {teams.map((team) => (
                <div
                  key={team.name}
                  className={`rounded-2xl border p-4 ${team.colour}`}
                >
                  <h3 className="text-xl font-black mb-2">
                    {team.name}
                  </h3>

                  <p className="text-sm font-semibold text-slate-600">
                    {team.players}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 mb-4">
          <button
            onClick={() => setOpenPlayers(!openPlayers)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="text-green-700 text-sm font-bold">Squad</p>
              <h2 className="text-2xl font-black text-green-950">
                Players Involved
              </h2>
            </div>

            <span className="text-2xl font-black text-green-950">
              {openPlayers ? "−" : "+"}
            </span>
          </button>

          {openPlayers && (
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {players.map((player) => (
                <div
                  key={player.name}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-green-950">
                      {player.name}
                    </h3>

                    <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-black text-slate-600">
                      {player.team}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-2">
                    {player.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 mb-8">
          <p className="text-green-700 text-sm font-bold">Format Notes</p>
          <h2 className="text-2xl font-black text-green-950 mb-3">
            Scoring Setup
          </h2>

          <div className="space-y-2 text-sm font-semibold text-slate-700">
            <p className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              Day 1 and Day 2 formats can be controlled from Tournament Setup.
            </p>

            <p className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              Supports Stableford and Scramble Pairs, including pair handicaps.
            </p>

            <p className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              Nearest pin and longest drive winners are selected from Update
              Scorecards.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}