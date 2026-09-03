import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "virtualink_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = { id: string; username: string };
type SessionPayload = SessionUser & { exp: number; role: "user" };

function getSecret(): string | null {
  return process.env.VIRTUALINK_AUTH_SECRET?.trim() || null;
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isAuthConfigured(): boolean {
  return Boolean(getSecret());
}

export function createUserSession(user: SessionUser): string {
  const secret = getSecret();
  if (!secret) throw new Error("VIRTUALINK_AUTH_SECRET is not configured");
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    role: "user",
  };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded, secret)}`;
}

export function sessionUserFromToken(token: string | undefined): SessionUser | null {
  const secret = getSecret();
  if (!secret || !token) return null;

  const [encoded, receivedSignature, ...extra] = token.split(".");
  if (!encoded || !receivedSignature || extra.length) return null;
  const expectedSignature = sign(encoded, secret);
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (
      payload.role !== "user" ||
      typeof payload.id !== "string" ||
      !payload.id ||
      typeof payload.username !== "string" ||
      !payload.username ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= Date.now() / 1000
    ) {
      return null;
    }
    return { id: payload.id, username: payload.username };
  } catch {
    return null;
  }
}

export function requestSessionUser(request: NextRequest): SessionUser | null {
  return sessionUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export function userSessionCookie(value: string) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    // Tailscale-only deployments can use encrypted tailnet HTTP without a
    // public TLS terminator. Set this to true as soon as HTTPS is configured.
    secure: process.env.VIRTUALINK_SECURE_COOKIE === "true",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function expiredUserSessionCookie() {
  return { ...userSessionCookie(""), maxAge: 0 };
}
