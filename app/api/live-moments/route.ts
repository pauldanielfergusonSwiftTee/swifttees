import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushToAll } from "@/lib/server/push";

type LiveMomentInput = {
  event_slug: string;
  moment_key: string;
  moment_type: string;

  player_id?: number | null;
  player_name?: string | null;
  team?: string | null;

  round_number?: number | null;
  hole_number?: number | null;

  icon: string;
  title: string;
  text: string;

  rarity: "common" | "rare" | "major";
};

/*
 * Commentary types that should always produce
 * a Live Update notification when first created.
 */
const LIVE_UPDATE_TYPES = new Set([
  "stableford_birdie",
  "stableford_eagle",

  "scramble_birdie",
  "scramble_eagle",

  "scramble_lead_taken",
  "scramble_lead_joined",
  "scramble_gap_cut_to_one",
  "scramble_gap_reduced",
  "scramble_movement_up",
  "scramble_lead_extended",

  "movement_up",
  "movement_down",

  "battle_alert",
  "team_battle",
]);

function shouldSendLiveUpdate(
  moment: LiveMomentInput
) {
  /*
   * Storylines represent things such as:
   *
   * - new leaders
   * - joined leaders
   * - pressure on the leaders
   * - major climbs/drops
   * - team lead changes
   *
   * These are notification-worthy by definition.
   */
  if (
    moment.moment_type?.startsWith("storyline_")
  ) {
    return true;
  }

  /*
   * Birdies, eagles, leaderboard moves and
   * team-race moments.
   */
  if (
    LIVE_UPDATE_TYPES.has(moment.moment_type)
  ) {
    return true;
  }

  /*
   * This catches important commentary generated
   * from an otherwise ordinary score.
   *
   * Example:
   * a par might cause a major lead change even
   * though its moment_type is stableford_score.
   */
  if (moment.rarity === "major") {
    return true;
  }

  return false;
}

function buildNotificationMessage(
  moment: LiveMomentInput
) {
  const icon = moment.icon
    ? `${moment.icon} `
    : "";

  return `${icon}${moment.title} — ${moment.text}`;
}

export async function POST(request: Request) {
  try {
    const moment =
      (await request.json()) as LiveMomentInput;

    if (
      !moment.event_slug ||
      !moment.moment_key ||
      !moment.moment_type ||
      !moment.title ||
      !moment.text
    ) {
      return NextResponse.json(
        {
          error: "Invalid live moment",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Missing Supabase server environment variables"
      );

      return NextResponse.json(
        {
          error:
            "Server Supabase configuration is incomplete",
        },
        {
          status: 500,
        }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    /*
     * IMPORTANT:
     *
     * Use INSERT rather than UPSERT.
     *
     * The unique constraint on:
     *
     *   event_slug,moment_key
     *
     * is our notification lock.
     *
     * Only the request that genuinely creates
     * the moment is allowed to continue to push.
     */
    const { data: createdMoment, error } =
      await supabase
        .from("live_moments")
        .insert({
          event_slug: moment.event_slug,
          moment_key: moment.moment_key,
          moment_type: moment.moment_type,

          player_id: moment.player_id ?? null,
          player_name:
            moment.player_name ?? null,
          team: moment.team ?? null,

          round_number:
            moment.round_number ?? null,
          hole_number:
            moment.hole_number ?? null,

          icon: moment.icon ?? "",
          title: moment.title,
          text: moment.text,

          rarity: moment.rarity ?? "common",
        })
        .select("*")
        .single();

    /*
     * PostgreSQL 23505 = unique constraint violation.
     *
     * The moment already exists.
     *
     * This is normal and, crucially,
     * MUST NOT send another notification.
     */
    if (error?.code === "23505") {
      return NextResponse.json({
        success: true,
        created: false,
        duplicate: true,
        notificationSent: false,
      });
    }

    if (error) {
      console.error(
        "Error creating live moment:",
        error
      );

      return NextResponse.json(
        {
          error: "Failed to create live moment",
          details: error.message,
        },
        {
          status: 500,
        }
      );
    }

    let notificationSent = false;
    let pushSent = 0;
    let pushFailed = 0;

    if (shouldSendLiveUpdate(moment)) {
      try {
        const pushResult =
          await sendPushToAll({
            title: "⛳ Live Update",
            message:
              buildNotificationMessage(moment),
            url: "/live-centre",
          });

        pushSent = pushResult.sent;
        pushFailed = pushResult.failed;

        notificationSent =
          pushResult.sent > 0;
      } catch (pushError) {
        /*
         * Do not undo the commentary moment if
         * push delivery itself fails.
         */
        console.error(
          "Automatic commentary push failed:",
          pushError
        );
      }
    }

    return NextResponse.json({
      success: true,
      created: true,
      duplicate: false,
      notificationSent,
      pushSent,
      pushFailed,
      moment: createdMoment,
    });
  } catch (error) {
    console.error(
      "Live moment route error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unexpected server error",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}