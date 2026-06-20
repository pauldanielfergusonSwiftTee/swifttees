const bingoSquares = [
  "Driver loft adjustment",
  "Can of squash on the tee",
  "Birkdale gets mentioned",
  "Unnecessary flop shot attempted",
  "Someone says they haven't played much",
  "Club travels further than the ball",
  "Buggy parked somewhere questionable",
  "Handicap complaints begin",
  "Ball found that definitely isn't theirs",
  "New club/fitting discussion",
  "Guinness before midday",
  "Lost ball found in the fairway",
  "One more drink becomes three",
  "Someone claims they are not bothered about winning",
  "Emergency swing tip on the tee",
  "Shot tracker disagrees with reality",
];

export default function WeekendBingoPage() {
  return (
    <main className="min-h-screen bg-green-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-300 text-sm">← Back to home</a>

        <h1 className="text-6xl font-black mt-6 mb-2">Weekend Bingo</h1>

        <p className="text-green-300 mb-10">
          No names needed. Everyone knows.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bingoSquares.map((square) => (
            <div
              key={square}
              className="min-h-32 rounded-2xl bg-green-900 p-4 border border-green-800 flex items-center justify-center text-center font-bold"
            >
              {square}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}