import PageContainer from "@/components/PageContainer";

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
    <PageContainer className="bg-green-950 text-white">
      <a href="/" className="text-green-300 text-sm">
        ← Back to home
      </a>

      <h1 className="mt-6 mb-2 text-6xl font-black">
        🏛️ Hall of Fame
      </h1>

      <p className="mb-10 text-green-300">
        Glory, shame and highly questionable achievements.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {awards.map((award) => (
          <div
            key={award.title}
            className="rounded-2xl border border-green-800 bg-green-900 p-6"
          >
            <p className="mb-4 text-5xl">{award.icon}</p>

            <h2 className="mb-2 text-2xl font-black">
              {award.title}
            </h2>

            <p className="mb-3 font-bold text-green-300">
              {award.winner}
            </p>

            <p className="text-sm leading-6 text-green-100">
              {award.description}
            </p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}