import { createJSONStorage } from "zustand/middleware";
import { SYNC_STORAGE_KEYS, fingerprint, isStateDocument, type StateDocument } from "./schema";

export const OWNER_KEY = "virtualink-storage-owner-v1";
export const AUTH_EPOCH_KEY = "virtualink-auth-epoch-v1";
const owner = typeof window === "undefined" ? null : window.localStorage.getItem(OWNER_KEY);
export function storageKey(key: string, account: string | null = owner): string {
  return account ? `virtualink-account:${encodeURIComponent(account)}:${key}` : key;
}
export function currentOwner(): string | null { return owner; }
export function epoch(): string | null { return window.localStorage.getItem(AUTH_EPOCH_KEY); }
export function authPending(): boolean {
  const value = epoch();
  return Boolean(value?.startsWith("pending:") && Date.now() - Number(value.split(":")[1]) < 30_000);
}
export function canWrite(): boolean { return window.localStorage.getItem(OWNER_KEY) === owner; }
export function authChanging(): void {
  window.localStorage.setItem(AUTH_EPOCH_KEY, `pending:${Date.now()}:${crypto.randomUUID()}`);
  window.dispatchEvent(new Event("virtualink-auth-changing"));
}
export function authChanged(): void {
  window.localStorage.setItem(AUTH_EPOCH_KEY, crypto.randomUUID());
  window.dispatchEvent(new Event("virtualink-auth-changed"));
}
export function selectOwner(account: string | null): boolean {
  if (account === owner) return false;
  if (account) window.localStorage.setItem(OWNER_KEY, account);
  else window.localStorage.removeItem(OWNER_KEY);
  window.location.reload();
  return true;
}
export const accountStorage = createJSONStorage(() => ({
  getItem: (key: string) => window.localStorage.getItem(storageKey(key)),
  setItem: (key: string, value: string) => { if (canWrite()) window.localStorage.setItem(storageKey(key), value); },
  removeItem: (key: string) => { if (canWrite()) window.localStorage.removeItem(storageKey(key)); },
}));
export function createDocument(): StateDocument {
  const records: StateDocument["records"] = {};
  for (const key of SYNC_STORAGE_KEYS) {
    const value = window.localStorage.getItem(storageKey(key));
    if (value !== null) records[key] = value;
  }
  return { version: 1, updatedAt: new Date().toISOString(), records };
}
export function applyDocument(document: StateDocument): boolean {
  if (!canWrite()) return false;
  const before = createDocument();
  const changed = SYNC_STORAGE_KEYS.some(key => before.records[key] !== document.records[key]);
  if (!changed) return false;
  // Preserve replaced values for recovery; guest records never enter account sync.
  window.localStorage.setItem(`virtualink-recovery:${owner ?? "guest"}:${crypto.randomUUID()}`, JSON.stringify(before));
  for (const key of SYNC_STORAGE_KEYS) {
    const value = document.records[key];
    if (typeof value === "string") window.localStorage.setItem(storageKey(key), value);
    else window.localStorage.removeItem(storageKey(key));
  }
  return true;
}
export function hasGuestData(): boolean {
  return SYNC_STORAGE_KEYS.some(key => window.localStorage.getItem(key) !== null);
}
export async function importGuestData(): Promise<void> {
  if (!owner || !canWrite() || authPending()) return;
  const token = epoch();
  // Refresh the account first: an import clicked before bootstrap must not
  // overwrite an existing server account with an empty local namespace.
  const response = await fetch("/api/state", { cache: "no-store", headers: { "X-Virtualink-Owner": owner } });
  if (!response.ok) throw new Error("无法读取账号数据，请稍后重试导入。");
  const payload = await response.json() as { ownerId: string; document: StateDocument | null };
  if (!canWrite() || token !== epoch() || payload.ownerId !== owner) return;
  if (payload.document !== null && !isStateDocument(payload.document)) throw new Error("账号数据格式无效。");
  const remote = payload.document ?? { version: 1 as const, updatedAt: new Date().toISOString(), records: {} };
  const local = createDocument();
  const baseline = window.localStorage.getItem(storageKey("sync-baseline"));
  const dirty = baseline !== null && fingerprint(local) !== baseline;
  const records: StateDocument["records"] = {};
  let previous: Map<string, string | null> | null = null;
  if (dirty) {
    try { previous = new Map(JSON.parse(baseline!)); } catch { /* Preserve local data if a baseline is damaged. */ }
  }
  for (const key of SYNC_STORAGE_KEYS) {
    // A missing local key can be an intentional deletion. Choose remote only
    // for keys unchanged locally since the baseline, including newly remote keys.
    const changedLocally = dirty && (!previous || (local.records[key] ?? null) !== previous.get(key));
    const value = changedLocally ? local.records[key] : remote.records[key];
    if (value !== undefined) records[key] = value;
  }
  if (dirty) window.localStorage.setItem(`virtualink-recovery:${owner}:${crypto.randomUUID()}`, JSON.stringify(remote));
  for (const key of SYNC_STORAGE_KEYS) {
    const guest = window.localStorage.getItem(key);
    if (guest !== null && records[key] === undefined) records[key] = guest;
  }
  applyDocument({ version: 1, updatedAt: new Date().toISOString(), records });
  window.localStorage.setItem(storageKey("sync-baseline"), fingerprint(remote));
  window.location.reload();
}
