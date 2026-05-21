import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, cookieName, cookieMaxAge } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUser = process.env.DEMO_USERNAME ?? "admin";
  const validPass = process.env.DEMO_PASSWORD ?? "admin";

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true });

  res.cookies.set(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: cookieMaxAge(),
    path: "/",
  });

  return res;
}
