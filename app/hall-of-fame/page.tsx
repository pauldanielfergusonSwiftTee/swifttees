import PageContainer from "@/components/PageContainer";

const awards = [
  
  {
    icon: "🏆",
    title: "Society Champion",
    winner: "TBC",
    description: "Current holder of the bragging rights. Crowned at the end of each season as the overall Swift Tees champion. The biggest prize in the society",
  },
  {
    icon: "🎯",
    title: "Nearest Pin King",
    winner: "TBC",
    description: "Precision under pressure. Awarded to the player with the most Nearest the Pin victories.",
  },
  {
    icon: "🚀",
    title: "Long Drive King",
    winner: "TBC",
    description: "Given to the golfer who dominates the Long Drive challenges throughout the season. Power helps. Fairways help more.",
  },
  {
  icon: "🔥",
  title: "Hot Streak",
  winner: "TBC",
  description:
    "Awarded to the player with the longest run of scoring holes during the season. When the momentum builds, everybody else is chasing.",
},
{
  icon: "📈",
  title: "Biggest Climber",
  winner: "TBC",
  description:
    "Awarded to the player who gained the most places on the leaderboard during a single event. Never out of the fight.",
},
  {
    icon: "🍺",
    title: "Social Secretary",
    winner: "TBC",
    description: "Celebrating the player who keeps spirits high throughout the weekend, both on and off the course.",
  },
  {
    icon: "🏌️",
    title: "Most Trips Attended",
    winner: "TBC",
    description: "Elite commitment to the cause. Awarded to the golfer with the highest number of Swift Tees weekends attended. Loyalty, commitment and questionable life choices rewarded.",
  },
];

export default function HallOfFamePage() {
  return (
    <PageContainer>
      <a href="/" className="text-sm font-bold text-green-700">
        ← Back to home
      </a>

      <h1 className="mt-6 text-5xl font-black text-green-950">
        🏛️ Hall of Fame
      </h1>

      <p className="mt-2 mb-8 text-slate-600">
        Glory, legends and highly questionable achievements from Swift Tees history.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {awards.map((award) => (
          <div
            key={award.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
              {award.icon}
            </div>

            <h2 className="text-2xl font-black text-green-950">
              {award.title}
            </h2>

            <p className="mt-2 font-bold text-green-700">
              {award.winner}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {award.description}
            </p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}