import { NextRequest, NextResponse } from "next/server";
import { authenticateAccount, validateAccountInput, AccountInputError } from "@/lib/server/accounts";
import { createUserSession, isAuthConfigured, userSessionCookie } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Private sync is not configured yet." }, { status: 503 });
  }
  const body = await request.json().catch(() => null) as { username?: unknown; password?: unknown } | null;
  try {
    const input = validateAccountInput(body?.username, body?.password);
    const user = await authenticateAccount(input.username, input.password);
    if (!user) return NextResponse.json({ error: "账号或密码不正确。" }, { status: 401 });
    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(userSessionCookie(createUserSession(user)));
    return response;
  } catch (error) {
    if (error instanceof AccountInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
