export default function PlayersPage() {
  const players = [
    {
  name: "Paul",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
{
  name: "Ian",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
   {
  name: "Liam",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
       {
  name: "Carl",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
     {
  name: "Adam",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
   {
  name: "Wrighty",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
       {
  name: "Gav",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
   {
  name: "Flip",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
      {
  name: "Dan",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
   {
  name: "Taz",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
      {
  name: "Stu",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
   {
  name: "PainyLiam",
  handicap: 12,
  nickname: "The Developer",
  wins: 1,
},
    
    
  ];

  return (
    <main className="min-h-screen bg-green-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-6xl font-bold mb-2">
          Players
        </h1>

        <p className="text-green-300 mb-10">
          The Swift Tees squad.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {players.map((player) => (
            <div
              key={player.name}
              className="bg-green-900 rounded-2xl p-6 border border-green-800"
            >
              <h2 className="text-2xl font-bold mb-2">
                {player.name}
              </h2>

              <p className="text-green-200">
                Handicap: {player.handicap}
              </p>
<p className="text-green-200">
  Nickname: {player.nickname}
</p>

<p className="text-green-200">
  Society Wins: {player.wins}
</p>
              <p className="mt-4 text-sm text-green-300">
                Profile coming soon...
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}