import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "swifttees_access";
const COOKIE_VALUE = "allowed";

export function proxy(request: NextRequest) {
  const hasAccess =
    request.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;

  if (hasAccess) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin-login", request.url);

  loginUrl.searchParams.set(
    "redirect",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/live-centre/:path*",
    "/live-scoring-v2/:path*",
    "/setup-v2/:path*",
  ],
};