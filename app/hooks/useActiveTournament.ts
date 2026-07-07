"use client";

import { useEffect, useState } from "react";
import { getActiveTournamentV2 } from "../../lib/tournaments-v2";

export function useActiveTournament() {
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveTournamentV2();
        setTournament(data);
      } catch (error) {
        console.error(error);
        setTournament(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    tournament,
    loading,
  };
}