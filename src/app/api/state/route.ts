import { NextRequest, NextResponse } from "next/server";
import { isAuthConfigured, requestSessionUser, type SessionUser } from "@/lib/server/auth";
import { readUserState, writeUserState } from "@/lib/server/state";
import { isStateDocument } from "@/lib/sync/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function accessDenied(request: NextRequest): NextResponse | SessionUser {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Private sync is not configured yet." }, { status: 503 });
  }
  const user = requestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "需要登录。" }, { status: 401 });
  }
  return user;
}

export async function GET(request: NextRequest) {
  const access = accessDenied(request);
  if (access instanceof NextResponse) return access;
  return NextResponse.json(
    { document: await readUserState(access.id) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: NextRequest) {
  const access = accessDenied(request);
  if (access instanceof NextResponse) return access;
  const body = await request.json().catch(() => null) as { document?: unknown } | null;
  if (!body || !isStateDocument(body.document)) {
    return NextResponse.json({ error: "同步数据格式无效。" }, { status: 400 });
  }
  const document = await writeUserState(access.id, body.document);
  return NextResponse.json({ document }, { headers: { "Cache-Control": "no-store" } });
}
