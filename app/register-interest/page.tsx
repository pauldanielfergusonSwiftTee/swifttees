"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Registration = {
  id: number;
  player_name: string;
  status: "going" | "maybe" | "cant_make_it";
};

const players = [
  "Paul",
  "Ian",
  "Liam",
  "Carl",
  "Adam",
  "Wrighty",
  "Gav",
  "Flip",
  "Dan",
  "Taz",
  "Stu",
  "Painy",
  "Phil",
  "Big John",
  "Chris Mc",
  "Alistair",
  "Rick",
  "Chris W",
];

export default function RegisterInterestPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"going" | "maybe" | "cant_make_it">(
    "going"
  );
  const [registered, setRegistered] = useState<Registration[]>([]);

  const going = registered.filter((p) => p.status === "going");
  const maybe = registered.filter((p) => p.status === "maybe");
  const cantMakeIt = registered.filter((p) => p.status === "cant_make_it");

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("trip_interest")
      .select("id, player_name, status")
      .eq("trip_id", 1)
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setRegistered((data || []) as Registration[]);
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function registerInterest() {
    if (!name) return;

    const existing = registered.find((player) => player.player_name === name);

    if (existing) {
      const { error } = await supabase
        .from("trip_interest")
        .update({ status })
        .eq("id", existing.id);

      if (error) {
        alert("Error updating");
        console.log(error);
        return;
      }
    } else {
      const { error } = await supabase.from("trip_interest").insert([
        {
          trip_id: 1,
          player_name: name,
          status,
        },
      ]);

      if (error) {
        alert("Error registering");
        console.log(error);
        return;
      }
    }

    setName("");
    setStatus("going");
    loadRegistrations();
  }

  async function removeInterest(id: number) {
    const { error } = await supabase
      .from("trip_interest")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error removing");
      console.log(error);
      return;
    }

    loadRegistrations();
  }

  function StatusGroup({
    title,
    players,
    emptyText,
  }: {
    title: string;
    players: Registration[];
    emptyText: string;
  }) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <h3 className="font-black text-green-950 mb-3">
          {title} ({players.length})
        </h3>

        {players.length === 0 ? (
          <p className="text-slate-500 text-sm">{emptyText}</p>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              >
                <span className="font-bold">{player.player_name}</span>

                <button
                  onClick={() => removeInterest(player.id)}
                  className="text-sm font-bold text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mt-6">
          <p className="text-green-700 font-bold mb-2">Upcoming Trip</p>

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-green-950">
            September 2026 Weekend
          </h1>

          <p className="mb-8 text-slate-600">
            Let everyone know where you stand for the next Swift Tees trip.
          </p>

          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 mb-4"
          >
            <option value="">Select player</option>
            {players.map((player) => (
              <option key={player}>{player}</option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setStatus("going")}
              className={`rounded-xl p-3 font-bold border ${
                status === "going"
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              Going
            </button>

            <button
              onClick={() => setStatus("maybe")}
              className={`rounded-xl p-3 font-bold border ${
                status === "maybe"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              Maybe
            </button>

            <button
              onClick={() => setStatus("cant_make_it")}
              className={`rounded-xl p-3 font-bold border ${
                status === "cant_make_it"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              Can't
            </button>
          </div>

          <button
            onClick={registerInterest}
            className="w-full bg-green-950 text-white rounded-xl p-3 font-bold"
          >
            Save Response
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <StatusGroup
            title="✅ Going"
            players={going}
            emptyText="Nobody brave enough yet."
          />

          <StatusGroup
            title="🤔 Maybe"
            players={maybe}
            emptyText="No fence sitters yet."
          />

          <StatusGroup
            title="❌ Can't Make It"
            players={cantMakeIt}
            emptyText="No absentees yet."
          />
        </div>
      </div>
    </main>
  );
}
