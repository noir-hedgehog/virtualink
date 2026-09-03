import { NextRequest, NextResponse } from "next/server";
import { AccountExistsError, AccountInputError, registerAccount, validateAccountInput } from "@/lib/server/accounts";
import { createUserSession, isAuthConfigured, userSessionCookie } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "私有同步服务尚未配置。" }, { status: 503 });
  }
  const body = await request.json().catch(() => null) as { username?: unknown; password?: unknown } | null;
  try {
    const input = validateAccountInput(body?.username, body?.password);
    const user = await registerAccount(input.username, input.password);
    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(userSessionCookie(createUserSession(user)));
    return response;
  } catch (error) {
    if (error instanceof AccountInputError || error instanceof AccountExistsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
