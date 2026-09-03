import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var virtualinkPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var virtualinkSchemaPromise: Promise<void> | undefined;
}

function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is not configured");
  return value;
}

export function getPool(): Pool {
  if (!globalThis.virtualinkPool) {
    globalThis.virtualinkPool = new Pool({ connectionString: databaseUrl(), max: 5 });
  }
  return globalThis.virtualinkPool;
}

export async function ensureSchema(): Promise<void> {
  if (!globalThis.virtualinkSchemaPromise) {
    globalThis.virtualinkSchemaPromise = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS virtualink_state (
          owner_id TEXT PRIMARY KEY,
          document JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS virtualink_users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          username_key TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS virtualink_devices (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          name TEXT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at TIMESTAMPTZ
        )
      `);
      await pool.query("ALTER TABLE virtualink_devices ADD COLUMN IF NOT EXISTS user_id TEXT");
      await pool.query("CREATE INDEX IF NOT EXISTS virtualink_devices_user_id_idx ON virtualink_devices (user_id)");
    })().catch((error) => {
      globalThis.virtualinkSchemaPromise = undefined;
      throw error;
    });
  }
  await globalThis.virtualinkSchemaPromise;
}

export async function databaseHealthy(): Promise<void> {
  await ensureSchema();
  await getPool().query("SELECT 1");
}
