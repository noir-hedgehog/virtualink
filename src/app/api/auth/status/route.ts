import { NextRequest, NextResponse } from "next/server";
import { hasAccounts } from "@/lib/server/accounts";
import { isAuthConfigured, requestSessionUser } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const configured = isAuthConfigured();
  const user = configured ? requestSessionUser(request) : null;
  return NextResponse.json(
    {
      configured,
      authenticated: Boolean(user),
      user: user ? { username: user.username } : null,
      hasAccounts: configured ? await hasAccounts() : false,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
