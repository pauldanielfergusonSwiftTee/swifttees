import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_REPORT_CHARACTERS = 3200;

type GenerateReportBody = {
  tournamentName: string;
  roundNumber: number;
  roundName: string;
  courseName: string;
  format: string;
  isFinalRound: boolean;
  nextRoundName?: string | null;
  leaderboard: Array<{
    position: number;
    name: string;
    points: number;
    through: number;
    gross?: number;
  }>;
  bonusWinners: Array<{
    bonusType: string;
    holeNumber: number;
    winnerName: string;
    points: number;
  }>;
  commentary: Array<{
    icon?: string;
    title?: string;
    text: string;
    momentType?: string;
    holeNumber?: number | null;
  }>;
  notes: Array<{
    type: string;
    text: string;
    isHeadline: boolean;
  }>;
};

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function trimReport(report: string) {
  const cleaned = report
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length <= MAX_REPORT_CHARACTERS) {
    return cleaned;
  }

  const shortened = cleaned.slice(0, MAX_REPORT_CHARACTERS - 1);
  const lastParagraph = shortened.lastIndexOf("\n\n");

  if (lastParagraph > 2500) {
    return shortened.slice(0, lastParagraph).trim();
  }

  const lastSentence = Math.max(
    shortened.lastIndexOf(". "),
    shortened.lastIndexOf("! "),
    shortened.lastIndexOf("? ")
  );

  if (lastSentence > 2500) {
    return shortened.slice(0, lastSentence + 1).trim();
  }

  return shortened.trim();
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it to .env.local and restart the app.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as GenerateReportBody;

    if (!body.tournamentName || !body.roundNumber) {
      return NextResponse.json(
        { error: "Tournament and round information are required." },
        { status: 400 }
      );
    }

    const leaderboard = Array.isArray(body.leaderboard)
      ? body.leaderboard
      : [];

    const notes = Array.isArray(body.notes) ? body.notes : [];

    const commentary = Array.isArray(body.commentary)
      ? body.commentary
      : [];

    const bonusWinners = Array.isArray(body.bonusWinners)
      ? body.bonusWinners
      : [];

    const verifiedFacts = {
      tournament: cleanText(body.tournamentName),
      roundNumber: Number(body.roundNumber),
      roundName: cleanText(body.roundName),
      course: cleanText(body.courseName),
      format: cleanText(body.format),
      isFinalRound: Boolean(body.isFinalRound),
      nextRoundName: cleanText(body.nextRoundName),
      leaderboard: leaderboard.map((row) => ({
        position: Number(row.position),
        name: cleanText(row.name),
        points: Number(row.points ?? 0),
        through: Number(row.through ?? 0),
        gross:
          row.gross === undefined ? undefined : Number(row.gross ?? 0),
      })),
      bonusWinners: bonusWinners.map((winner) => ({
        bonusType: cleanText(winner.bonusType),
        holeNumber: Number(winner.holeNumber ?? 0),
        winnerName: cleanText(winner.winnerName),
        points: Number(winner.points ?? 0),
      })),
    };

    const roundCommentary = commentary.map((moment) => ({
      icon: cleanText(moment.icon),
      title: cleanText(moment.title),
      text: cleanText(moment.text),
      momentType: cleanText(moment.momentType),
      holeNumber:
        moment.holeNumber === null ||
        moment.holeNumber === undefined
          ? null
          : Number(moment.holeNumber),
    }));

    const journalistNotes = notes.map((note) => ({
      category: cleanText(note.type),
      text: cleanText(note.text),
      headlineMoment: Boolean(note.isHeadline),
    }));

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model:
        process.env.OPENAI_ROUND_REPORT_MODEL ??
        "gpt-5-mini",

      store: false,

     instructions: `
You are the unofficial Swift Tees golf society reporter.

Write a short, funny and detailed end-of-round summary for the society WhatsApp group.

The report should feel like it was written by someone who spent the day walking with the players, heard all the excuses and noticed the little incidents everyone will remember.

TONE:
- British golf-society group-chat humour.
- Affectionate, cheeky and observant.
- Take the mickey out of players where the supplied information supports it.
- Celebrate genuinely good golf, but do not become overly dramatic or sentimental.
- Avoid exaggerated television commentary, grand sporting language and phrases such as "historic", "epic", "warrior", "gladiator", "destiny" or "the golfing gods".
- Never be cruel, personal or insulting.
- Make organisers, favourites and confident players fair targets for banter too.
- Prefer specific incidents over generic praise.

FACT RULES:
1. VERIFIED ROUND FACTS are authoritative.
2. Never change positions, points, scores, winners, course, round or format.
3. Never invent a birdie, eagle, collapse, lead change, quote, excuse, bad shot or funny incident.
4. Use commentary and journalist notes only when they are supplied.
5. Every supplied commentary item belongs only to the selected round.
6. Do not include or imply anything from another round.
7. If a detail is unclear, leave it out.
8. Headline notes deserve extra emphasis.
9. Do not state that someone played badly unless the scores or supplied notes support it.
10. Player jokes must come from the supplied notes, commentary or player-profile information.

WRITING STYLE:
- Aim for 220 to 320 words.
- Keep the complete response below 3,200 characters.
- Start with a short headline.
- Use short WhatsApp-friendly paragraphs.
- Focus on memorable detail rather than describing every leaderboard position.
- Mention the winner and key result clearly.
- Include the best supplied stories, incidents, excuses, quotes and disasters.
- Use callbacks when the same joke or behaviour appears more than once.
- Take the mickey out of two or three people where justified, rather than forcing a joke about everyone.
- Use names naturally.
- Avoid vague sentences such as "he showed great composure" unless the facts genuinely demonstrate it.
- Avoid formal phrases such as "the stage was set", "under mounting pressure" or "a thrilling contest unfolded".
- Use no markdown table.
- Use no more than three emojis.
- Do not introduce the answer with "Here is the report".
- Do not mention AI, prompts, databases or supplied information.
- If another round remains, finish with one short joke or preview about what comes next.
- If this was the final round, finish with a funny or satisfying closing line.
- End cleanly and never mid-sentence.
`.trim(),

      input: `
Write the Swift Tees report using only the information below.

VERIFIED ROUND FACTS:
${JSON.stringify(verifiedFacts, null, 2)}

SELECTED-ROUND LIVE COMMENTARY:
${JSON.stringify(roundCommentary, null, 2)}

JOURNALIST NOTES ADDED DURING THIS ROUND:
${JSON.stringify(journalistNotes, null, 2)}
      `.trim(),
    });

    const report = trimReport(response.output_text ?? "");

    if (!report) {
      return NextResponse.json(
        { error: "OpenAI returned an empty report." },
        { status: 500 }
      );
    }

    const firstLine =
      report
        .split("\n")
        .map((line) => line.trim())
        .find(Boolean) ?? `Round ${body.roundNumber} Report`;

    const title = firstLine
      .replace(/^#+\s*/, "")
      .replace(/^\*\*/, "")
      .replace(/\*\*$/, "")
      .trim();

    return NextResponse.json({
      title,
      report,
      characterCount: report.length,
      maxCharacters: MAX_REPORT_CHARACTERS,
    });
  } catch (error) {
    console.error("Round report generation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The round report could not be generated.",
      },
      { status: 500 }
    );
  }
}