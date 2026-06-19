const players = [
  {
    name: "Paul",
    handicap: 12,
    nickname: "The Developer",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Usually has more tabs open than fairways hit.",
  },
  {
    name: "Ian",
    handicap: 12,
    nickname: "The Veteran",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Knows every trick in the book. Claims none of them work.",
  },
  {
    name: "Liam",
    handicap: 12,
    nickname: "The Enforcer",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Always in the mix when bragging rights are on the line.",
  },
  {
    name: "Carl",
    handicap: 12,
    nickname: "Fairway Finder",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Less drama, more golf.",
  },
  {
    name: "Adam",
    handicap: 12,
    nickname: "Steady Eddie",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Rarely spectacular. Rarely terrible.",
  },
  {
    name: "Wrighty",
    handicap: 12,
    nickname: "The Showman",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Capable of shots nobody else would attempt.",
  },
  {
    name: "Gav",
    handicap: 12,
    nickname: "The Grinder",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Never out of a competition.",
  },
  {
    name: "Flip",
    handicap: 12,
    nickname: "The Maverick",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "The expected route is rarely the chosen route.",
  },
  {
    name: "Dan",
    handicap: 12,
    nickname: "The Technician",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Believes every bad shot has a technical explanation.",
  },
  {
    name: "Taz",
    handicap: 12,
    nickname: "Chaos Theory",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Anything can happen. Usually does.",
  },
  {
    name: "Stu",
    handicap: 12,
    nickname: "Captain Chaos",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "A danger to leaderboards and blood pressure.",
  },
  {
    name: "Painy",
    handicap: 12,
    nickname: "The Survivor",
    wins: 1,
    nearestPins: 0,
    longDrives: 0,
    bio: "Still standing. Somehow.",
  },
];

export default function PlayersPage() {
  return (
    <main className="min-h-screen bg-green-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-300 text-sm">
          ← Back to home
        </a>

        <h1 className="text-6xl font-black mt-6 mb-2">Players</h1>

        <p className="text-green-300 mb-10">
          The Swift Tees squad. Handicaps disputed. Bios heavily biased.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {players.map((player) => (
            <div
              key={player.name}
              className="bg-green-900 rounded-2xl p-6 border border-green-800"
            >
              <div className="h-24 w-24 rounded-full bg-green-800 border border-green-700 flex items-center justify-center text-3xl font-black mb-5">
                {player.name.charAt(0)}
              </div>

              <p className="text-green-300 text-sm font-bold mb-1">
                {player.nickname}
              </p>

              <h2 className="text-2xl font-black mb-4">{player.name}</h2>

              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div className="rounded-xl bg-green-950/60 p-3">
                  <p className="text-green-300">Handicap</p>
                  <p className="text-xl font-bold">{player.handicap}</p>
                </div>

                <div className="rounded-xl bg-green-950/60 p-3">
                  <p className="text-green-300">Wins</p>
                  <p className="text-xl font-bold">{player.wins}</p>
                </div>

                <div className="rounded-xl bg-green-950/60 p-3">
                  <p className="text-green-300">Nearest Pins</p>
                  <p className="text-xl font-bold">{player.nearestPins}</p>
                </div>

                <div className="rounded-xl bg-green-950/60 p-3">
                  <p className="text-green-300">Long Drives</p>
                  <p className="text-xl font-bold">{player.longDrives}</p>
                </div>
              </div>

              <p className="text-green-100 text-sm leading-6">{player.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}