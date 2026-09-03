export const SYNC_STORAGE_KEYS = [
  "chillmxmk-achievements",
  "chillmxmk-ambient",
  "chillmxmk-diary",
  "chillmxmk-devlog",
  "chillmxmk-habits",
  "chillmxmk-intimacy",
  "chillmxmk-launch",
  "chillmxmk-player",
  "chillmxmk-pomodoro",
  "chillmxmk-scene",
  "chillmxmk-story",
  "chillmxmk-todo",
  "chillmxmk-voice-triggers",
  "chillmxmk-widgets",
] as const;

export type SyncStorageKey = (typeof SYNC_STORAGE_KEYS)[number];

export type StateDocument = {
  version: 1;
  updatedAt: string;
  records: Partial<Record<SyncStorageKey, string>>;
};

const MAX_RECORD_BYTES = 1024 * 1024;
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

export function isStateDocument(value: unknown): value is StateDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StateDocument>;
  if (candidate.version !== 1 || typeof candidate.updatedAt !== "string") return false;
  if (!candidate.records || typeof candidate.records !== "object") return false;

  let totalBytes = 0;
  for (const [key, record] of Object.entries(candidate.records)) {
    if (!SYNC_STORAGE_KEYS.includes(key as SyncStorageKey) || typeof record !== "string") {
      return false;
    }
    const bytes = new TextEncoder().encode(record).byteLength;
    if (bytes > MAX_RECORD_BYTES) return false;
    totalBytes += bytes;
  }
  return totalBytes <= MAX_DOCUMENT_BYTES;
}
