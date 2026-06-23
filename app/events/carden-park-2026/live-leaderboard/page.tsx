const players = [
  { position: 1, name: "Carl", points: 15, movement: "↑" },
  { position: 2, name: "Phil", points: 12, movement: "↑" },
  { position: 3, name: "Paul", points: 10, movement: "—" },
  { position: 4, name: "Stu", points: 8, movement: "↓" },
];

export default function CardenParkLiveLeaderboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <a
          href="/events/carden-park-2026"
          className="text-green-700 text-sm font-bold"
        >
          ← Back to Carden Park
        </a>

        <h1 className="text-4xl md:text-6xl font-black mt-6 mb-2 text-green-950">
          Live Leaderboard
        </h1>

        <p className="text-slate-600 mb-8">
          Carden Park 2026 live standings. Updated during the weekend as the
          pressure, excuses and accusations build.
        </p>

        <section className="rounded-3xl bg-green-950 text-white border border-green-900 shadow-sm p-6 mb-6">
          <p className="text-green-100 font-bold text-sm mb-2">
            Current Leader
          </p>

          <h2 className="text-4xl font-black">{players[0].name}</h2>

          <p className="text-green-100 mt-2">
            {players[0].points} points and absolutely unbearable in the group
            chat.
          </p>
        </section>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-green-950 text-white">
              <tr>
                <th className="p-4">Pos</th>
                <th className="p-4">Player</th>
                <th className="p-4">Points</th>
                <th className="p-4 hidden sm:table-cell">Move</th>
              </tr>
            </thead>

            <tbody>
              {players.map((player) => (
                <tr key={player.name} className="border-t border-slate-200">
                  <td className="p-4 font-black">{player.position}</td>
                  <td className="p-4 font-bold text-green-950">
                    {player.name}
                  </td>
                  <td className="p-4 font-black">{player.points}</td>
                  <td className="p-4 hidden sm:table-cell">
                    {player.movement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Live scoring will begin once the Carden Park weekend starts.
        </p>
      </div>
    </main>
  );
}