import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { getPool, ensureSchema } from "./db";
import type { SessionUser } from "./auth";

const SCRYPT_KEY_LENGTH = 64;
const USERNAME_PATTERN = /^[\p{L}\p{N}_.-]{3,32}$/u;
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };

type AccountRow = {
  id: string;
  username: string;
  password_hash: string;
};

export class AccountInputError extends Error {}
export class AccountExistsError extends Error {}

export function normalizeUsername(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function validateAccountInput(username: unknown, password: unknown): { username: string; password: string } {
  if (typeof username !== "string" || typeof password !== "string") {
    throw new AccountInputError("请输入账号和密码。");
  }
  const displayName = username.trim();
  if (!USERNAME_PATTERN.test(displayName)) {
    throw new AccountInputError("账号需为 3–32 个字，可使用中英文、数字、下划线、点或连字符。");
  }
  if (password.length < 8 || password.length > 128) {
    throw new AccountInputError("密码长度需为 8–128 个字符。");
  }
  return { username: displayName, password };
}

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await derivePassword(password, salt);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

async function passwordMatches(password: string, stored: string): Promise<boolean> {
  const [algorithm, encodedSalt, encodedHash, ...extra] = stored.split("$");
  if (algorithm !== "scrypt" || !encodedSalt || !encodedHash || extra.length) return false;
  try {
    const salt = Buffer.from(encodedSalt, "base64url");
    const expected = Buffer.from(encodedHash, "base64url");
    if (salt.length !== 16 || expected.length !== SCRYPT_KEY_LENGTH) return false;
    const actual = await derivePassword(password, salt);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function toSessionUser(row: Pick<AccountRow, "id" | "username">): SessionUser {
  return { id: row.id, username: row.username };
}

export async function hasAccounts(): Promise<boolean> {
  await ensureSchema();
  const result = await getPool().query("SELECT 1 FROM virtualink_users LIMIT 1");
  return result.rows.length > 0;
}

export async function registerAccount(username: string, password: string): Promise<SessionUser> {
  const usernameKey = normalizeUsername(username);
  const passwordHash = await hashPassword(password);
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    // Serializes the first-account migration so legacy owner data can only be
    // claimed once, even if two browsers register at nearly the same time.
    await client.query("SELECT pg_advisory_xact_lock(84390924)");
    const existing = await client.query("SELECT 1 FROM virtualink_users LIMIT 1");
    const account = await client.query<AccountRow>(
      `INSERT INTO virtualink_users (id, username, username_key, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, password_hash`,
      [randomUUID(), username, usernameKey, passwordHash]
    );
    const user = toSessionUser(account.rows[0]!);
    if (existing.rows.length === 0) {
      await client.query("UPDATE virtualink_state SET owner_id = $1 WHERE owner_id = 'owner'", [user.id]);
      await client.query("UPDATE virtualink_devices SET user_id = $1 WHERE user_id IS NULL", [user.id]);
    }
    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new AccountExistsError("该账号已注册，请直接登录。");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function authenticateAccount(username: string, password: string): Promise<SessionUser | null> {
  const usernameKey = normalizeUsername(username);
  await ensureSchema();
  const result = await getPool().query<AccountRow>(
    "SELECT id, username, password_hash FROM virtualink_users WHERE username_key = $1",
    [usernameKey]
  );
  const account = result.rows[0];
  if (!account || !(await passwordMatches(password, account.password_hash))) return null;
  return toSessionUser(account);
}
