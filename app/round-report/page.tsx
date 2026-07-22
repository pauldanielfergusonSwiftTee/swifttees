"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  getBonusWinners,
  getScores,
  getScrambleScores,
} from "@/lib/scores";
import { useActiveTournament } from "../hooks/useActiveTournament";

type NoteType =
  | "funny"
  | "great_shot"
  | "disaster"
  | "quote"
  | "off_course"
  | "drama"
  | "other";

type ReportNote = {
  id: string;
  event_slug: string;
  round_number: number;
  note_type: NoteType;
  note_text: string;
  is_headline: boolean;
  created_at: string;
};

type LiveMoment = {
  id?: number | string;
  event_slug: string;
  moment_key?: string;
  moment_type?: string;
  icon?: string;
  title?: string;
  text: string;
  rarity?: string;
  player_name?: string | null;
  team?: string | null;
  round_number?: number | null;
  hole_number?: number | null;
  created_at?: string;
};

type LeaderboardRow = {
  position: number;
  key: string;
  name: string;
  points: number;
  through: number;
  gross: number;
};

type BonusWinner = {
  bonusType: string;
  holeNumber: number;
  winnerName: string;
  points: number;
};

type GeneratedReport = {
  title: string;
  report: string;
  characterCount: number;
  maxCharacters: number;
};

const MAX_REPORT_CHARACTERS = 3500;

const NOTE_TYPES: Array<{
  value: NoteType;
  label: string;
  icon: string;
}> = [
  {
    value: "funny",
    label: "Funny",
    icon: "😂",
  },
  {
    value: "great_shot",
    label: "Great shot",
    icon: "🏌️",
  },
  {
    value: "disaster",
    label: "Disaster",
    icon: "💥",
  },
  {
    value: "drama",
    label: "Drama",
    icon: "🔥",
  },
  {
    value: "quote",
    label: "Quote",
    icon: "💬",
  },
  {
    value: "off_course",
    label: "Off course",
    icon: "🍺",
  },
  {
    value: "other",
    label: "Other",
    icon: "📝",
  },
];

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundNumberFor(round: any, index: number) {
  return asNumber(
    round?.roundNumber ??
      round?.round_number ??
      round?.id,
    index + 1
  );
}

function roundCourse(round: any) {
  return String(
    round?.course ??
      round?.courseName ??
      round?.course_name ??
      "Course"
  );
}

function roundLabel(round: any, index: number) {
  return String(
    round?.day ??
      round?.name ??
      `Round ${roundNumberFor(round, index)}`
  );
}

function roundFormat(round: any) {
  const format = String(round?.format ?? "").toLowerCase();

  return format.includes("scramble")
    ? "Scramble Pairs"
    : "Stableford";
}

function noteTypeDetails(type: NoteType) {
  return (
    NOTE_TYPES.find((item) => item.value === type) ??
    NOTE_TYPES[NOTE_TYPES.length - 1]
  );
}

function normaliseName(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getPairName(
  tournament: any,
  round: any,
  row: any
) {
  const groups =
    round?.groups ??
    tournament?.groups ??
    [];

  const group = groups.find(
    (item: any, groupIndex: number) =>
      asNumber(
        item.groupNumber ??
          item.group_number ??
          item.id,
        groupIndex + 1
      ) === asNumber(row.group_number)
  );

  const pair = group?.pairs?.find(
    (item: any, pairIndex: number) =>
      asNumber(
        item.pairNumber ??
          item.pair_number ??
          item.id,
        pairIndex + 1
      ) === asNumber(row.pair_number)
  );

  if (pair) {
    const player1 =
      pair.player1 ??
      pair.player1Name ??
      pair.player_1_name ??
      "";

    const player2 =
      pair.player2 ??
      pair.player2Name ??
      pair.player_2_name ??
      "";

    const pairName = [player1, player2]
      .filter(Boolean)
      .join(" & ");

    if (pairName) return pairName;
  }

  return `Pair ${asNumber(row.pair_number, 1)}`;
}

function getPlayerName(tournament: any, row: any) {
  if (row.player_name) {
    return String(row.player_name);
  }

  const player = tournament?.players?.find(
    (item: any) =>
      asNumber(item.id ?? item.player_id) ===
      asNumber(row.player_id)
  );

  return String(
    player?.name ??
      `Player ${row.player_id ?? ""}`
  ).trim();
}

function formatTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractReportTitle(report: string) {
  return (
    report
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean)
      ?.replace(/^#+\s*/, "")
      .replace(/^\*\*/, "")
      .replace(/\*\*$/, "")
      .trim() ?? "Round Report"
  );
}

export default function RoundReportPage() {
  const { tournament, loading } =
    useActiveTournament();

  const [selectedRoundNumber, setSelectedRoundNumber] =
    useState<number | null>(null);

  const [scores, setScores] = useState<any[]>([]);
  const [scrambleScores, setScrambleScores] =
    useState<any[]>([]);
  const [bonusRows, setBonusRows] = useState<any[]>([]);
  const [commentary, setCommentary] = useState<
    LiveMoment[]
  >([]);
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [savedReport, setSavedReport] =
    useState<any | null>(null);

  const [noteType, setNoteType] =
    useState<NoteType>("funny");
  const [noteText, setNoteText] = useState("");
  const [isHeadline, setIsHeadline] =
    useState(false);

  const [editingNoteId, setEditingNoteId] =
    useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] =
    useState("");

  const [generatedReport, setGeneratedReport] =
    useState<GeneratedReport | null>(null);

  const [isLoadingRound, setIsLoadingRound] =
    useState(false);
  const [isSavingNote, setIsSavingNote] =
    useState(false);
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [isSavingReport, setIsSavingReport] =
    useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const eventSlug = tournament?.slug ?? "";
  const rounds = tournament?.rounds ?? [];

  const selectedRoundIndex = useMemo(
    () =>
      rounds.findIndex(
        (round: any, index: number) =>
          roundNumberFor(round, index) ===
          selectedRoundNumber
      ),
    [rounds, selectedRoundNumber]
  );

  const selectedRound =
    selectedRoundIndex >= 0
      ? rounds[selectedRoundIndex]
      : null;

  const selectedRoundName = selectedRound
    ? roundLabel(selectedRound, selectedRoundIndex)
    : "";

  const selectedCourse = selectedRound
    ? roundCourse(selectedRound)
    : "";

  const selectedFormat = selectedRound
    ? roundFormat(selectedRound)
    : "";

  const isFinalRound =
    selectedRoundIndex >= 0 &&
    selectedRoundIndex === rounds.length - 1;

  const nextRound =
    selectedRoundIndex >= 0
      ? rounds[selectedRoundIndex + 1]
      : null;

  useEffect(() => {
    if (!tournament || rounds.length === 0) return;

    setSelectedRoundNumber((current) => {
      if (
        current !== null &&
        rounds.some(
          (round: any, index: number) =>
            roundNumberFor(round, index) === current
        )
      ) {
        return current;
      }

      return roundNumberFor(rounds[0], 0);
    });
  }, [tournament, rounds]);

  const loadSelectedRound = useCallback(async () => {
    if (
      !eventSlug ||
      selectedRoundNumber === null
    ) {
      return;
    }

    setIsLoadingRound(true);
    setErrorMessage("");
    setMessage("");

    try {
      /*
       * Scores and bonus helpers return the full event,
       * so these are filtered immediately to the selected
       * round below.
       */
      const [
        allScores,
        allScrambleScores,
        allBonusWinners,
        commentaryResult,
        notesResult,
        reportResult,
      ] = await Promise.all([
        getScores(eventSlug),
        getScrambleScores(eventSlug),
        getBonusWinners(eventSlug),

        /*
         * CRITICAL:
         * Commentary is filtered at Supabase query level by
         * BOTH event_slug and round_number.
         *
         * Commentary from another round can therefore never
         * enter the selected-round report payload.
         */
        supabase
          .from("live_moments")
          .select(
            `
              id,
              event_slug,
              moment_key,
              moment_type,
              icon,
              title,
              text,
              rarity,
              player_name,
              team,
              round_number,
              hole_number,
              created_at
            `
          )
          .eq("event_slug", eventSlug)
          .eq(
            "round_number",
            selectedRoundNumber
          )
          .order("created_at", {
            ascending: true,
          }),

        supabase
          .from("round_report_notes")
          .select("*")
          .eq("event_slug", eventSlug)
          .eq(
            "round_number",
            selectedRoundNumber
          )
          .order("created_at", {
            ascending: true,
          }),

        supabase
          .from("round_reports")
          .select("*")
          .eq("event_slug", eventSlug)
          .eq(
            "round_number",
            selectedRoundNumber
          )
          .maybeSingle(),
      ]);

      if (commentaryResult.error) {
        throw commentaryResult.error;
      }

      if (notesResult.error) {
        throw notesResult.error;
      }

      if (reportResult.error) {
        throw reportResult.error;
      }

      const onlyThisRoundScores = (
        allScores ?? []
      ).filter(
        (row: any) =>
          asNumber(row.round_number) ===
          selectedRoundNumber
      );

      const onlyThisRoundScrambleScores = (
        allScrambleScores ?? []
      ).filter(
        (row: any) =>
          asNumber(row.round_number) ===
          selectedRoundNumber
      );

      const onlyThisRoundBonuses = (
        allBonusWinners ?? []
      ).filter(
        (row: any) =>
          asNumber(row.round_number) ===
          selectedRoundNumber
      );

      /*
       * Second defensive round filter.
       * The database query already filters it, but this
       * prevents accidental contamination if the query is
       * changed later.
       */
      const onlyThisRoundCommentary = (
        commentaryResult.data ?? []
      ).filter(
        (moment: LiveMoment) =>
          asNumber(moment.round_number) ===
          selectedRoundNumber
      );

      setScores(onlyThisRoundScores);
      setScrambleScores(
        onlyThisRoundScrambleScores
      );
      setBonusRows(onlyThisRoundBonuses);
      setCommentary(onlyThisRoundCommentary);
      setNotes(
        (notesResult.data ?? []) as ReportNote[]
      );
      setSavedReport(reportResult.data ?? null);

      if (reportResult.data?.report_text) {
        const reportText = String(
          reportResult.data.report_text
        );

        setGeneratedReport({
          title:
            reportResult.data.report_title ??
            extractReportTitle(reportText),
          report: reportText,
          characterCount: reportText.length,
          maxCharacters: MAX_REPORT_CHARACTERS,
        });
      } else {
        setGeneratedReport(null);
      }
    } catch (error) {
      console.error(
        "Could not load round report data:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load the selected round."
      );
    } finally {
      setIsLoadingRound(false);
    }
  }, [eventSlug, selectedRoundNumber]);

  useEffect(() => {
    loadSelectedRound();
  }, [loadSelectedRound]);

  useEffect(() => {
    if (
      !eventSlug ||
      selectedRoundNumber === null
    ) {
      return;
    }

    const channel = supabase
      .channel(
        `round-report-${eventSlug}-${selectedRoundNumber}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_moments",
          filter: `event_slug=eq.${eventSlug}`,
        },
        (payload) => {
          const row =
            payload.new && Object.keys(payload.new).length
              ? payload.new
              : payload.old;

          if (
            asNumber((row as any)?.round_number) ===
            selectedRoundNumber
          ) {
            setTimeout(loadSelectedRound, 200);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "round_report_notes",
          filter: `event_slug=eq.${eventSlug}`,
        },
        (payload) => {
          const row =
            payload.new && Object.keys(payload.new).length
              ? payload.new
              : payload.old;

          if (
            asNumber((row as any)?.round_number) ===
            selectedRoundNumber
          ) {
            setTimeout(loadSelectedRound, 200);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    eventSlug,
    selectedRoundNumber,
    loadSelectedRound,
  ]);

  const allRoundScoreRows = useMemo(() => {
    const combined = [
      ...scores,
      ...scrambleScores,
    ];

    const unique = new Map<string, any>();

    combined.forEach((row: any) => {
      const key = [
        row.event_slug,
        row.round_number,
        row.group_number,
        row.pair_number ?? "",
        row.player_id ?? row.player_name ?? "",
        row.hole_number,
        row.score_type ?? "",
      ].join("|");

      unique.set(key, row);
    });

    return Array.from(unique.values()).filter(
      (row: any) =>
        asNumber(row.round_number) ===
        selectedRoundNumber
    );
  }, [
    scores,
    scrambleScores,
    selectedRoundNumber,
  ]);

  const leaderboard = useMemo<
    LeaderboardRow[]
  >(() => {
    if (!tournament || !selectedRound) {
      return [];
    }

    const grouped = new Map<
      string,
      {
        name: string;
        points: number;
        holes: Set<number>;
        gross: number;
      }
    >();

    allRoundScoreRows.forEach((row: any) => {
      const isPair =
        row.pair_number !== null &&
        row.pair_number !== undefined;

      const name = isPair
        ? getPairName(
            tournament,
            selectedRound,
            row
          )
        : getPlayerName(tournament, row);

      const key = isPair
        ? `pair-${row.group_number}-${row.pair_number}`
        : `player-${
            row.player_id ??
            normaliseName(row.player_name)
          }`;

      const current = grouped.get(key) ?? {
        name,
        points: 0,
        holes: new Set<number>(),
        gross: 0,
      };

      current.points += asNumber(row.points);
      current.gross += asNumber(row.gross_score);

      if (asNumber(row.gross_score) > 0) {
        current.holes.add(
          asNumber(row.hole_number)
        );
      }

      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .map(([key, row]) => ({
        position: 0,
        key,
        name: row.name,
        points: row.points,
        through: row.holes.size,
        gross: row.gross,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }

        if (b.through !== a.through) {
          return b.through - a.through;
        }

        return a.gross - b.gross;
      })
      .map((row, index, rows) => {
        const previous = rows[index - 1];

        const tied =
          previous &&
          previous.points === row.points &&
          previous.through === row.through;

        return {
          ...row,
          position: tied
            ? previous.position
            : index + 1,
        };
      });
  }, [
    tournament,
    selectedRound,
    allRoundScoreRows,
  ]);

  const bonusWinners = useMemo<BonusWinner[]>(
    () =>
      bonusRows
        .filter(
          (row: any) =>
            asNumber(row.round_number) ===
            selectedRoundNumber
        )
        .map((row: any) => ({
          bonusType: String(
            row.bonus_type ??
              row.type ??
              "Bonus"
          ),
          holeNumber: asNumber(
            row.hole_number ?? row.hole
          ),
          winnerName: String(
            row.winner_player_name ??
              row.player_name ??
              row.winner_name ??
              "Winner"
          ),
          points: asNumber(row.points),
        })),
    [bonusRows, selectedRoundNumber]
  );

  const roundIsComplete = useMemo(() => {
    if (leaderboard.length === 0) return false;

    return leaderboard.every(
      (row) => row.through >= 18
    );
  }, [leaderboard]);

  async function addNote() {
    const cleanNote = noteText.trim();

    if (
      !cleanNote ||
      !eventSlug ||
      selectedRoundNumber === null
    ) {
      return;
    }

    setIsSavingNote(true);
    setErrorMessage("");
    setMessage("");

    try {
      const { error } = await supabase
        .from("round_report_notes")
        .insert({
          event_slug: eventSlug,
          round_number: selectedRoundNumber,
          note_type: noteType,
          note_text: cleanNote,
          is_headline: isHeadline,
        });

      if (error) throw error;

      setNoteText("");
      setNoteType("funny");
      setIsHeadline(false);
      setMessage("Moment added to this round.");
      await loadSelectedRound();
    } catch (error) {
      console.error("Could not add note:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save the moment."
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  function beginEditing(note: ReportNote) {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note_text);
  }

  async function saveEditedNote(
    note: ReportNote
  ) {
    const cleanText = editingNoteText.trim();

    if (!cleanText) return;

    setIsSavingNote(true);
    setErrorMessage("");
    setMessage("");

    try {
      const { error } = await supabase
        .from("round_report_notes")
        .update({
          note_text: cleanText,
        })
        .eq("id", note.id)
        .eq("event_slug", eventSlug)
        .eq(
          "round_number",
          selectedRoundNumber
        );

      if (error) throw error;

      setEditingNoteId(null);
      setEditingNoteText("");
      setMessage("Moment updated.");
      await loadSelectedRound();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update the moment."
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  async function toggleHeadline(
    note: ReportNote
  ) {
    try {
      const { error } = await supabase
        .from("round_report_notes")
        .update({
          is_headline: !note.is_headline,
        })
        .eq("id", note.id)
        .eq("event_slug", eventSlug)
        .eq(
          "round_number",
          selectedRoundNumber
        );

      if (error) throw error;

      await loadSelectedRound();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update the moment."
      );
    }
  }

  async function deleteNote(note: ReportNote) {
    const confirmed = window.confirm(
      "Delete this round moment?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("round_report_notes")
        .delete()
        .eq("id", note.id)
        .eq("event_slug", eventSlug)
        .eq(
          "round_number",
          selectedRoundNumber
        );

      if (error) throw error;

      setMessage("Moment deleted.");
      await loadSelectedRound();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the moment."
      );
    }
  }

  async function generateReport() {
    if (
      !tournament ||
      !selectedRound ||
      selectedRoundNumber === null
    ) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setMessage("");

    try {
      /*
       * Commentary is filtered again immediately before
       * transmission. No commentary from another round is
       * included in this payload.
       */
      const selectedRoundCommentary =
        commentary.filter(
          (moment) =>
            asNumber(moment.round_number) ===
            selectedRoundNumber
        );

      const selectedRoundNotes = notes.filter(
        (note) =>
          asNumber(note.round_number) ===
          selectedRoundNumber
      );

      const response = await fetch(
        "/api/generate-round-report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tournamentName: tournament.name,
            roundNumber: selectedRoundNumber,
            roundName: selectedRoundName,
            courseName: selectedCourse,
            format: selectedFormat,
            isFinalRound,
            nextRoundName: nextRound
              ? `${roundLabel(
                  nextRound,
                  selectedRoundIndex + 1
                )} — ${roundCourse(nextRound)}`
              : null,

            leaderboard: leaderboard.map(
              (row) => ({
                position: row.position,
                name: row.name,
                points: row.points,
                through: row.through,
                gross: row.gross,
              })
            ),

            bonusWinners,

            commentary:
              selectedRoundCommentary.map(
                (moment) => ({
                  icon: moment.icon,
                  title: moment.title,
                  text: moment.text,
                  momentType:
                    moment.moment_type,
                  holeNumber:
                    moment.hole_number,
                })
              ),

            notes: selectedRoundNotes.map(
              (note) => ({
                type: note.note_type,
                text: note.note_text,
                isHeadline:
                  note.is_headline,
              })
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "The report could not be generated."
        );
      }

      setGeneratedReport(data);
      setMessage(
        "Report generated. Review it before saving."
      );
    } catch (error) {
      console.error(
        "Could not generate report:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not generate the report."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyReport() {
    if (!generatedReport?.report) return;

    try {
      await navigator.clipboard.writeText(
        generatedReport.report
      );

      setMessage(
        "Report copied. It is ready to paste into WhatsApp."
      );
    } catch {
      setErrorMessage(
        "Could not copy automatically. Select the report text and copy it manually."
      );
    }
  }

  async function saveReportToEvent() {
    if (
      !generatedReport?.report ||
      !eventSlug ||
      selectedRoundNumber === null
    ) {
      return;
    }

    setIsSavingReport(true);
    setErrorMessage("");
    setMessage("");

    try {
      const reportTitle =
        generatedReport.title ||
        extractReportTitle(
          generatedReport.report
        );

      const { data, error } = await supabase
        .from("round_reports")
        .upsert(
          {
            event_slug: eventSlug,
            round_number:
              selectedRoundNumber,
            round_name: selectedRoundName,
            course_name: selectedCourse,
            report_title: reportTitle,
            report_text:
              generatedReport.report,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "event_slug,round_number",
          }
        )
        .select()
        .single();

      if (error) throw error;

      setSavedReport(data);
      setMessage(
        "Report saved. It is ready to display on the event page."
      );
    } catch (error) {
      console.error(
        "Could not save report:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save the report."
      );
    } finally {
      setIsSavingReport(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
        <div className="mx-auto max-w-4xl">
          Loading active tournament...
        </div>
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-5">
          No active tournament is selected.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 pb-32 text-slate-900 md:p-8 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-300">
            📰 Swift Tees Media Centre
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Round Report
          </h1>

          <p className="mt-2 text-sm font-semibold text-green-200">
            {tournament.name}
          </p>
        </section>

        {rounds.length > 0 && (
          <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
              Select round
            </p>

            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  rounds.length,
                  3
                )}, minmax(0, 1fr))`,
              }}
            >
              {rounds.map(
                (round: any, index: number) => {
                  const number = roundNumberFor(
                    round,
                    index
                  );

                  const selected =
                    number ===
                    selectedRoundNumber;

                  return (
                    <button
                      key={number}
                      type="button"
                      onClick={() => {
                        setSelectedRoundNumber(
                          number
                        );
                        setGeneratedReport(null);
                        setMessage("");
                        setErrorMessage("");
                      }}
                      className={`min-w-0 rounded-2xl border px-3 py-3 text-center transition ${
                        selected
                          ? "border-green-950 bg-green-950 text-white"
                          : "border-slate-200 bg-slate-50 text-green-950"
                      }`}
                    >
                      <span className="block text-sm font-black">
                        {roundCourse(round)}
                      </span>

                      <span className="mt-1 block text-[11px] font-bold opacity-75">
                        {roundLabel(round, index)}
                        {" • "}
                        {roundFormat(round)}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        )}

        {selectedRound && (
          <>
            <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-green-700">
                    Selected round
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-green-950">
                    {selectedCourse}
                  </h2>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {selectedRoundName}
                    {" • "}
                    {selectedFormat}
                  </p>
                </div>

                <div
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${
                    roundIsComplete
                      ? "bg-green-100 text-green-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {roundIsComplete
                    ? "✓ Complete"
                    : "Live round"}
                </div>
              </div>
            </section>

            <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-green-700">
                    Journalist&apos;s notebook
                  </p>

                  <h2 className="mt-1 text-xl font-black text-green-950">
                    Add a moment
                  </h2>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                  {notes.length} saved
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {NOTE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setNoteType(type.value)
                    }
                    className={`rounded-2xl border px-2 py-2.5 text-center transition ${
                      noteType === type.value
                        ? "border-green-900 bg-green-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block text-xl">
                      {type.icon}
                    </span>

                    <span className="mt-1 block text-[10px] font-black">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                value={noteText}
                onChange={(event) =>
                  setNoteText(event.target.value)
                }
                placeholder="What happened? Add it while it is still fresh..."
                rows={4}
                className="mt-3 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />

              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isHeadline}
                  onChange={(event) =>
                    setIsHeadline(
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-green-800"
                />

                <span>
                  <span className="block text-sm font-black text-amber-950">
                    ⭐ Headline moment
                  </span>

                  <span className="block text-xs font-semibold text-amber-800">
                    Give this extra importance in the
                    finished report.
                  </span>
                </span>
              </label>

              <button
                type="button"
                onClick={addNote}
                disabled={
                  isSavingNote ||
                  !noteText.trim()
                }
                className="mt-3 w-full rounded-2xl bg-green-700 px-5 py-3.5 text-base font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingNote
                  ? "Saving..."
                  : "➕ Add Moment"}
              </button>
            </section>

            {notes.length > 0 && (
              <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-xl font-black text-green-950">
                  Saved moments
                </h2>

                <div className="mt-3 space-y-2">
                  {notes.map((note) => {
                    const details =
                      noteTypeDetails(
                        note.note_type
                      );

                    const editing =
                      editingNoteId === note.id;

                    return (
                      <article
                        key={note.id}
                        className={`rounded-2xl border p-3 ${
                          note.is_headline
                            ? "border-amber-300 bg-amber-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">
                            {details.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                {details.label}
                              </span>

                              {note.is_headline && (
                                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-950">
                                  ⭐ Headline
                                </span>
                              )}

                              <span className="text-[10px] font-bold text-slate-400">
                                {formatTime(
                                  note.created_at
                                )}
                              </span>
                            </div>

                            {editing ? (
                              <div className="mt-2">
                                <textarea
                                  value={
                                    editingNoteText
                                  }
                                  onChange={(event) =>
                                    setEditingNoteText(
                                      event.target.value
                                    )
                                  }
                                  rows={3}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-green-700"
                                />

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      saveEditedNote(
                                        note
                                      )
                                    }
                                    className="rounded-xl bg-green-700 px-3 py-2 text-xs font-black text-white"
                                  >
                                    Save
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(
                                        null
                                      );
                                      setEditingNoteText(
                                        ""
                                      );
                                    }}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">
                                {note.note_text}
                              </p>
                            )}
                          </div>
                        </div>

                        {!editing && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleHeadline(note)
                              }
                              className="rounded-xl border border-amber-200 bg-white px-2 py-2 text-[11px] font-black text-amber-900"
                            >
                              {note.is_headline
                                ? "Remove ⭐"
                                : "Make ⭐"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                beginEditing(note)
                              }
                              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-[11px] font-black text-slate-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteNote(note)
                              }
                              className="rounded-xl border border-red-200 bg-white px-2 py-2 text-[11px] font-black text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-green-700">
                    Round-only source data
                  </p>

                  <h2 className="mt-1 text-xl font-black text-green-950">
                    What the report will use
                  </h2>
                </div>

                {isLoadingRound && (
                  <span className="text-xs font-black text-slate-500">
                    Refreshing...
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-black text-green-950">
                    {leaderboard.length}
                  </p>
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Score rows
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-black text-green-950">
                    {commentary.length}
                  </p>
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Commentary
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-black text-green-950">
                    {notes.length}
                  </p>
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Your moments
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3">
                <p className="text-sm font-black text-green-950">
                  ✓ Commentary locked to Round{" "}
                  {selectedRoundNumber}
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-green-800">
                  The database query and the generation
                  payload both filter by this exact round.
                  Commentary from other rounds is excluded.
                </p>
              </div>

              {leaderboard.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  {leaderboard.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-[42px_1fr_auto_auto] items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                    >
                      <span className="text-center text-sm font-black text-green-950">
                        {row.position}
                      </span>

                      <span className="truncate text-sm font-black text-slate-900">
                        {row.name}
                      </span>

                      <span className="text-sm font-black text-green-950">
                        {row.points} pts
                      </span>

                      <span className="text-xs font-bold text-slate-500">
                        Thru {row.through}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {commentary.length > 0 && (
                <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-black text-green-950">
                    View selected-round commentary
                  </summary>

                  <div className="space-y-2 border-t border-slate-200 p-3">
                    {commentary.map(
                      (moment, index) => (
                        <div
                          key={
                            moment.id ??
                            moment.moment_key ??
                            index
                          }
                          className="rounded-xl bg-white p-3"
                        >
                          <p className="text-sm font-black text-slate-900">
                            {moment.icon ?? "🎙️"}{" "}
                            {moment.title ??
                              "Live update"}
                          </p>

                          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                            {moment.text}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </details>
              )}
            </section>

            <section className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-green-950 p-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
                  Final production
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Generate the round story
                </h2>

                <p className="mt-2 text-sm font-semibold leading-6 text-green-200">
                  Scores, round-only commentary and your saved
moments will be turned into a short, detailed
and suitably disrespectful WhatsApp write-up.
                </p>
              </div>

              <div className="p-4">
                {!roundIsComplete && (
                  <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-black text-amber-950">
                      The round does not appear complete yet.
                    </p>

                    <p className="mt-1 text-xs font-semibold text-amber-800">
                      You can still test the report, but the
                      final result may change as more scores
                      are entered.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={generateReport}
                  disabled={
                    isGenerating ||
                    leaderboard.length === 0
                  }
                  className="w-full rounded-2xl bg-green-700 px-5 py-4 text-lg font-black text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating
                    ? "✨ Writing the report..."
                    : generatedReport
                    ? "🔄 Generate Another Version"
                    : "✨ Generate Round Report"}
                </button>

                {generatedReport && (
                  <div className="mt-4">
                    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="whitespace-pre-wrap text-[15px] font-semibold leading-7 text-slate-800">
                        {generatedReport.report}
                      </div>
                    </article>

                    <div className="mt-2 flex items-center justify-between gap-3 px-1">
                      <span
                        className={`text-xs font-black ${
                          generatedReport.characterCount >
                          generatedReport.maxCharacters
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}
                      >
                        {
                          generatedReport.characterCount
                        }{" "}
                        /{" "}
                        {
                          generatedReport.maxCharacters
                        }{" "}
                        characters
                      </span>

                      {savedReport && (
                        <span className="text-xs font-black text-green-700">
                          ✓ Saved to event
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={copyReport}
                        className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white"
                      >
                        📋 Copy for WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={saveReportToEvent}
                        disabled={isSavingReport}
                        className="rounded-2xl border border-green-700 bg-white px-4 py-3 text-sm font-black text-green-800 disabled:opacity-50"
                      >
                        {isSavingReport
                          ? "Saving..."
                          : savedReport
                          ? "💾 Update Event Report"
                          : "💾 Save to Event"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {message && (
          <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-900">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-800">
            {errorMessage}
          </div>
        )}

        <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/live-centre"
              className="flex items-center justify-center rounded-2xl bg-green-700 px-3 py-3 text-center text-xs font-black text-white"
            >
              🏆 Leaderboard
            </Link>

            <Link
              href="/full-scorecard"
              className="flex items-center justify-center rounded-2xl bg-green-700 px-3 py-3 text-center text-xs font-black text-white"
            >
              📊 Scorecard
            </Link>

            <Link
              href="/live-scoring-v2"
              className="flex items-center justify-center rounded-2xl bg-green-700 px-3 py-3 text-center text-xs font-black text-white"
            >
              📝 Scores
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}