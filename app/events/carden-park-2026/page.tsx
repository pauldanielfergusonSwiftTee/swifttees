"use client";

import { useState } from "react";
import PageContainer from "@/components/PageContainer";

const players = [
  {
    name: "Gav",
    team: "White",
    nickname: "The Athlete",
    handicap: 20,
    trips: 4,
    wins: 1,
    bio: "One of the stronger contenders on paper if the scorecard reflects the experience and confidence",
  },
  {
    name: "Wrighty",
    team: "White",
    nickname: "The Unbothered One",
    handicap: 24,
    trips: 3,
    wins: 1,
    bio: "While others obsess over handicaps and leaderboards, Wrighty is simply enjoying the ride. Usually from a buggy that can be identified by smell.",
  },
  {
    name: "Carl",
    team: "White",
    nickname: "The Tinkerer",
    handicap: 28,
    trips: 4,
    wins: 1,
    bio: "New driver. New irons. New fitting. New putter. A good golfer never blames his tools. Carl likes to keep his options open.",
  },
  {
    name: "Adam",
    team: "White",
    nickname: "The Shark",
    handicap: 36,
    trips: 2,
    wins: 1,
    bio: "Currently residing in the lower groupings, but sandbagging rumours persist. First and Last time as a 36 Handicap",
  },

  {
    name: "Dan",
    team: "Blue",
    nickname: "Mr Birkdale",
    handicap: 20,
    trips: 4,
    wins: 1,
    bio: "Dan has played Royal Birkdale.",
  },
  {
    name: "Liam",
    team: "Blue",
    nickname: "The Balancing Act",
    handicap: 24,
    trips: 4,
    wins: 1,
    bio: "Capable golfer. Capable drinker. Big question is how long will the Madri help before it hinders...",
  },
  {
    name: "Stu",
    team: "Blue",
    nickname: "The Guest of Honour",
    handicap: 28,
    trips: 4,
    wins: 1,
    bio: "This year's trip is all about Stu's 50th Will he be using his signature flop shot out (yes he will)",
  },
  {
    name: "Phil",
    team: "Blue",
    nickname: "The Can Crusher",
    handicap: 36,
    trips: 1,
    wins: 1,
    bio: "First trip. Capable of hitting some very decent golf shots but occasionally launches  the club further than the ball",
  },

  {
    name: "Painy",
    team: "Green",
    nickname: "The Options Trader",
    handicap: 20,
    trips: 4,
    wins: 1,
    bio: "A solid golfer with a dangerous consistency. Maker of multiple plans. ",
  },
  {
    name: "Paul",
    team: "Green",
    nickname: "What Does He Do?",
    handicap: 24,
    trips: 4,
    wins: 1,
    bio: "Who knows what he actually does. What we do know is that he spends an alarming amount of time organising golf trips",
  },
  {
    name: "Ian",
    team: "Green",
    nickname: "The Silent Threat",
    handicap: 28,
    trips: 4,
    wins: 1,
    bio: "Never flustered. Never rushed. Never out of contention. Can quietly put together a serious score.",
  },
  {
    name: "Taz",
    team: "Green",
    nickname: "The Rookie",
    handicap: 36,
    trips: 0,
    wins: 0,
    bio: "New to the game and blissfully unaware of the suffering that lies ahead. Shandy Drinker.",
  },
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
 

  return (
   
  <PageContainer className="md:px-8">
    <div className="max-w-5xl mx-auto">
       

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
                Carden Park Sep 2026
              </h1>

             
            </div>
          </div>
        </section>

<section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
 <h2 className="mb-3 text-2xl font-black text-green-950">
    The Weekend
  </h2>
  

  <div className="space-y-3">
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-green-700">Sunday 26 July</p>
      <p className="font-black text-green-950">Cheshire Course · 13:10</p>
    </div>

    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-green-700">Monday 27 July</p>
      <p className="font-black text-green-950">Nicklaus Course · 12:25</p>
    </div>

    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-green-700">Format</p>
      <p className="font-black text-green-950">12 golfers · 3 teams · 2 rounds</p>
    </div>
  </div>
</section>
        
<section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
  <p className="text-sm font-bold text-green-700">Carden Cup</p>

  <h2 className="mb-3 text-2xl font-black text-green-950">
    The Teams
  </h2>

  <div className="grid gap-3">
    {teams.map((team) => (
      <div
        key={team.name}
        className={`rounded-2xl border p-3 ${team.colour}`}
      >
        <p className="font-black">{team.name}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {team.players.split(" • ").map((player) => (
            <span
              key={player}
              className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm"
            >
              {player}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
</section>
        

        

        

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 mb-4">
  <button
    onClick={() => setOpenPlayers(!openPlayers)}
    className="w-full flex items-center justify-between text-left"
  >
    <div>
      <p className="text-green-700 text-sm font-bold">Squad</p>
      <h2 className="text-2xl font-black text-green-950">
        The Lads
      </h2>
    </div>

    <span className="text-2xl font-black text-green-950">
      {openPlayers ? "−" : "+"}
    </span>
  </button>

  {openPlayers && (
    <div className="mt-4 space-y-6">
      {["White", "Blue", "Green"].map((team) => (
        <div key={team}>
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                team === "White"
                  ? "bg-slate-400"
                  : team === "Blue"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}
            />

            <h3 className="text-lg font-black text-green-950">
              {team} Team
            </h3>
          </div>

          <div className="space-y-3">
            {players
              .filter((player) => player.team === team)
              .map((player) => (
                <div
                  key={player.name}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-950 text-2xl font-black text-white">
                      {player.name.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-black uppercase text-green-700">
                        {player.nickname}
                      </p>

                      <h3 className="text-2xl font-black text-green-950">
                        {player.name}
                      </h3>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <p className="text-[10px] text-slate-500">HCP</p>
                          <p className="font-black text-green-950">
                            {player.handicap}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <p className="text-[10px] text-slate-500">Trips</p>
                          <p className="font-black text-green-950">
                            {player.trips}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <p className="text-[10px] text-slate-500">Wins</p>
                          <p className="font-black text-green-950">
                            {player.wins}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {player.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )}
</section>

       <section className="mb-4 rounded-3xl bg-green-950 text-white p-4 md:p-6">
         


          <div className="grid grid-cols-1 gap-3">
            <a
              href="/match-centre"
              className="rounded-2xl bg-white text-green-950 px-5 py-4 text-center font-black text-lg"
            >
              🏆 Live Leaderboard
            </a>

            <a
              href="/events/carden-park-2026/live-leaderboard/live-scoring"
              className="rounded-2xl bg-green-500 text-white px-5 py-4 text-center font-black text-lg"
            >
              ⛳ Live Scorecards
            </a>

           
          </div>
        </section>
      </div>
     </PageContainer>
  );
}