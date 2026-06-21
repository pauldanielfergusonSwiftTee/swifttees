"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Registration = {
  id: number;
  player_name: string;
};

export default function RegisterInterestPage() {
  const [name, setName] = useState("");
  const [registered, setRegistered] = useState<Registration[]>([]);

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("trip_interest")
      .select("id, player_name")
      .eq("trip_id", 1)
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setRegistered(data || []);
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function registerInterest() {
    if (!name) return;

    const alreadyRegistered = registered.some(
      (player) => player.player_name === name
    );

    if (alreadyRegistered) {
      alert(`${name} is already registered.`);
      return;
    }

    const { error } = await supabase.from("trip_interest").insert([
      {
        trip_id: 1,
        player_name: name,
      },
    ]);

    if (error) {
      alert("Error registering");
      console.log(error);
    } else {
      setName("");
      loadRegistrations();
    }
  }

  async function removeInterest(id: number) {
    const { error } = await supabase
      .from("trip_interest")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error removing");
      console.log(error);
    } else {
      loadRegistrations();
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow">
        <a href="/" className="text-green-700 text-sm font-bold">
          ← Back to home
        </a>

        <h1 className="text-4xl font-black mt-6 mb-4">
          September 2026 Weekend
        </h1>

        <p className="mb-6 text-slate-600">
          Register your interest for the next trip.
        </p>

        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-xl p-3 mb-4"
        >
          <option value="">Select player</option>
          <option>Paul</option>
          <option>Ian</option>
          <option>Liam</option>
          <option>Carl</option>
          <option>Adam</option>
          <option>Wrighty</option>
          <option>Gav</option>
          <option>Flip</option>
          <option>Dan</option>
          <option>Taz</option>
          <option>Stu</option>
          <option>Painy</option>
          <option>Phil</option>
          <option>Big John</option>
        </select>

        <button
          onClick={registerInterest}
          className="w-full bg-green-700 text-white rounded-xl p-3 font-bold mb-8"
        >
          Register Interest
        </button>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">
            Currently Registered ({registered.length})
          </h2>

          {registered.length === 0 ? (
            <p className="text-slate-500 text-sm">
              Nobody registered yet. Be the first to bottle it later.
            </p>
          ) : (
            <div className="space-y-2">
              {registered.map((player) => (
                <div
                  key={player.id}
                  className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3"
                >
                  <span>✅ {player.player_name}</span>

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
      </div>
    </main>
  );
}