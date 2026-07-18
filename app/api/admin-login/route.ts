import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "swifttees_access";
const COOKIE_VALUE = "allowed";

const PROTECTED_PATHS = [
  "/live-centre",
  "/live-scoring-v2",
  "/setup-v2",
];

function getSafeRedirect(value: string) {
  const isProtected = PROTECTED_PATHS.some(
    (path) => value === path || value.startsWith(`${path}/`)
  );

  return value.startsWith("/") &&
    !value.startsWith("//") &&
    isProtected
    ? value
    : "/live-centre";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const password = String(formData.get("password") ?? "");
  const redirect = getSafeRedirect(
    String(formData.get("redirect") ?? "")
  );

  const correctPassword =
    process.env.ADMIN_PASSWORD ?? "swifttees";

  if (password !== correctPassword) {
    const loginUrl = new URL("/admin-login", request.url);

    loginUrl.searchParams.set("error", "incorrect");
    loginUrl.searchParams.set("redirect", redirect);

    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(
    new URL(redirect, request.url),
    303
  );

  response.cookies.set({
    name: COOKIE_NAME,
    value: COOKIE_VALUE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}