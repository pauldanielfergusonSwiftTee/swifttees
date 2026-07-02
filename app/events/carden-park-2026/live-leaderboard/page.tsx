"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { getPlayers } from "@/lib/players";
import { getScores } from "@/lib/scores";

const EVENT_SLUG = "carden-park-2026";

type LeaderboardPlayer = {
  position: number;
  id: number;
  name: string;
  team: string;
  points: number;
  thru: number;
  movement: string;
};

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
const [lastUpdated, setLastUpdated] = useState(new Date());
const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const interval = setInterval(() => {
    setLastUpdated(new Date());
  }, 1000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  async function loadLeaderboard() {
    try {
      setLoading(true);

      const [allPlayers, scores] = await Promise.all([
        getPlayers(),
        getScores(EVENT_SLUG),
      ]);

      const stablefordScores = scores.filter(
        (score: any) =>
          score.score_type === "stableford" && score.player_id !== null
      );

      const leaderboard = allPlayers.map((player: any) => {
        const playerScores = stablefordScores.filter(
          (score: any) => Number(score.player_id) === Number(player.id)
        );

        return {
          id: player.id,
          name: player.name,
          team: "White", // Temporary - we'll load real teams next
          points: playerScores.reduce(
            (total: number, score: any) => total + Number(score.points ?? 0),
            0
          ),
          thru:
            playerScores.length > 0
              ? Math.max(
                  ...playerScores.map((score: any) =>
                    Number(score.hole_number)
                  )
                )
              : 0,
          movement: "—",
        };
      });

      leaderboard.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.thru - a.thru;
      });

      setPlayers(
        leaderboard.map((player, index) => ({
          ...player,
          position: index + 1,
        }))
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Could not load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  loadLeaderboard();
}, []);

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return "Updated just now";
  if (seconds === 1) return "Updated 1 sec ago";
  if (seconds < 60) return `Updated ${seconds} secs ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes === 1) return "Updated 1 min ago";

  return `Updated ${minutes} mins ago`;
}




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
  {timeAgo(lastUpdated)}
</span>
          </div>

          <h1 className="text-3xl md:text-6xl font-black text-green-950">
            Live Leaderboard
          </h1>

          
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
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
  <a
    href="/events/carden-park-2026/live-leaderboard/live-scoring"
    className="rounded-2xl bg-green-950 text-white px-6 py-5 text-center font-black border border-green-900 shadow-sm text-lg hover:bg-green-900"
  >
    ⛳ Update Scorecards
  </a>

  <a
    href="/events/carden-park-2026/live-leaderboard/setup"
    className="rounded-2xl bg-white text-green-950 px-6 py-5 text-center font-black border border-slate-200 shadow-sm text-lg hover:border-green-700"
  >
    ⚙️ Tournament Setup
  </a>
</div>
        <p className="text-xs text-slate-500">
          Mock data for layout testing. Live scoring will connect to Supabase next.
        </p>
      </div>
    </main>
  );
}