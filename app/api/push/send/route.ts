import { NextResponse } from "next/server";
import { sendPushToAll } from "@/lib/server/push";

export async function POST(request: Request) {
  try {
    const { title, message } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        {
          error: "Title and message are required",
        },
        {
          status: 400,
        }
      );
    }

    const result = await sendPushToAll({
      title,
      message,

      // All Swift Tees notifications open Live Centre.
      url: "/live-centre",
    });

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    console.error("Push send route error:", error);

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