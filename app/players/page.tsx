const players = [
  {
    name: "Dan",
    handicap: 20,
    trips: 4,
    nickname: "Mr Birkdale",
    wins: 1,
    bio: "If conversation stalls for more than thirty seconds, don't worry. Dan has either played Royal Birkdale, visited Royal Birkdale or at the very least stood in the pro shop at Royal Birkdale. A man determined to ensure nobody forgets this fact.",
  },
   {
    name: "Gav",
    handicap: 20,
    trips: 4,
    nickname: "The Athlete",
    wins: 1,
    bio: "When not playing golf, Gav can usually be found lifting something heavy or voluntarily doing burpees for reasons nobody fully understands. One of the stronger contenders on paper if the scorecard reflects the experience.",
  },
  {
    name: "Painy",
    handicap: 20,
    trips: 4,
    nickname: "The Options Trader",
    wins: 1,
    bio: "A solid golfer with a dangerous combination of talent and flexibility. Painy rarely commits to a plan when he can create three alternatives and decide later. Always in contention. Always has options.",
  },

  {
    name: "Paul",
    handicap: 24,
    trips: 4,
    nickname: "The Mystery Man",
    wins: 1,
    bio: "Nobody is entirely sure what Paul actually does. Rumours range from software developer to international man of mystery. What we do know is that he spends an alarming amount of time organising golf trips, building websites and convincing himself his latest swing thought is the one.",
  },
  
  {
    name: "Liam",
    handicap: 24,
    trips: 4,
    nickname: "The Balancing Act",
    wins: 1,
    bio: "A very capable golfer faced with a weekly dilemma: will the Madri help? Will the IPA help? Will another one help? The answer changes regularly, but confidence rarely does.",
  },
   {
    name: "Wrighty",
    handicap: 24,
    trips: 3,
    nickname: "The Unbothered One",
    wins: 1,
    bio: "A man who has achieved golfing enlightenment. While others obsess over handicaps and leaderboards, Wrighty is simply enjoying the ride. Usually from a buggy that can be identified from several fairways away.",
  },
  {
    name: "Ian",
    handicap: 28,
    trips: 4,
    nickname: "The Silent Threat",
    wins: 1,
    bio: "Never flustered. Never rushed. Never out of contention. On his day Ian might be the strongest golfer in his group and has the game to quietly put together a serious score while everyone else is distracted.",
  },
  {
    name: "Carl",
    handicap: 28,
    trips: 4,
    nickname: "The Tinkerer",
    wins: 1,
    bio: "A firm believer that the next club purchase will finally unlock golfing greatness. New driver. New irons. New fitting. New putter. A good golfer never blames his tools. Carl likes to keep his options open.",
  },
   {
    name: "Stu",
    handicap: 28,
    trips: 4,
    nickname: "The Guest of Honour",
    wins: 1,
    bio: "This year's trip is all about Stu's 50th. A lover of the flop shot, Stu firmly believes there is no situation that cannot be improved by opening the clubface and attempting something ridiculous. Either way, he's trying it.",
  },
  {
    name: "Adam",
    handicap: 36,
    trips: 2,
    nickname: "The Sleeper",
    wins: 1,
    bio: "Currently residing in the lower groupings, but rumours persist. The old golf bag, the relaxed demeanour and the modest expectations all point to a harmless participant. Which is exactly why nobody trusts him.",
  },
 
 
  {
    name: "Flip",
    handicap: 36,
    trips: 1,
    nickname: "The Wildcard",
    wins: 1,
    bio: "First trip. Unknown quantity. Capable of hitting some very decent golf shots and occasionally launching a club further than the ball. If he gets going there could be plenty of points available from his group.",
  },

  {
    name: "Taz",
    handicap: 36,
    trips: 1,
    nickname: "The Rookie",
    wins: 1,
    bio: "New to the game and blissfully unaware of the suffering that lies ahead. Every society needs a wildcard and Taz arrives with the unique advantage of having no bad habits... yet.",
  },
 

];

export default function PlayersPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <h1 className="text-6xl font-black mt-6 mb-2 text-green-950">
          Players
        </h1>

        <p className="text-slate-600 mb-10">
          The Swift Tees squad. Handicaps disputed. Bios heavily biased.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {players.map((player) => (
            <div
              key={player.name}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
            >
              <div className="h-24 w-24 rounded-full bg-green-950 text-white flex items-center justify-center text-3xl font-black mb-5">
                {player.name.charAt(0)}
              </div>

              <p className="text-green-700 text-sm font-bold mb-1">
                {player.nickname}
              </p>

              <h2 className="text-2xl font-black mb-4 text-green-950">
                {player.name}
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <p className="text-slate-500">Handicap</p>
                  <p className="text-xl font-bold text-green-950">
                    {player.handicap}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <p className="text-slate-500">Trips</p>
                  <p className="text-xl font-bold text-green-950">
                    {player.trips}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <p className="text-slate-500">Wins</p>
                  <p className="text-xl font-bold text-green-950">
                    {player.wins}
                  </p>
                </div>
              </div>

              <p className="text-slate-700 text-sm leading-6">{player.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}