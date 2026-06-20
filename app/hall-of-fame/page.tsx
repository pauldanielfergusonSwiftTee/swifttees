const awards = [
   {
    icon: "🏌️",
    title: "Most Trips Attended",
    winner: "TBC",
    description: "Elite commitment to the cause.",
  },
    {
    icon: "🏆",
    title: "Society Champion",
    winner: "TBC",
    description: "Current holder of the bragging rights.",
  },
 
  {
    icon: "🎯",
    title: "Nearest Pin King",
    winner: "TBC",
    description: "Most likely to accidentally hit a good iron shot.",
  },
  {
    icon: "🚀",
    title: "Long Drive King",
    winner: "TBC",
    description: "Big stick energy. Accuracy not guaranteed.",
  },
  {
    icon: "🌲",
    title: "Most Lost Balls",
    winner: "TBC",
    description: "Doing their bit for the local wildlife.",
  },
  {
    icon: "🍺",
    title: "Social Secretary",
    winner: "TBC",
    description: "Sets the pace early. Often too early.",
  },
];

export default function HallOfFamePage() {
  return (
    <main className="min-h-screen bg-green-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-300 text-sm">← Back to home</a>

        <h1 className="text-6xl font-black mt-6 mb-2">Hall of Fame</h1>

        <p className="text-green-300 mb-10">
          Glory, shame and highly questionable achievements.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {awards.map((award) => (
            <div
              key={award.title}
              className="rounded-2xl bg-green-900 p-6 border border-green-800"
            >
              <p className="text-5xl mb-4">{award.icon}</p>
              <h2 className="text-2xl font-black mb-2">{award.title}</h2>
              <p className="text-green-300 font-bold mb-3">{award.winner}</p>
              <p className="text-green-100 text-sm leading-6">
                {award.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}