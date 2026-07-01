import Link from "next/link";
import PageContainer from "@/components/PageContainer";

const leaderboard = [
  { pos: 1, name: "Paul", points: 19, movement: "—", highlight: "😬" },
  { pos: 2, name: "Gav", points: 18, movement: "▲", highlight: "🔥" },
  { pos: 3, name: "Dan", points: 16, movement: "▼", highlight: "📉" },
  { pos: 4, name: "Carl", points: 14, movement: "—", highlight: "⚔️" },
  { pos: 5, name: "Wrighty", points: 14, movement: "▲", highlight: "🐦" },
  { pos: 6, name: "Liam", points: 13, movement: "—", highlight: "⚔️" },
  { pos: 7, name: "Adam", points: 12, movement: "▼", highlight: "💣" },
  { pos: 8, name: "Taz", points: 11, movement: "▲", highlight: "⭐" },
  { pos: 9, name: "Phil", points: 10, movement: "—", highlight: "" },
  { pos: 10, name: "Ian", points: 9, movement: "▼", highlight: "📉" },
  { pos: 11, name: "Stu", points: 8, movement: "—", highlight: "🎂" },
  { pos: 12, name: "Painy", points: 7, movement: "▼", highlight: "😬" },
];

const commentary = [
  {
    time: "2 mins ago",
    text: "🤣 Adam's 309-yard drive has now entered official Swift Tees folklore.",
  },
  {
    time: "5 mins ago",
    text: "🔥 Gav's birdie on 7 cuts Paul's lead to a single point.",
  },
  {
    time: "8 mins ago",
    text: "⚔️ Wrighty and Liam remain inseparable heading into the toughest stretch.",
  },
  {
    time: "12 mins ago",
    text: "🎂 Stu is quietly hanging around mid-table. Birthday pressure clearly not getting to him yet.",
  },
];

const teamStandings = [
  { team: "Blue", points: 78, icon: "🥇" },
  { team: "Green", points: 75, icon: "🥈" },
  { team: "Red", points: 70, icon: "🥉" },
];

function movementStyle(movement: string) {
  if (movement === "▲") return "text-green-700";
  if (movement === "▼") return "text-red-600";
  return "text-slate-400";
}

export default function MatchCentrePage() {
  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <section className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-green-300">
          🔥 Match Centre
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Carden Park 2026
        </h1>

        <p className="mt-2 text-sm font-bold text-green-100">
          Round 1 • Hole 8
        </p>
      </section>

     <section className="sticky top-0 z-40 mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
  <p className="text-xs font-black uppercase tracking-wide text-green-700">
    🔥 Breaking News 
  </p>

  <p className="mt-1 text-lg font-black leading-snug text-green-950">
    Gav's birdie on 7 has cut Paul's lead to a single point.
  </p>
</section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        

        <div className="grid grid-cols-3 gap-2">
          {teamStandings.map((team) => (
            <div
              key={team.team}
              className="rounded-2xl bg-slate-50 p-2 text-center"
            >
              <p className="text-xl">{team.icon}</p>

              <p className="mt-1 text-xs font-black uppercase leading-tight text-green-950">
                {team.team}
              </p>

              <p className="mt-1 text-lg font-black text-green-950">
                {team.points} pts
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-black text-green-950">🎙️ Live Feed</h2>

        <div className="mt-2 divide-y divide-slate-200">
          {commentary.map((item, index) => (
            <div key={index} className="py-2.5 first:pt-0 last:pb-0">
              <p className="text-xs font-bold text-slate-400">{item.time}</p>

             

              <p className="mt-0.5 text-sm font-medium leading-5 text-slate-700">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-green-950">
            🏆 Live Leaderboard
          </h2>

          <Link href="/leaderboard" className="text-sm font-black text-green-700">
            Detail →
          </Link>
        </div>

        <div className="space-y-2">
          {leaderboard.map((player) => (
            <div
              key={player.name}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-950 text-sm font-black text-white">
                  {player.pos}
                </span>

                <div>
                  <p className="text-base font-black text-green-950">
                    {player.name}
                  </p>

                 
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
  <span className={`text-base font-black ${movementStyle(player.movement)}`}>
    {player.movement}
  </span>

  {player.highlight && (
  <span className="text-base">
    {player.highlight}
  </span>
)}

  <p className="min-w-8 text-lg font-black text-green-950">
    {player.points}
  </p>
</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-black text-green-950">
          ⚔️ Current Battle
        </h2>

        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-green-700">
            Battle of the Moment
          </p>

          <p className="mt-1 text-xl font-black text-green-950">
            Paul vs Gav
          </p>

          <p className="mt-1 text-sm font-bold text-slate-600">
            Just 1 point separates them heading into the next stretch.
          </p>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-black text-green-950">
          📝 Score Entry
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          For nominated scorers only. Enter hole-by-hole scores for your group.
        </p>

        <Link
          href="/events/carden-park-2026/live-leaderboard/live-scoring"
          className="mt-3 flex w-full items-center justify-center rounded-2xl bg-green-700 px-5 py-3.5 text-base font-black text-white"
        >
          Continue Scoring →
        </Link>
      </section>
    </PageContainer>
  );
}