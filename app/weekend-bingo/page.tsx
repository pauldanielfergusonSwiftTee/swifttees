"use client";

import { useEffect, useState } from "react";

const bingoSquares = [
  "Driver loft adjustment",
  "Can Crushed on a Tee Box",
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
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("swifttees-bingo");

    if (saved) {
      setChecked(JSON.parse(saved));
    }
  }, []);

  function toggleSquare(square: string) {
    let updated: string[];

    if (checked.includes(square)) {
      updated = checked.filter((item) => item !== square);
    } else {
      updated = [...checked, square];
    }

    setChecked(updated);
    localStorage.setItem(
      "swifttees-bingo",
      JSON.stringify(updated)
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <h1 className="text-5xl md:text-6xl font-black mt-6 mb-2">
          Weekend Bingo
        </h1>

        <p className="text-slate-600 mb-2">
          No names needed. Everyone knows.
        </p>

        <p className="font-bold text-green-700 mb-8">
          {checked.length} / {bingoSquares.length} completed
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bingoSquares.map((square) => {
            const isChecked = checked.includes(square);

            return (
              <button
                key={square}
                onClick={() => toggleSquare(square)}
                className={`min-h-32 rounded-2xl p-4 border flex items-center justify-center text-center font-bold transition-all
                  ${
                    isChecked
                      ? "bg-green-700 text-white border-green-800"
                      : "bg-white text-slate-900 border-slate-300 hover:border-green-600"
                  }`}
              >
                {isChecked ? `✅ ${square}` : square}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}