import { supabase } from "./supabase";

export type Player = {
  id: number;
  name: string;
};

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase players error:", error);
    throw error;
  }

  return data ?? [];
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const { data, error } = await supabase
    .from("players")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase player lookup error:", error);
    return null;
  }

  return data;
}