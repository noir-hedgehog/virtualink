import { NextResponse } from "next/server";
import { databaseHealthy } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await databaseHealthy();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { ok: false, error: "database_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
