"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type BingoSquare = {
  id: number;
  text: string;
  is_checked: boolean;
};

export default function WeekendBingoPage() {
  const [squares, setSquares] = useState<BingoSquare[]>([]);
  const completed = squares.filter((square) => square.is_checked).length;

  async function loadSquares() {
    const { data, error } = await supabase
      .from("bingo_squares")
      .select("id, text, is_checked")
      .order("id", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setSquares(data || []);
  }

  useEffect(() => {
    loadSquares();
  }, []);

  async function toggleSquare(square: BingoSquare) {
    const { error } = await supabase
      .from("bingo_squares")
      .update({ is_checked: !square.is_checked })
      .eq("id", square.id);

    if (error) {
      alert("Could not update bingo square");
      console.log(error);
      return;
    }

    loadSquares();
  }

  async function resetBingo() {
    const confirmReset = confirm("Reset all bingo squares?");

    if (!confirmReset) return;

    const { error } = await supabase
      .from("bingo_squares")
      .update({ is_checked: false })
      .neq("id", 0);

    if (error) {
      alert("Could not reset bingo");
      console.log(error);
      return;
    }

    loadSquares();
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-6 mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-2 text-green-950">
              Weekend Bingo
            </h1>

            <p className="text-slate-600">
              No names needed. Everyone knows.
            </p>

            <p className="font-bold text-green-700 mt-2">
              {completed} / {squares.length} completed
            </p>
          </div>

          <button
            onClick={resetBingo}
            className="rounded-full border border-red-300 text-red-700 px-5 py-3 font-bold bg-white hover:bg-red-50"
          >
            Reset Bingo
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {squares.map((square) => (
            <button
              key={square.id}
              onClick={() => toggleSquare(square)}
              className={`min-h-32 rounded-2xl p-4 border flex items-center justify-center text-center font-bold transition-all ${
                square.is_checked
                  ? "bg-green-700 text-white border-green-800"
                  : "bg-white text-slate-900 border-slate-300 hover:border-green-600"
              }`}
            >
              {square.is_checked ? `✅ ${square.text}` : square.text}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}