import { NextRequest, NextResponse } from "next/server";
import { buildPassportSummary } from "@/lib/server/passport";
import { passportSessionUser, readUserState } from "@/lib/server/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await passportSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "需要已登录账号或已配对的设备令牌。" }, { status: 401 });
  }
  return NextResponse.json(buildPassportSummary(await readUserState(user.id)), {
    headers: { "Cache-Control": "no-store" },
  });
}
