"use client";

import { useState } from "react";
import PageContainer from "@/components/PageContainer";

const players = [
  {
    name: "Gav",
    team: "White",
    nickname: "Mr Stableford",
    handicap: 20,
    trips: 4,
    
    bio: "One of the stronger contenders on paper if the scorecard reflects the experience. Most likely to seen examining the scorecards.",
  },
   {
    name: "Stu",
    team: "Blue",
    nickname: "The Guest of Honour",
    handicap: 28,
    trips: 4,
  
    bio: "The man of the moment as Swift Tees celebrates his big 5-0. Expect laughs, decent golf... and at least one unnecessary flop shot",
  },
 {
    name: "Paul",
    team: "Green",
    nickname: "THe Organiser",
    handicap: 24,
    trips: 5,
    
    bio: "Chief organiser of Swift Tees. Quietly climbing the golfing ranks while making sure everyone else gets there on time.",
  },
  {
    name: "Wrighty",
    team: "White",
    nickname: "The Unbothered One",
    handicap: 24,
    trips: 4,
  
    bio: "While others obsess over handicaps and leaderboards, Wrighty is simply enjoying the ride. Usually from a suspiciously smelling buggy.",
  },
  {
    name: "Carl",
    team: "White",
    nickname: "The Tinkerer",
    handicap: 28,
    trips: 1,
    
    bio: "New driver. New irons. New fitting. A good golfer never blames his tools. Carl likes to keep his options open.",
  },
  {
    name: "Adam",
    team: "White",
    nickname: "The Shark",
    handicap: 36,
    trips: 1,

    bio: "Currently residing in the lower groupings, unofficially causing a few raised eyebrows. First, and last, time as a 36 Handicap",
  },

  {
    name: "Dan",
    team: "Blue",
    nickname: "The Contender",
    handicap: 20,
    trips: 2,
    
    bio: "One of the society's genuine contenders. Quietly goes about his business while everyone else creates the drama.",
  },
  {
    name: "Liam",
    team: "Blue",
    nickname: "The Balancing Act",
    handicap: 24,
    trips: 4,
    
    bio: "Capable golfer. Capable drinker. The only question is how long will the beers help before they hinder...",
  },
 
  {
    name: "Phil",
    team: "Blue",
    nickname: "The Can Crusher",
    handicap: 36,
    trips: 1,
    wins: 1,
    bio: "First trip. Capable of hitting some decent golf shots but occasionally launches the club further than the ball. Won't let the golf get in the way of the drinking",
  },

   
  {
    name: "Painy",
    team: "Green",
    nickname: "The Options Trader",
    handicap: 20,
    trips: 4,
    
    bio: "Once the undisputed man to beat. Stil a solid golfer with a dangerous consistency... and a diary full of backup plans.",
  },
  
  {
    name: "Ian",
    team: "Green",
    nickname: "The Steady Hand",
    handicap: 28,
    trips: 4,
    
    bio: "Never flustered. Never rushed. Never far away from contention. Capable of quietly putting together a very decent score.",
  },
  {
    name: "Taz",
    team: "Green",
    nickname: "The Rookie",
    handicap: 36,
    trips: 1,
    
    bio: "New to the game and blissfully unaware of the suffering that lies ahead. Still convinced he's one swing thought away from greatness.",
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

const predictions = [
  {
    team: "White Team",
    icon: "⚪",
    rating: "⭐⭐⭐⭐☆",
    score: "8.5/10",
    text: "The White Team might be the most unpredictable side in the competition. Gav will demand nothing less than victory and will almost certainly have the points permutations worked out before the first tee shot lands. Carl arrives with the newest and most expensive equipment in the UK, hoping this is finally the set that delivers glory, while Wrighty continues to prove that even clubs older than Carl can still get the job done. Adam completes the quartet as the wildcard— capable of surprising everyone and never short on distance. If the Whites click, they'll be incredibly hard to stop. If not, expect plenty of post-round analysis... particularly from Gav and Carl.",
  },
  {
    team: "Blue Team",
    icon: "🔵",
    rating: "⭐⭐⭐⭐⭐",
    score: "9/10",
    text: "On paper, this looks like the most balanced team in the field. Dan is always a genuine contender when he's anywhere near his best, Liam quietly strings together solid rounds while pretending he hardly plays, Stu is capable of moments of brilliance but can be more interested in everyone having a great weekend, and Phil brings the social aspect and hydration to keep morale high. There isn't an obvious weakness here, making Blue a strong favourite if everyone performs to their handicap.",
  },
  {
    team: "Green Team",
    icon: "🟢",
    rating: "⭐⭐⭐⭐☆",
    score: "8/10",
    text: "The Green Team may not make the biggest noise before the weekend, but don't be fooled. Painy remains one of the society's steadiest golfers, Paul has quietly improved in the last couple of years, and ca nput a score together while Ian offers calm consistency and rarely lets the occasion get to him. Taz rounds things off with some beginners innocence, endless optimism and the belief that one good swing might just unlock his golf forever. This team feels like the dark horse—less drama, plenty of encouragement, and every chance of quietly climbing the leaderboard while everyone else is watching the favourites.",
  },
];



export default function CardenParkEventPage() {
  const [openPlayers, setOpenPlayers] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
 const [openPredictions, setOpenPredictions] = useState(false);

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
                Carden Park July 2026
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
    onClick={() => setOpenPredictions(!openPredictions)}
    className="w-full flex items-center justify-between text-left"
  >
    <div>
      <p className="text-green-700 text-sm font-bold">Preview</p>
      <h2 className="text-2xl font-black text-green-950">
        The Predictions
      </h2>
    </div>

    <span className="text-2xl font-black text-green-950">
      {openPredictions ? "−" : "+"}
    </span>
  </button>

  {openPredictions && (
    <div className="mt-4 space-y-3">
      {predictions.map((prediction) => (
        <div
          key={prediction.team}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-green-950">
                {prediction.icon} {prediction.team}
              </h3>

              <p className="mt-1 text-sm font-black text-amber-500">
                {prediction.rating}
                <span className="ml-2 text-slate-500">
                  {prediction.score}
                </span>
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {prediction.text}
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

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {players
              .filter((player) => player.team === team)
              .map((player) => (
                <div
                  key={player.name}
                  className={`rounded-2xl border p-4 ${
  team === "White"
    ? "border-slate-200 bg-slate-50"
    : team === "Blue"
    ? "border-blue-200 bg-blue-50"
    : "border-green-200 bg-green-50"
}`}
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

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <p className="text-[12px] text-slate-500">HCP</p>
                          <p className="font-black text-green-950">
                            {player.handicap}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <p className="text-[12px] text-slate-500">Trips</p>
                          <p className="font-black text-green-950">
                            {player.trips}
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