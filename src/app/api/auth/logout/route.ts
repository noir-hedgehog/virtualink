import { NextResponse } from "next/server";
import { expiredUserSessionCookie } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(expiredUserSessionCookie());
  return response;
}
