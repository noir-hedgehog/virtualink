import { NextRequest, NextResponse } from "next/server";
import { isAuthConfigured, requestSessionUser } from "@/lib/server/auth";
import { createPassportDevice } from "@/lib/server/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = isAuthConfigured() ? requestSessionUser(request) : null;
  if (!user) {
    return NextResponse.json({ error: "需要登录。" }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as { name?: unknown } | null;
  const device = await createPassportDevice(user.id, typeof body?.name === "string" ? body.name : "AI Passport");
  return NextResponse.json({ device }, { headers: { "Cache-Control": "no-store" } });
}
