"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  saveHoleScores,
  deleteHoleScores,
  saveBonusWinner,
  checkTournamentResults,
  getScores,
  getScrambleScores,
  getBonusWinners,
} from "@/lib/scores";

import {
  getOfflineScoreQueue,
  getOfflineQueueCount,
  queueOfflineHoleSave,
  removeOfflineQueueItem,
} from "@/lib/offlineScoreQueue";

import { calculateStablefordPoints } from "@/lib/stableford";
import { supabase } from "@/lib/supabase";
import { useActiveTournament } from "../hooks/useActiveTournament";

function teamDot(team: string) {
  if (team === "Blue") return "bg-blue-500";
  if (team === "Green") return "bg-green-500";
  if (team === "White") {
    return "bg-white border border-slate-400";
  }
  if (team === "Red") return "bg-red-500";

  return "bg-slate-300 border border-slate-400";
}

function getBonusHoleNumber(bonus: any) {
  return Number(
    bonus.hole ??
      bonus.holeNumber ??
      bonus.hole_number
  );
}

function getBonusType(bonus: any) {
  return (
    bonus.type ??
    bonus.bonusType ??
    bonus.bonus_type ??
    "Bonus"
  );
}

export default function LiveScoringPage() {
  const [tournamentSetup, setTournamentSetup] =
    useState<any>(null);

  const [roundId, setRoundId] = useState<
    number | string | null
  >(null);

  const [selectedGroupId, setSelectedGroupId] =
    useState<number | string | null>(null);

  const [hole, setHole] = useState(1);

  const [scores, setScores] = useState<
    Record<string, number>
  >({});

  const [bonusWinners, setBonusWinners] =
    useState<Record<string, string>>({});

  const [savedMessage, setSavedMessage] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [isOnline, setIsOnline] =
    useState(true);

  const [
    pendingOfflineCount,
    setPendingOfflineCount,
  ] = useState(0);

  const [
    isSyncingOffline,
    setIsSyncingOffline,
  ] = useState(false);

  const offlineSyncRunning =
    useRef(false);

  const { tournament, loading } =
    useActiveTournament();

  const EVENT_SLUG =
    tournament?.slug ?? "";

  /* ============================================================
     LOAD TOURNAMENT + SAVED SCORES
  ============================================================ */

  const loadScoringPageData =
    useCallback(async () => {
      try {
        if (!tournament) return;

        const setup = {
          ...tournament,

          rounds:
            tournament.rounds?.map(
              (
                round: any,
                roundIndex: number
              ) => ({
                ...round,

                id:
                  round.roundNumber ??
                  round.id ??
                  roundIndex + 1,

                roundNumber:
                  round.roundNumber ??
                  round.id ??
                  roundIndex + 1,

                day:
                  round.day ??
                  `Round ${
                    round.roundNumber ??
                    round.id ??
                    roundIndex + 1
                  }`,

                course:
                  round.course ??
                  round.courseName ??
                  "Course",

                format:
                  round.format ===
                    "scramble" ||
                  round.format ===
                    "scramblePairs"
                    ? "scramblePairs"
                    : "stableford",

                groups:
                  round.groups?.map(
                    (
                      group: any,
                      groupIndex: number
                    ) => ({
                      ...group,

                      id:
                        group.id ??
                        group.groupNumber ??
                        groupIndex + 1,

                      groupNumber:
                        group.groupNumber ??
                        group.id ??
                        groupIndex + 1,

                      name:
                        group.name ??
                        `Group ${
                          groupIndex + 1
                        }`,

                      teeTime:
                        group.teeTime ??
                        "",

                      players:
                        group.players
                          ?.length
                          ? group.players
                          : tournament.players?.map(
                              (
                                player: any
                              ) => ({
                                player_id:
                                  player.id,

                                name:
                                  player.name,

                                team:
                                  player.eventTeam ??
                                  "",

                                eventHandicap:
                                  player.stablefordHandicap ??
                                  player.eventHandicap ??
                                  0,

                                stablefordHandicap:
                                  player.stablefordHandicap ??
                                  player.eventHandicap ??
                                  0,

                                scrambleHandicap:
                                  player.scrambleHandicap ??
                                  0,
                              })
                            ) ?? [],

                      pairs:
                        group.pairs?.map(
                          (
                            pair: any,
                            pairIndex: number
                          ) => {
                            const player1 =
                              tournament.players?.find(
                                (
                                  player: any
                                ) =>
                                  Number(
                                    player.id
                                  ) ===
                                  Number(
                                    pair.player1_id
                                  )
                              );

                            const player2 =
                              tournament.players?.find(
                                (
                                  player: any
                                ) =>
                                  Number(
                                    player.id
                                  ) ===
                                  Number(
                                    pair.player2_id
                                  )
                              );

                            return {
                              ...pair,

                              id:
                                pair.id ??
                                `${
                                  round.roundNumber ??
                                  roundIndex +
                                    1
                                }-${
                                  group.groupNumber ??
                                  groupIndex +
                                    1
                                }-${
                                  pair.pairNumber ??
                                  pairIndex +
                                    1
                                }`,

                              pairNumber:
                                pair.pairNumber ??
                                pairIndex +
                                  1,

                              player1_id:
                                pair.player1_id ??
                                null,

                              player2_id:
                                pair.player2_id ??
                                null,

                              player1:
                                pair.player1 ??
                                player1?.name ??
                                "",

                              player2:
                                pair.player2 ??
                                player2?.name ??
                                "",

                              finalHandicap:
                                pair.finalHandicap ??
                                pair.calculatedHandicap ??
                                0,
                            };
                          }
                        ) ?? [],
                    })
                  ) ?? [],
              })
            ) ?? [],
        };

        setTournamentSetup(setup);

        const firstRound =
          setup.rounds?.[0];

        setRoundId(
          (currentRoundId) =>
            currentRoundId ??
            firstRound?.id ??
            null
        );

        setSelectedGroupId(
          (currentGroupId) =>
            currentGroupId ??
            firstRound?.groups?.[0]
              ?.id ??
            null
        );

        const savedScores =
          await getScores(
            EVENT_SLUG
          );

        const savedScrambleScores =
          await getScrambleScores(
            EVENT_SLUG
          );

        const savedBonuses =
          await getBonusWinners(
            EVENT_SLUG
          );

        const loadedScores: Record<
          string,
          number
        > = {};

        savedScores.forEach(
          (row: any) => {
            const round =
              setup.rounds.find(
                (item: any) =>
                  Number(
                    item.roundNumber ??
                      item.id
                  ) ===
                  Number(
                    row.round_number
                  )
              );

            if (!round) return;

            const group =
              round.groups.find(
                (item: any) =>
                  Number(
                    item.groupNumber ??
                      item.id
                  ) ===
                  Number(
                    row.group_number
                  )
              );

            if (!group) return;

            const player =
              group.players?.find(
                (item: any) =>
                  Number(
                    item.player_id
                  ) ===
                  Number(
                    row.player_id
                  )
              );

            if (!player) return;

            loadedScores[
              `${round.id}-${group.id}-${row.hole_number}-${player.name}`
            ] = row.gross_score;
          }
        );

        savedScrambleScores.forEach(
          (row: any) => {
            const round =
              setup.rounds.find(
                (item: any) =>
                  Number(
                    item.roundNumber ??
                      item.id
                  ) ===
                  Number(
                    row.round_number
                  )
              );

            if (!round) return;

            const group =
              round.groups.find(
                (item: any) =>
                  Number(
                    item.groupNumber ??
                      item.id
                  ) ===
                  Number(
                    row.group_number
                  )
              );

            if (!group) return;

            const pair =
              group.pairs?.find(
                (item: any) =>
                  Number(
                    item.pairNumber
                  ) ===
                  Number(
                    row.pair_number
                  )
              );

            if (!pair) return;

            loadedScores[
              `${round.id}-${group.id}-${row.hole_number}-${pair.id}`
            ] = row.gross_score;
          }
        );

        const loadedBonuses: Record<
          string,
          string
        > = {};

        savedBonuses.forEach(
          (row: any) => {
            const round =
              setup.rounds.find(
                (item: any) =>
                  Number(
                    item.roundNumber ??
                      item.id
                  ) ===
                  Number(
                    row.round_number
                  )
              );

            if (!round) return;

            const winnerName =
              String(
                row.winner_player_name ??
                  ""
              )
                .trim()
                .toLowerCase();

            const winnerPlayer =
              round.groups
                .flatMap(
                  (group: any) =>
                    group.players
                )
                .find(
                  (player: any) =>
                    String(
                      player.name ??
                        ""
                    )
                      .trim()
                      .toLowerCase() ===
                    winnerName
                );

            if (
              winnerPlayer?.player_id
            ) {
              loadedBonuses[
                `${round.id}-${row.hole}`
              ] = String(
                winnerPlayer.player_id
              );
            }
          }
        );

        setScores(
          loadedScores
        );

        setBonusWinners(
          loadedBonuses
        );
      } catch (error) {
        console.error(
          "Could not load scoring page data:",
          error
        );
      }
    }, [
      tournament,
      EVENT_SLUG,
    ]);

  useEffect(() => {
    if (
      !loading &&
      tournament
    ) {
      loadScoringPageData();
    }
  }, [
    loading,
    tournament,
    loadScoringPageData,
  ]);

  /* ============================================================
     OFFLINE SCORE SYNC
  ============================================================ */

  const syncOfflineScores =
    useCallback(async () => {
      if (
        typeof window ===
          "undefined" ||
        !navigator.onLine ||
        offlineSyncRunning.current
      ) {
        return;
      }

      const queue =
        getOfflineScoreQueue();

      setPendingOfflineCount(
        queue.length
      );

      if (!queue.length) {
        return;
      }

      offlineSyncRunning.current =
        true;

      setIsSyncingOffline(
        true
      );

      try {
        for (const item of queue) {
          if (!navigator.onLine) {
            break;
          }

          try {
            if (
              item.rowsToDelete
                .length > 0
            ) {
              await deleteHoleScores(
                item.rowsToDelete
              );
            }

            if (
              item.rowsToSave
                .length > 0
            ) {
              await saveHoleScores(
                item.rowsToSave,
                {
                  tournament:
                    item.tournament,
                }
              );
            }

            if (
              item.bonusWinner
            ) {
              await saveBonusWinner(
                item.bonusWinner
              );
            }

            await checkTournamentResults(
              item.tournament
            );

            removeOfflineQueueItem(
              item.id
            );

            setPendingOfflineCount(
              getOfflineQueueCount()
            );
          } catch (error) {
            console.error(
              "Could not sync offline score:",
              item,
              error
            );

            break;
          }
        }
      } finally {
        offlineSyncRunning.current =
          false;

        setIsSyncingOffline(
          false
        );

        setPendingOfflineCount(
          getOfflineQueueCount()
        );
      }
    }, []);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const updateOnlineStatus =
      () => {
        const online =
          navigator.onLine;

        setIsOnline(
          online
        );

        setPendingOfflineCount(
          getOfflineQueueCount()
        );

        if (online) {
          void syncOfflineScores();
        }
      };

    const handleOnline = () => {
      setIsOnline(true);

      void syncOfflineScores();
    };

    const handleOffline =
      () => {
        setIsOnline(false);

        setPendingOfflineCount(
          getOfflineQueueCount()
        );
      };

    updateOnlineStatus();

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, [syncOfflineScores]);

  /* ============================================================
     REALTIME
  ============================================================ */

  useEffect(() => {
    const channel = supabase
      .channel(
        "live-scoring-realtime"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
        },
        () =>
          setTimeout(
            loadScoringPageData,
            200
          )
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "scramble_scores",
        },
        () =>
          setTimeout(
            loadScoringPageData,
            200
          )
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "bonus_winners",
        },
        () =>
          setTimeout(
            loadScoringPageData,
            200
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    loadScoringPageData,
  ]);

  /* ============================================================
     LOADING STATES
  ============================================================ */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f6f2] p-4 text-slate-900">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-800" />

            <p className="mt-3 font-black text-green-950">
              Loading tournament...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="min-h-screen bg-[#f4f6f2] p-4 text-slate-900">
        No active tournament
        selected. Go to Setup V2
        and set one active.
      </main>
    );
  }

  if (
    !tournamentSetup ||
    !roundId ||
    !selectedGroupId
  ) {
    return (
      <main className="min-h-screen bg-[#f4f6f2] p-4 text-slate-900">
        Loading tournament
        setup...
      </main>
    );
  }

  /* ============================================================
     CURRENT ROUND / GROUP / HOLE
  ============================================================ */

  const currentRound =
    tournamentSetup.rounds.find(
      (round: any) =>
        String(round.id) ===
        String(roundId)
    );

  if (!currentRound) {
    return (
      <main className="min-h-screen bg-[#f4f6f2] p-4 text-slate-900">
        Round not found.
      </main>
    );
  }

  const selectedGroup =
    currentRound.groups.find(
      (group: any) =>
        String(group.id) ===
        String(
          selectedGroupId
        )
    ) ??
    currentRound.groups[0];

  const isScramble =
    currentRound.format ===
    "scramblePairs";

  const currentHole =
    currentRound.holes.find(
      (item: any) =>
        Number(item.hole) ===
        Number(hole)
    ) ??
    currentRound.holes[0];

  const roundBonusHoles =
    currentRound.bonusHoles ??
    currentRound.bonus_holes ??
    currentRound.bonuses ??
    [];

  const bonusHole =
    roundBonusHoles.find(
      (bonus: any) =>
        getBonusHoleNumber(
          bonus
        ) === hole
    );

  const allRoundPlayers =
    currentRound.groups
      .flatMap(
        (group: any) =>
          group.players
      )
      .filter(
        (player: any) =>
          player?.player_id
      );

  const uniqueRoundPlayers =
    Array.from(
      new Map(
        allRoundPlayers.map(
          (player: any) => [
            String(
              player.player_id
            ),
            player,
          ]
        )
      ).values()
    );

  /* ============================================================
     HELPERS
  ============================================================ */

  function getPlayerNameById(
    playerId: string
  ) {
    const foundPlayer =
      uniqueRoundPlayers.find(
        (player: any) =>
          String(
            player.player_id
          ) ===
          String(playerId)
      ) as any;

    return (
      foundPlayer?.name ??
      ""
    );
  }

  function validPlayerId(
    playerId: any
  ) {
    return (
      Number.isInteger(
        Number(playerId)
      ) &&
      String(playerId) !==
        "undefined"
    );
  }

  function scoreKeyFor(
    groupId:
      | string
      | number,
    id: string,
    holeNumber: number
  ) {
    return `${roundId}-${groupId}-${holeNumber}-${id}`;
  }

  function scoreKey(
    id: string,
    holeNumber = hole
  ) {
    return scoreKeyFor(
      selectedGroup.id,
      id,
      holeNumber
    );
  }

  function bonusKey(
    holeNumber = hole
  ) {
    return `${roundId}-${holeNumber}`;
  }

  function getScore(
    id: string
  ) {
    return (
      scores[
        scoreKey(id)
      ] || 0
    );
  }

  function changeScore(
    id: string,
    amount: number
  ) {
    const key =
      scoreKey(id);

    const currentScore =
      scores[key] || 0;

    const newScore =
      Math.max(
        0,
        currentScore +
          amount
      );

    setScores(
      (current) => {
        const updated = {
          ...current,
        };

        if (
          newScore === 0
        ) {
          delete updated[key];
        } else {
          updated[key] =
            newScore;
        }

        return updated;
      }
    );
  }

  function setScore(
    id: string,
    value: string
  ) {
    const key =
      scoreKey(id);

    const numberValue =
      Number(value);

    setScores(
      (current) => {
        const updated = {
          ...current,
        };

        if (
          !value ||
          numberValue <= 0
        ) {
          delete updated[key];
        } else {
          updated[key] =
            numberValue;
        }

        return updated;
      }
    );
  }

  function setBonusWinner(
    playerId: string
  ) {
    setBonusWinners(
      (current) => ({
        ...current,
        [bonusKey()]:
          playerId,
      })
    );
  }

  function getBonusWinner(
    holeNumber = hole
  ) {
    return (
      bonusWinners[
        bonusKey(
          holeNumber
        )
      ] || ""
    );
  }

  /* ============================================================
     SAVE
  ============================================================ */

  async function saveHole() {
    setIsSaving(true);
    setSavedMessage("");

    let rowsToSave: any[] =
      [];

    const rowsToDelete:
      any[] = [];

    let bonusWinnerToSave:
      | any
      | null = null;

    const roundNumber =
      Number(
        currentRound.roundNumber ??
          currentRound.id
      );

    const groupNumber =
      Number(
        selectedGroup.groupNumber ??
          selectedGroup.id
      );

    function moveToNextHole() {
      if (hole < 18) {
        setTimeout(() => {
          setHole(
            (current) =>
              current + 1
          );

          setSavedMessage(
            ""
          );
        }, 800);
      }
    }

    try {
      if (isScramble) {
        rowsToSave =
          selectedGroup.pairs
            ?.map(
              (pair: any) => {
                const grossScore =
                  getScore(
                    pair.id
                  );

                if (
                  !grossScore
                ) {
                  rowsToDelete.push(
                    {
                      event_slug:
                        EVENT_SLUG,

                      round_number:
                        roundNumber,

                      hole_number:
                        hole,

                      group_number:
                        groupNumber,

                      pair_number:
                        pair.pairNumber,
                    }
                  );

                  return null;
                }

                return {
                  event_slug:
                    EVENT_SLUG,

                  round_number:
                    roundNumber,

                  player_id:
                    null,

                  hole_number:
                    hole,

                  gross_score:
                    grossScore,

                  group_number:
                    groupNumber,

                  pair_number:
                    pair.pairNumber,

                  score_type:
                    "scramblePairs",

                  points:
                    calculateStablefordPoints(
                      grossScore,
                      currentHole.par,
                      currentHole.strokeIndex,
                      pair.finalHandicap
                    ),

                  event_handicap:
                    pair.finalHandicap,
                };
              }
            )
            .filter(Boolean) ??
          [];
      } else {
        rowsToSave =
          selectedGroup.players
            .map(
              (
                player: any
              ) => {
                const grossScore =
                  getScore(
                    player.name
                  );

                if (
                  !grossScore
                ) {
                  if (
                    validPlayerId(
                      player.player_id
                    )
                  ) {
                    rowsToDelete.push(
                      {
                        event_slug:
                          EVENT_SLUG,

                        round_number:
                          roundNumber,

                        player_id:
                          player.player_id,

                        hole_number:
                          hole,
                      }
                    );
                  }

                  return null;
                }

                if (
                  !validPlayerId(
                    player.player_id
                  )
                ) {
                  return null;
                }

                return {
                  event_slug:
                    EVENT_SLUG,

                  round_number:
                    roundNumber,

                  player_id:
                    player.player_id,

                  hole_number:
                    hole,

                  gross_score:
                    grossScore,

                  group_number:
                    groupNumber,

                  pair_number:
                    null,

                  score_type:
                    "stableford",

                  points:
                    calculateStablefordPoints(
                      grossScore,
                      currentHole.par,
                      currentHole.strokeIndex,
                      player.eventHandicap
                    ),

                  event_handicap:
                    player.eventHandicap,
                };
              }
            )
            .filter(
              Boolean
            );
      }

      if (
        bonusHole &&
        getBonusWinner()
      ) {
        bonusWinnerToSave = {
          event_slug:
            EVENT_SLUG,

          round_number:
            roundNumber,

          hole,

          bonus_type:
            getBonusType(
              bonusHole
            ),

          winner_player_name:
            getPlayerNameById(
              getBonusWinner()
            ),

          points:
            bonusHole.points ??
            0,
        };
      }

      /*
       * We already know the phone
       * has no connection.
       */
      if (
        typeof navigator !==
          "undefined" &&
        !navigator.onLine
      ) {
        queueOfflineHoleSave({
          eventSlug:
            EVENT_SLUG,

          roundNumber,

          groupNumber,

          holeNumber:
            hole,

          rowsToSave,

          rowsToDelete,

          bonusWinner:
            bonusWinnerToSave,

          tournament:
            tournamentSetup,
        });

        const pending =
          getOfflineQueueCount();

        setPendingOfflineCount(
          pending
        );

        setIsOnline(
          false
        );

        setSavedMessage(
          `📴 Hole ${hole} saved on this phone · ${pending} waiting to sync`
        );

        moveToNextHole();

        return;
      }

      /*
       * Normal online save.
       */
      if (
        rowsToDelete.length >
        0
      ) {
        await deleteHoleScores(
          rowsToDelete
        );
      }

      if (
        rowsToSave.length >
        0
      ) {
        await saveHoleScores(
          rowsToSave,
          {
            tournament:
              tournamentSetup,
          }
        );
      }

      if (
        bonusWinnerToSave
      ) {
        await saveBonusWinner(
          bonusWinnerToSave
        );
      }

      await checkTournamentResults(
        tournamentSetup
      );

      const bonusMessage =
        bonusWinnerToSave
          ? ` Bonus winner: ${bonusWinnerToSave.winner_player_name}.`
          : "";

      const formatMessage =
        isScramble
          ? "scramble scores"
          : "scorecards";

      setSavedMessage(
        `${currentRound.day} ${currentRound.course} — Hole ${hole} ${formatMessage} saved.${bonusMessage}`
      );

      moveToNextHole();
    } catch (
      error: any
    ) {
      console.error(
        "Online score save failed:",
        error
      );

      /*
       * If connection disappears
       * during the save, keep the
       * complete hole locally.
       *
       * Supabase upserts make replay
       * safe for any part which may
       * already have reached the DB.
       */
      try {
        queueOfflineHoleSave({
          eventSlug:
            EVENT_SLUG,

          roundNumber,

          groupNumber,

          holeNumber:
            hole,

          rowsToSave,

          rowsToDelete,

          bonusWinner:
            bonusWinnerToSave,

          tournament:
            tournamentSetup,
        });

        const pending =
          getOfflineQueueCount();

        setPendingOfflineCount(
          pending
        );

        setIsOnline(
          typeof navigator !==
            "undefined"
            ? navigator.onLine
            : false
        );

        setSavedMessage(
          `📴 Hole ${hole} stored safely · ${pending} waiting to sync`
        );

        moveToNextHole();
      } catch (
        queueError
      ) {
        console.error(
          "Could not store offline score:",
          queueError
        );

        setSavedMessage(
          `❌ Could not save Hole ${hole}. Please try again.`
        );
      }
    } finally {
      setIsSaving(
        false
      );
    }
  }

  function holeHasScores(
    holeNumber: number
  ) {
    if (isScramble) {
      return selectedGroup.pairs?.some(
        (pair: any) =>
          scores[
            scoreKeyFor(
              selectedGroup.id,
              pair.id,
              holeNumber
            )
          ]
      );
    }

    return selectedGroup.players.some(
      (player: any) =>
        scores[
          scoreKeyFor(
            selectedGroup.id,
            player.name,
            holeNumber
          )
        ]
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#eef2eb] px-2.5 pb-44 pt-2 text-slate-900 md:p-8 md:pb-20">
      <div className="mx-auto max-w-6xl">
        {/* ======================================================
            COMPACT EVENT HEADER
        ====================================================== */}

        <header className="mb-2 px-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs">
              ⛳
            </span>

            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-emerald-700">
              Swift Tees
            </p>
          </div>

          <h1 className="mt-0.5 truncate text-[24px] font-black leading-tight tracking-[-0.035em] text-green-950 md:text-4xl">
            {tournament.name}
          </h1>

          <p className="mt-0.5 text-[11px] font-bold text-slate-500 md:text-sm">
            {currentRound.day}

            <span className="mx-1 text-slate-300">
              •
            </span>

            {currentRound.course}

            <span className="mx-1 text-slate-300">
              •
            </span>

            {isScramble
              ? "Scramble Pairs"
              : "Stableford"}
          </p>
        </header>

        {/* ======================================================
            ROUND + GROUP SWITCHERS
        ====================================================== */}

        <div className="mb-2 space-y-1.5">
          {tournamentSetup
            .rounds.length >
            1 && (
            <div
              className="grid w-full gap-1.5"
              style={{
                gridTemplateColumns:
                  `repeat(${tournamentSetup.rounds.length}, minmax(0, 1fr))`,
              }}
            >
              {tournamentSetup.rounds.map(
                (
                  round: any
                ) => {
                  const active =
                    String(
                      roundId
                    ) ===
                    String(
                      round.id
                    );

                  return (
                    <button
                      key={
                        round.id
                      }
                      onClick={() => {
                        setRoundId(
                          round.id
                        );

                        setSelectedGroupId(
                          round
                            .groups?.[0]
                            ?.id ??
                            null
                        );

                        setHole(
                          1
                        );

                        setSavedMessage(
                          ""
                        );
                      }}
                      className={`min-w-0 rounded-xl border px-2 py-1.5 text-center transition active:scale-[0.98] ${
                        active
                          ? "border-green-950 bg-green-950 text-white shadow-sm"
                          : "border-slate-200 bg-white text-green-950"
                      }`}
                    >
                      <span className="block truncate text-[12px] font-black">
                        {
                          round.course
                        }
                      </span>

                      <span
                        className={`mt-0.5 block truncate text-[8px] font-bold ${
                          active
                            ? "text-green-200"
                            : "text-slate-500"
                        }`}
                      >
                        {
                          round.day
                        }
                        {
                          " • "
                        }
                        {round.format ===
                        "scramblePairs"
                          ? "Scramble"
                          : "Stableford"}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          )}

          {currentRound.groups
            .length >
            1 && (
            <div
              className="grid w-full gap-1.5"
              style={{
                gridTemplateColumns:
                  `repeat(${currentRound.groups.length}, minmax(0, 1fr))`,
              }}
            >
              {currentRound.groups.map(
                (
                  group: any
                ) => {
                  const active =
                    String(
                      selectedGroupId
                    ) ===
                    String(
                      group.id
                    );

                  return (
                    <button
                      key={
                        group.id
                      }
                      onClick={() => {
                        setSelectedGroupId(
                          group.id
                        );

                        setSavedMessage(
                          ""
                        );
                      }}
                      className={`min-w-0 rounded-xl border px-2 py-1.5 text-center text-[12px] font-black transition active:scale-[0.98] ${
                        active
                          ? "border-green-950 bg-green-950 text-white shadow-sm"
                          : "border-slate-200 bg-white text-green-950"
                      }`}
                    >
                      <span className="block truncate">
                        {
                          group.name
                        }
                      </span>

                      {group.teeTime && (
                        <span
                          className={`mt-0.5 block text-[8px] font-bold ${
                            active
                              ? "text-green-200"
                              : "text-slate-400"
                          }`}
                        >
                          {
                            group.teeTime
                          }
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* ======================================================
            MAIN SCORING PANEL
        ====================================================== */}

        <section className="overflow-hidden rounded-[1.7rem] bg-[#043b25] text-white shadow-[0_10px_30px_rgba(3,46,30,0.15)] ring-1 ring-green-950/10">
          {/* HOLE INFO */}

          <div className="px-3 pb-2 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-300">
                  {currentRound.course.replace(
                    " Course",
                    ""
                  )}
                </p>

                <h2 className="mt-0.5 text-[30px] font-black leading-none tracking-[-0.04em]">
                  Hole {hole}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <HoleStat
                  label="PAR"
                  value={
                    currentHole.par
                  }
                />

                <HoleStat
                  label="SI"
                  value={
                    currentHole.strokeIndex
                  }
                />

                {currentHole.yards ? (
                  <HoleStat
                    label="YDS"
                    value={
                      currentHole.yards
                    }
                  />
                ) : null}
              </div>
            </div>

            {/* HOLE PICKER */}

            <div className="mt-2 grid grid-cols-9 gap-1">
              {currentRound.holes.map(
                (
                  item: any
                ) => {
                  const holeNumber =
                    Number(
                      item.hole
                    );

                  const hasScores =
                    holeHasScores(
                      holeNumber
                    );

                  const hasBonus =
                    roundBonusHoles.some(
                      (
                        bonus: any
                      ) =>
                        getBonusHoleNumber(
                          bonus
                        ) ===
                        holeNumber
                    );

                  const selected =
                    hole ===
                    holeNumber;

                  return (
                    <button
                      key={
                        holeNumber
                      }
                      onClick={() => {
                        setHole(
                          holeNumber
                        );

                        setSavedMessage(
                          ""
                        );
                      }}
                      className={`relative flex h-8 items-center justify-center rounded-lg border text-[11px] font-black transition active:scale-95 ${
                        selected
                          ? "border-white bg-white text-green-950 shadow-sm"
                          : hasScores
                          ? "border-emerald-400 bg-emerald-500 text-white"
                          : "border-white/10 bg-white/[0.08] text-white"
                      }`}
                    >
                      {
                        holeNumber
                      }

                      {hasBonus && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-300 ring-1 ring-green-950" />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* BONUS HOLE */}

          {bonusHole && (
            <div className="mx-2.5 mb-2 rounded-xl bg-yellow-300 p-2 text-green-950">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black">
                  ⭐{" "}
                  {getBonusType(
                    bonusHole
                  )}
                  {bonusHole.points
                    ? ` · ${bonusHole.points} pts`
                    : ""}
                </p>

                <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
                  Bonus hole
                </span>
              </div>

              <select
                value={
                  getBonusWinner()
                }
                onChange={(
                  event
                ) =>
                  setBonusWinner(
                    event.target
                      .value
                  )
                }
                className="mt-1.5 h-9 w-full rounded-lg border border-yellow-500 bg-white px-2 text-[12px] font-black text-green-950 outline-none"
              >
                <option value="">
                  Select winner
                </option>

                {uniqueRoundPlayers.map(
                  (
                    player: any
                  ) => (
                    <option
                      key={
                        player.player_id
                      }
                      value={String(
                        player.player_id
                      )}
                    >
                      {
                        player.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* ======================================================
              PLAYERS
          ====================================================== */}

          <div className="space-y-1.5 px-2.5 pb-2.5">
            {!isScramble &&
              selectedGroup.players.map(
                (
                  player: any
                ) => (
                  <div
                    key={
                      player.name
                    }
                    className="flex min-h-[58px] items-center justify-between gap-2 rounded-xl bg-white px-2.5 py-1.5 text-green-950 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${teamDot(
                          player.team
                        )}`}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-black leading-tight">
                          {
                            player.name
                          }
                        </p>

                        <p className="mt-0.5 truncate text-[9px] font-bold text-slate-400">
                          {player.team
                            ? `${player.team} · `
                            : ""}
                          HCP{" "}
                          {
                            player.eventHandicap
                          }
                        </p>
                      </div>
                    </div>

                    <ScoreControl
                      value={
                        getScore(
                          player.name
                        ) || ""
                      }
                      onMinus={() =>
                        changeScore(
                          player.name,
                          -1
                        )
                      }
                      onPlus={() =>
                        changeScore(
                          player.name,
                          1
                        )
                      }
                      onChange={(
                        value
                      ) =>
                        setScore(
                          player.name,
                          value
                        )
                      }
                    />
                  </div>
                )
              )}

            {/* ======================================================
                SCRAMBLE PAIRS
            ====================================================== */}

            {isScramble &&
              selectedGroup.pairs?.map(
                (
                  pair: any
                ) => (
                  <div
                    key={
                      pair.id
                    }
                    className="flex min-h-[62px] items-center justify-between gap-2 rounded-xl bg-white px-2.5 py-1.5 text-green-950 shadow-sm"
                  >
                    <div className="min-w-0 pr-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                        👥 Pair{" "}
                        {
                          pair.pairNumber
                        }
                      </p>

                      <p className="mt-0.5 truncate text-[16px] font-black leading-tight">
                        {
                          pair.player1
                        }{" "}
                        <span className="text-slate-300">
                          +
                        </span>{" "}
                        {
                          pair.player2
                        }
                      </p>

                      <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                        {
                          pair.finalHandicap
                        }{" "}
                        HCP
                      </p>
                    </div>

                    <ScoreControl
                      value={
                        getScore(
                          pair.id
                        ) || ""
                      }
                      onMinus={() =>
                        changeScore(
                          pair.id,
                          -1
                        )
                      }
                      onPlus={() =>
                        changeScore(
                          pair.id,
                          1
                        )
                      }
                      onChange={(
                        value
                      ) =>
                        setScore(
                          pair.id,
                          value
                        )
                      }
                    />
                  </div>
                )
              )}
          </div>
        </section>

        {/* ======================================================
            CONNECTION / OFFLINE STATUS
        ====================================================== */}

        <div className="mt-2">
          {isSyncingOffline ? (
            <div className="rounded-xl bg-amber-100 px-3 py-2 text-center text-[11px] font-black text-amber-900 ring-1 ring-amber-200">
              🔄 Syncing{" "}
              {
                pendingOfflineCount
              }{" "}
              saved hole
              {pendingOfflineCount ===
              1
                ? ""
                : "s"}
              ...
            </div>
          ) : pendingOfflineCount >
            0 ? (
            <button
              type="button"
              onClick={() =>
                void syncOfflineScores()
              }
              disabled={
                !isOnline
              }
              className="w-full rounded-xl bg-amber-100 px-3 py-2 text-center text-[11px] font-black text-amber-900 ring-1 ring-amber-200 disabled:opacity-70"
            >
              {isOnline
                ? `📤 ${pendingOfflineCount} saved hole${
                    pendingOfflineCount ===
                    1
                      ? ""
                      : "s"
                  } waiting · Tap to sync`
                : `📴 Offline · ${pendingOfflineCount} saved hole${
                    pendingOfflineCount ===
                    1
                      ? ""
                      : "s"
                  } waiting`}
            </button>
          ) : (
            <div className="rounded-xl bg-white px-3 py-1.5 text-center text-[10px] font-black text-slate-500 ring-1 ring-slate-200">
              {isOnline
                ? "🟢 Online · Scores syncing normally"
                : "📴 Offline · Scores will be saved on this phone"}
            </div>
          )}
        </div>

        {/* ======================================================
            SAVE STATUS
        ====================================================== */}

        {savedMessage && (
          <div
            className={`mt-2 rounded-xl px-3 py-2 text-center text-[11px] font-black ${
              savedMessage.startsWith(
                "❌"
              )
                ? "bg-red-100 text-red-800 ring-1 ring-red-200"
                : savedMessage.startsWith(
                    "📴"
                  )
                ? "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
                : "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
            }`}
          >
            {savedMessage.startsWith(
              "❌"
            ) ||
            savedMessage.startsWith(
              "📴"
            )
              ? savedMessage
              : `✅ ${savedMessage}`}
          </div>
        )}

        {/* ======================================================
            SECONDARY LINKS
        ====================================================== */}

        <section className="mt-2 grid grid-cols-2 gap-1.5">
  <a
    href="/live-centre"
    className="flex h-10 items-center justify-center rounded-xl bg-white text-center text-[10px] font-black text-green-950 shadow-sm ring-1 ring-slate-200"
  >
    🏆 Leaderboard
  </a>

  <a
    href="/full-scorecard"
    className="flex h-10 items-center justify-center rounded-xl bg-white text-center text-[10px] font-black text-green-950 shadow-sm ring-1 ring-slate-200"
  >
    📊 Full Card
  </a>
</section>
      </div>

      {/* ======================================================
          STICKY SAVE BAR
          sits above Swift Tees bottom navigation
      ====================================================== */}

      <div className="fixed inset-x-0 bottom-[72px] z-40 px-2.5 md:static md:mt-4 md:px-0">
        <div className="mx-auto max-w-6xl rounded-[1.2rem] border border-white/70 bg-white/95 p-2 shadow-[0_-6px_24px_rgba(15,23,42,0.13)] backdrop-blur-xl md:shadow-sm">
          <button
            onClick={
              saveHole
            }
            disabled={
              isSaving
            }
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-[15px] font-black text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Saving...
              </>
            ) : (
              <>
                <span>
                  ✓
                </span>

                <span>
                  Save Hole{" "}
                  {hole}
                  {isScramble
                    ? " Scores"
                    : " Scorecards"}
                </span>

                {hole < 18 && (
                  <span className="text-green-200">
                    →
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SCORE CONTROL
============================================================ */

function ScoreControl({
  value,
  onMinus,
  onPlus,
  onChange,
}: {
  value:
    | number
    | string;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={
          onMinus
        }
        className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-slate-100 text-xl font-black text-green-950 ring-1 ring-slate-200 transition active:scale-90 active:bg-slate-200"
        aria-label="Decrease score"
      >
        −
      </button>

      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="h-10 w-12 rounded-[11px] border border-slate-300 bg-white px-1 text-center text-[22px] font-black leading-none text-green-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        placeholder="-"
        aria-label="Gross score"
      />

      <button
        type="button"
        onClick={
          onPlus
        }
        className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-slate-100 text-xl font-black text-green-950 ring-1 ring-slate-200 transition active:scale-90 active:bg-emerald-100"
        aria-label="Increase score"
      >
        +
      </button>
    </div>
  );
}

/* ============================================================
   HOLE STAT
============================================================ */

function HoleStat({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div className="min-w-[42px] rounded-lg bg-white/[0.09] px-2 py-1 text-center ring-1 ring-white/5">
      <p className="text-[7px] font-black uppercase tracking-[0.12em] text-green-300">
        {label}
      </p>

      <p className="mt-0.5 text-[12px] font-black leading-none text-white">
        {value}
      </p>
    </div>
  );
}