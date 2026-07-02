"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { getPlayers } from "@/lib/players";
import { getScores } from "@/lib/scores";

const EVENT_SLUG = "carden-park-2026";

type LeaderboardRow = {
  pos: number;
  id: number;
  name: string;
  points: number;
  through: number;
  movement: string;
  highlight: string;
};

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

type TeamStanding = {
  team: string;
  points: number;
  through: number;
  icon: string;
};

function movementStyle(movement: string) {
  if (movement === "▲") return "text-green-700";
  if (movement === "▼") return "text-red-600";
  return "text-slate-400";
}

export default function MatchCentrePage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([]);
useEffect(() => {
  async function loadLeaderboard() {
    const [players, scores] = await Promise.all([
      getPlayers(),
      getScores(EVENT_SLUG),
    ]);
console.log("MATCH CENTRE PLAYERS:", players);
console.log("MATCH CENTRE SCORES:", scores);
    const stablefordScores = scores.filter(
      (score: any) => score.score_type === "stableford" && score.player_id
    );

    const rows = players.map((player: any) => {
      const playerScores = stablefordScores.filter(
        (score: any) => Number(score.player_id) === Number(player.id)
      );

      return {
        id: player.id,
        name: player.name,
        team: player.team,
        points: playerScores.reduce(
          (total: number, score: any) => total + Number(score.points ?? 0),
          0
        ),
        through:
          playerScores.length > 0
            ? Math.max(...playerScores.map((score: any) => Number(score.hole_number)))
            : 0,
        movement: "—",
        highlight: "",
      };
    });

    rows.sort((a, b) => b.points - a.points || b.through - a.through);

    setLeaderboard(
      rows.map((player, index) => ({
        ...player,
        pos: index + 1,
      }))
    );
    const teams = rows.reduce((acc: Record<string, TeamStanding>, player: any) => {
  if (!acc[player.team]) {
    acc[player.team] = {
      team: player.team,
      points: 0,
      through: 0,
      icon: "",
    };
  }

  acc[player.team].points += player.points;
  acc[player.team].through = Math.max(acc[player.team].through, player.through);

  return acc;
}, {});

const sortedTeams = Object.values(teams)
  .sort((a, b) => b.points - a.points)
  .map((team, index) => ({
    ...team,
    icon: index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉",
  }));

setTeamStandings(sortedTeams);
  }

  loadLeaderboard();
}, []);
  
  return (
    <PageContainer className="bg-slate-100 text-slate-900">
      <section className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-green-300">
          🔥 Match Hub - Carden Park
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Latest Scores
        </h1>

       
      </section>

    

     <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
  <div className="grid grid-cols-3 gap-2">
    {teamStandings.map((team) => (
      <div
        key={team.team}
        className="rounded-xl bg-slate-50 py-2 text-center"
      >
        <div className="text-base">{team.icon}</div>

        <div className="text-[10px] font-black uppercase text-green-950">
          {team.team}
        </div>

        <div className="text-lg font-black text-green-950 leading-none">
          {team.points}
        </div>

        <div className="mt-0.5 text-[10px] font-semibold text-slate-900">
    Thru {team.through}
  </div>
      </div>
    ))}
  </div>
</section>

 

   <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">

  <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
    <p className="text-[10px] font-black uppercase tracking-wide text-green-700">
      🚨 BREAKING NEWS
    </p>

    <p className="mt-0.5 text-sm font-black leading-snug text-green-950">
      Gav's birdie on 7 cuts Paul's lead to one point.
    </p>
  </div>

  <div className="mt-3 flex items-center justify-between">
    <h2 className="text-lg font-black text-green-950">
      🎙️ Live Feed
    </h2>

    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
      LIVE
    </span>
  </div>

  <div className="mt-2 space-y-2">
    {commentary.slice(0, 4).map((item, index) => (
      <div
        key={index}
        className="flex gap-3 rounded-xl bg-slate-50 px-3 py-2"
      >
        <span className="min-w-14 text-[10px] font-bold text-slate-400">
          {item.time}
        </span>

        <p className="text-xs leading-5 text-slate-700">
          {item.text}
        </p>
      </div>
    ))}
  </div>
</section>

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
         <h2 className="text-xl font-black text-green-950">
            🏆 Live Leaderboard
          </h2>

         
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
  <p className="text-xs font-semibold text-slate-500">
    Thru {player.through} holes
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

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
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

      <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-black text-green-950">
          📝 Live Scoring
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          For nominated scorers only. Enter hole-by-hole scores for your group.
        </p>

        <Link
          href="/events/carden-park-2026/live-leaderboard/live-scoring"
          className="mt-3 flex w-full items-center justify-center rounded-2xl bg-green-700 px-5 py-3.5 text-base font-black text-white"
        >
          Enter Scoring →
        </Link>
      </section>
    </PageContainer>
  );
}