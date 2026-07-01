import PageContainer from "@/components/PageContainer";

export default function LeaderboardPage() {
  return (
  <PageContainer>
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <h1 className="text-4xl md:text-6xl font-black mt-6 mb-2 text-green-950">
           🏆 Overall Leaderboard
        </h1>

        <p className="text-slate-600 mb-8">
          The official society leaderboard will begin from Carden Park 2026.
          Previous trips remain part of Swift Tees history, but points start here.
        </p>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
          <p className="text-green-700 font-bold text-sm mb-2">
            Starting July 2026
          </p>

          <h2 className="text-3xl font-black text-green-950 mb-3">
            Overall Society Standings
          </h2>

          <p className="text-slate-600 leading-7">
            Once Carden Park begins, this page will track total points across all
            Swift Tees events going forward.
          </p>
        </section>

        <a
          href="/events/carden-park-2026"
          className="block rounded-3xl bg-green-950 text-white border border-green-900 shadow-sm p-6 hover:bg-green-900 transition"
        >
          <p className="text-sm font-bold text-green-100 mb-2">Next Event</p>

          <h2 className="text-3xl font-black mb-3">Carden Park 2026</h2>

          <p className="text-green-100 leading-7">
            View the next event page, including registration, scoring and live
            leaderboard setup.
          </p>

          <p className="mt-5 text-sm font-bold">View event →</p>
        </a>
     
     </PageContainer>
  );
}