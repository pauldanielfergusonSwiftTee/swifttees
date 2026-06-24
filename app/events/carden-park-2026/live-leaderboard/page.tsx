const players = [
  { position: 1, name: "Carl", team: "White", points: 15, thru: 7, movement: "↑" },
  { position: 2, name: "Phil", team: "Blue", points: 12, thru: 7, movement: "↑" },
  { position: 3, name: "Paul", team: "Green", points: 10, thru: 6, movement: "—" },
  { position: 4, name: "Stu", team: "Blue", points: 8, thru: 6, movement: "↓" },
  { position: 5, name: "Gav", team: "White", points: 7, thru: 5, movement: "—" },
  { position: 6, name: "Painy", team: "Green", points: 6, thru: 5, movement: "↓" },
  { position: 7, name: "Dan", team: "Blue", points: 5, thru: 5, movement: "—" },
  { position: 8, name: "Wrighty", team: "White", points: 5, thru: 5, movement: "↑" },
  { position: 9, name: "Liam", team: "Blue", points: 4, thru: 4, movement: "↓" },
  { position: 10, name: "Ian", team: "Green", points: 4, thru: 4, movement: "—" },
  { position: 11, name: "Adam", team: "White", points: 3, thru: 4, movement: "↓" },
  { position: 12, name: "Taz", team: "Green", points: 2, thru: 3, movement: "—" },
];

const teams = [
  { position: 1, name: "White", points: 22, thru: "avg 6" },
  { position: 2, name: "Blue", points: 20, thru: "avg 6" },
  { position: 3, name: "Green", points: 16, thru: "avg 5" },
];

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  return "bg-slate-200 border border-slate-400";
}

function movementStyle(movement: string) {
  if (movement === "↑") return "text-green-700";
  if (movement === "↓") return "text-red-600";
  return "text-slate-400";
}

export default function CardenParkLiveLeaderboardPage() {
  const topThree = players.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/events/carden-park-2026" className="text-green-700 text-sm font-bold">
          ← Back to Carden Park
        </a>

        <div className="mt-5 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-black">
              🟢 LIVE
            </span>

            <span className="text-xs font-bold text-slate-500">
              Updated 13:42
            </span>
          </div>

          <h1 className="text-3xl md:text-6xl font-black text-green-950">
            Live Leaderboard
          </h1>

          <p className="text-slate-600 mt-2 text-sm md:text-base max-w-3xl">
            Carden Park 2026 team standings, individual scores and live stats.
          </p>
        </div>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 mb-5">
          <h2 className="text-xl md:text-2xl font-black text-green-950 mb-3">
            Team Standings
          </h2>

          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {teams.map((team, index) => (
              <div
                key={team.name}
                className={`rounded-2xl p-3 md:p-5 text-center border ${
                  index === 0
                    ? "bg-green-950 text-white border-green-900"
                    : "bg-slate-50 text-slate-900 border-slate-200"
                }`}
              >
                <p className="text-2xl md:text-3xl mb-1">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </p>

                <p
                  className={`text-base md:text-2xl font-black leading-tight ${
                    index === 0 ? "text-white" : "text-green-950"
                  }`}
                >
                  {team.name}
                </p>

                <p
                  className={`text-3xl md:text-5xl font-black mt-1 ${
                    index === 0 ? "text-green-300" : "text-green-950"
                  }`}
                >
                  {team.points}
                </p>

                <p
                  className={`text-xs md:text-sm font-bold ${
                    index === 0 ? "text-green-200" : "text-slate-500"
                  }`}
                >
                  pts • {team.thru}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-green-950 text-white border border-green-900 shadow-sm p-5 md:p-6 mb-5">
          <p className="text-green-300 font-bold text-sm mb-3">
            Individual Podium
          </p>

          <div className="grid grid-cols-3 gap-3">
            {topThree.map((player, index) => (
              <div
                key={player.name}
                className={`rounded-2xl p-4 text-center ${
                  index === 0 ? "bg-white text-green-950" : "bg-white/10 text-white"
                }`}
              >
                <p className="text-2xl mb-1">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </p>

                <p className="text-lg md:text-2xl font-black leading-tight">
                  {player.name}
                </p>

                <p className={index === 0 ? "text-green-700 font-bold" : "text-green-100 font-bold"}>
                  {player.points} pts
                </p>

                <p className={index === 0 ? "text-xs text-slate-500" : "text-xs text-green-200"}>
                  thru {player.thru}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-[1.45fr_0.8fr] gap-5 mb-5">
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="text-xl md:text-2xl font-black text-green-950">
                Individual Standings
              </h2>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-green-950 text-white">
                <tr>
                  <th className="px-2 py-2 text-center w-8">#</th>
                  <th className="px-2 py-2">Player</th>
                  <th className="px-2 py-2 text-center w-12">Pts</th>
                  <th className="px-2 py-2 text-center w-12">⛳</th>
                  <th className="px-2 py-2 text-center w-10">↕</th>
                </tr>
              </thead>

              <tbody>
                {players.map((player) => (
                  <tr key={player.name} className="border-t border-slate-200">
                    <td className="px-2 py-2 text-center font-black text-slate-700">
                      {player.position}
                    </td>

                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${teamDot(player.team)}`} />
                        <span className="font-bold text-green-950 leading-tight">
                          {player.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-2 py-2 text-center font-black">
                      {player.points}
                    </td>

                    <td className="px-2 py-2 text-center font-bold text-slate-700">
                      {player.thru}
                    </td>

                    <td className={`px-2 py-2 text-center font-black ${movementStyle(player.movement)}`}>
                      {player.movement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4">
            <h2 className="text-xl font-black text-green-950 mb-3">
              Quick Stats
            </h2>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500">
                  Biggest Climber
                </p>
                <p className="font-black text-green-950">
                  Wrighty ↑
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500">
                  Current Collapse
                </p>
                <p className="font-black text-green-950">
                  Adam ↓
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500">
                  Best Last 3 Holes
                </p>
                <p className="font-black text-green-950">
                  Paul · 7 pts
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500">
                  💀 Blob King
                </p>
                <p className="font-black text-green-950">
                  Taz · 3
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500">
                  Most Pars
                </p>
                <p className="font-black text-green-950">
                  Carl · 5
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500">
                  Most Birdies
                </p>
                <p className="font-black text-green-950">
                  Phil · 2
                </p>
              </div>
            </div>
          </section>
        </div>

        <p className="text-xs text-slate-500">
          Mock data for layout testing. Live scoring will connect to Supabase next.
        </p>
      </div>
    </main>
  );
}