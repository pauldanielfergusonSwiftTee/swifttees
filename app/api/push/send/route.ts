import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendPushToAll } from "@/lib/server/push";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessCookie = cookieStore.get("swifttees_access");

    if (accessCookie?.value !== "allowed") {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

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
      category: "admin",
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