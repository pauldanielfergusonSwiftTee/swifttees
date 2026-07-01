import { supabase } from "./supabase";

export async function saveTournamentSetup(tournamentSetup: any) {
  const { data: existingTournament } = await supabase
    .from("tournaments")
    .select("id")
    .eq("name", tournamentSetup.eventName)
    .maybeSingle();

  let tournamentId = existingTournament?.id;

  if (!tournamentId) {
    const { data, error } = await supabase
      .from("tournaments")
      .insert({ name: tournamentSetup.eventName })
      .select("id")
      .single();

    if (error) throw error;
    tournamentId = data.id;
  }

  const { data: existingRounds } = await supabase
    .from("tournament_rounds")
    .select("id")
    .eq("tournament_id", tournamentId);

  const roundIds = existingRounds?.map((round) => round.id) ?? [];

  if (roundIds.length > 0) {
    await supabase.from("tournament_groups").delete().in("round_id", roundIds);
    await supabase.from("tournament_rounds").delete().in("id", roundIds);
  }

  for (const round of tournamentSetup.rounds) {
    const { data: savedRound, error: roundError } = await supabase
      .from("tournament_rounds")
      .insert({
  tournament_id: tournamentId,
  round_number: round.id,
  day_label: round.day,
  course: round.course,
  format: round.format,
  holes: round.holes,
  bonus_holes: round.bonusHoles ?? [],
})
      .select("id")
      .single();

    if (roundError) throw roundError;

    const groupsToInsert = round.groups.map((group: any) => ({
      round_id: savedRound.id,
      group_number: group.id,
      tee_time: group.teeTime,
      players: group.players,
      pairs: group.pairs,
    }));

    const { error: groupsError } = await supabase
      .from("tournament_groups")
      .insert(groupsToInsert);

    if (groupsError) throw groupsError;
  }

  return { tournamentId };
}
export async function getTournamentSetup(eventName = "Carden Park 2026") {
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, name")
    .eq("name", eventName)
    .single();

  if (tournamentError) throw tournamentError;

  const { data: rounds, error: roundsError } = await supabase
    .from("tournament_rounds")
    .select("*")
    .eq("tournament_id", tournament.id)
    .order("round_number", { ascending: true });

  if (roundsError) throw roundsError;

  const roundIds = rounds.map((round) => round.id);

  const { data: groups, error: groupsError } = await supabase
    .from("tournament_groups")
    .select("*")
    .in("round_id", roundIds)
    .order("group_number", { ascending: true });

  if (groupsError) throw groupsError;

  return {
    tournament,
    rounds,
    groups,
  };
}
export async function getTournamentSetupForUI() {
  const { tournament, rounds, groups } = await getTournamentSetup();

  const uiRounds = rounds.map((round) => ({
    id: round.round_number,
    roundNumber: round.round_number,
    day: round.day_label,
    course: round.course,
    format: round.format,
    holes: round.holes,
    bonusHoles: round.bonus_holes ?? round.bonusHoles ?? round.bonuses ?? [],
    groups: groups
      .filter((g) => g.round_id === round.id)
      .map((g) => ({
        id: g.group_number,
        groupNumber: g.group_number,
        name: `Group ${g.group_number}`,
        teeTime: g.tee_time,
        players: g.players ?? [],
        pairs: g.pairs ?? [],
      })),
  }));

  return {
    eventName: tournament.name,
    rounds: uiRounds,
  };
}