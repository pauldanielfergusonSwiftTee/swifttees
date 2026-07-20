"use client";

import { useState } from "react";
import PageContainer from "@/components/PageContainer";

const players = [
  {
    name: "Gav",
    team: "White",
    nickname: "The Competitive One",
    handicap: 20,
    trips: 4,
    
    bio: "One of the stronger contenders on paper if the scorecard reflects the talk and experience. The most likely to seen examining the scorecards.",
  },
   {
    name: "Stu",
    team: "Blue",
    nickname: "The One It's All About",
    handicap: 28,
    trips: 4,
  
    bio: "The man of the moment as Swift Tees celebrates his big 5-0. Expect laughs, decent golf... and at least one exquisite flop shot",
  },
 {
    name: "Paul",
    team: "Green",
    nickname: "The Organiser",
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
    
    bio: "Once the undisputed man to beat. Stil a solid golfer with a dangerous consistency... loves a backup plan.",
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
    text: "The White Team might be the most unpredictable side in the competition. Gav will demand nothing less than victory and will almost certainly have the points permutations worked out before the first tee shot lands. Carl arrives with the newest and most expensive golf clubs, hoping this is finally the set that delivers glory, while Wrighty continues to prove that even 20 year old hand me downs can still get the job done. Adam completes the quartet as the wildcard— capable of surprising everyone and never short on distance. If the Whites click, they'll be incredibly hard to stop. If not, expect plenty of post-round analysis... particularly from Gav and Carl.",
  },
  {
    team: "Blue Team",
    icon: "🔵",
    rating: "⭐⭐⭐⭐⭐",
    score: "9/10",
    text: "On paper, this looks like the most balanced team in the field. Dan is always a genuine contender when he's anywhere near his best, Liam quietly strings together solid rounds while pretending he hardly plays. Stu is capable of moments of brilliance and the pressure won't get to him, and Phil brings the social aspect and plenty of liquids to keep morale high. There isn't any big weaknesses here, making Blue a strong favourite if everyone performs to their handicap.",
  },
  {
    team: "Green Team",
    icon: "🟢",
    rating: "⭐⭐⭐⭐☆",
    score: "8/10",
    text: "The Green Team may not make the biggest noise before the weekend, but don't be fooled. Painy remains one of the society's steadiest golfers, Paul has quietly improved in the last couple of years, and can put a decent score together while Ian offers calm consistency and rarely lets the occasion get to him. Taz rounds things off with some beginners innocence, endless optimism and the belief that one good swing thought might just unlock his golf forever. This team feels like the dark horse —less drama, plenty of encouragement, and every chance of quietly climbing the leaderboard while everyone else is watching the favourites.",
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
                Carden Park
              </p>

              <h1 className="text-4xl md:text-7xl font-black leading-tight">
                Stu's 50th July 2026
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
      <p className="text-xs font-black uppercase text-green-700">Meeting</p>
      <p className="font-black text-green-950">Sunday 26th. 10am. Bengarth Road</p>
    </div>
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-green-700">Sunday 26 July</p>
      <p className="font-black text-green-950">Cheshire Course · First Tee 13:10</p>
    </div>

   
     <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-green-700">Monday 27 July</p>
      <p className="font-black text-green-950">Nicklaus Course · First Tee 12:25</p>
    </div>



     
  </div>
</section>
<section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
  <p className="text-sm font-bold text-green-700">
    Competition Format
  </p>

  <h2 className="mb-4 text-2xl font-black text-green-950">
    How The Weekend Works
  </h2>

  <div className="space-y-3">

    <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🤝</span>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-green-700">
            Sunday
          </p>

          <h3 className="text-lg font-black text-green-950">
            Team Scramble
          </h3>

          <p className="mt-1 text-sm text-slate-700">
            Players compete in pairs, with every hole played as a scramble.
            Stableford points are awarded to each player based on the pair's score.
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏌️</span>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">
            Monday
          </p>

          <h3 className="text-lg font-black text-green-950">
            Individual Stableford
          </h3>

          <p className="mt-1 text-sm text-slate-700">
            Everyone plays their own ball with Stableford scoring on the Nicklaus Course.
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏆</span>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Overall Winner
          </p>

          <h3 className="text-lg font-black text-green-950">
            Two Days. One Champion.
          </h3>

          <p className="mt-1 text-sm text-slate-700">
            Points earned on both days are combined to create one overall leaderboard.
            Every point matters right until the final putt on Monday.
          </p>
        </div>
      </div>
    </div>

  </div>
</section>

<section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
  <p className="text-sm font-bold text-green-700">
    Competition Rules
  </p>

  <h2 className="mb-4 text-2xl font-black text-green-950">
    Weekend Rules
  </h2>

  <div className="space-y-3">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-3xl">✍️</span>

        <div>
          <h3 className="text-lg font-black text-green-950">
            Mark Your Ball
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-700">
            All balls must be clearly marked so there is no confusion over
            whose ball is whose during either round.
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-3xl">🃏</span>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Taz Wildcard
          </p>

          <h3 className="text-lg font-black text-green-950">
            One Borrowed Drive
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-700">
            Taz may choose to use his partner&apos;s drive on any hole
            both days.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
  <p className="text-sm font-bold text-green-700">
    Food & Drink
  </p>

  <h2 className="mb-4 text-2xl font-black text-green-950">
    🍽️ Dining & Bars
  </h2>

  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
    <div className="flex items-center gap-3">
      <span className="text-3xl">🍴</span>

      <div>
        <p className="text-xs font-black uppercase tracking-wide text-red-700">
          Restaurant
        </p>

        <h3 className="text-lg font-black text-green-950">
          Redmond's Restaurant
        </h3>
      </div>
    </div>

    <div className="mt-4 space-y-3">
      <div className="flex justify-between rounded-xl bg-white px-3 py-2">
        <span className="font-bold">🥐 Breakfast</span>
        <span className="font-black text-green-900">
          7:00am – 10:00am
        </span>
      </div>

      <div className="flex justify-between rounded-xl bg-white px-3 py-2">
        <span className="font-bold">🍽️ Dinner</span>
        <span className="font-black text-green-900">
          From 6:00pm
        </span>
      </div>

      
    </div>
  </div>
</section>

<section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
  <p className="text-sm font-bold text-green-700">
    Hotel Information
  </p>

  <h2 className="mb-4 text-2xl font-black text-green-950">
    🏊 Leisure Club
  </h2>

  <div className="grid gap-3 md:grid-cols-2">
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-blue-700">
        Available Facilities
      </p>

      <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
        <li>🏊 20m Swimming Pool</li>
        <li>🔥 Sauna</li>
        <li>💨 Steam Room</li>
        <li>💦 Hydrotherapy Pool</li>
        <li>🏋️ Gym & Fitness Studios</li>
      </ul>
    </div>

    <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-green-700">
        Opening Times
      </p>

      <div className="mt-3 space-y-3">
        <div className="flex justify-between rounded-xl bg-white px-3 py-2">
          <span className="font-bold">Mon – Fri</span>
          <span className="font-black text-green-900">
            6:30am – 9:00pm
          </span>
        </div>

        <div className="flex justify-between rounded-xl bg-white px-3 py-2">
          <span className="font-bold">Sat – Sun</span>
          <span className="font-black text-green-900">
            7:00am – 8:00pm
          </span>
        </div>

        
      </div>
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
              href="/live-centre"
              className="rounded-2xl bg-white text-green-950 px-5 py-4 text-center font-black text-lg"
            >
              🏆 Live Leaderboard
            </a>

            <a
              href="/live-scoring-v2"
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