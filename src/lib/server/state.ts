import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getPool, ensureSchema } from "./db";
import { requestSessionUser, type SessionUser } from "./auth";
import type { StateDocument } from "@/lib/sync/schema";

type StateRow = { document: StateDocument; updated_at: Date };
type DeviceRow = { id: string; name: string; user_id: string | null };

export async function readUserState(userId: string): Promise<StateDocument | null> {
  await ensureSchema();
  const result = await getPool().query<StateRow>(
    "SELECT document, updated_at FROM virtualink_state WHERE owner_id = $1",
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ...row.document, updatedAt: row.updated_at.toISOString() };
}

export async function writeUserState(userId: string, document: StateDocument): Promise<StateDocument> {
  await ensureSchema();
  const result = await getPool().query<StateRow>(
    `INSERT INTO virtualink_state (owner_id, document, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (owner_id) DO UPDATE SET document = EXCLUDED.document, updated_at = NOW()
     RETURNING document, updated_at`,
    [userId, JSON.stringify({ ...document, updatedAt: undefined })]
  );
  const row = result.rows[0]!;
  return { ...row.document, updatedAt: row.updated_at.toISOString() };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPassportDevice(userId: string, name: string) {
  await ensureSchema();
  const device = {
    id: randomUUID(),
    name: name.trim().slice(0, 80) || "AI Passport",
    token: randomBytes(32).toString("base64url"),
  };
  await getPool().query(
    "INSERT INTO virtualink_devices (id, user_id, name, token_hash) VALUES ($1, $2, $3, $4)",
    [device.id, userId, device.name, hashToken(device.token)]
  );
  return device;
}

async function isPassportDeviceToken(token: string | null): Promise<DeviceRow | null> {
  if (!token) return null;
  await ensureSchema();
  const result = await getPool().query<DeviceRow>(
    `UPDATE virtualink_devices
     SET last_seen_at = NOW()
     WHERE token_hash = $1 AND user_id IS NOT NULL
     RETURNING id, name, user_id`,
    [hashToken(token)]
  );
  return result.rows[0] ?? null;
}

export async function passportSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const sessionUser = requestSessionUser(request);
  if (sessionUser) return sessionUser;
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  const device = await isPassportDeviceToken(token);
  return device?.user_id ? { id: device.user_id, username: "AI Passport" } : null;
}
