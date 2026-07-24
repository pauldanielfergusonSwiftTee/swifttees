import { NextRequest, NextResponse } from "next/server";

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/live-centre/:path*",
    "/live-scoring-v2/:path*",
    "/setup-v2/:path*",
  ],
};