import type { StateDocument } from "@/lib/sync/schema";

type PersistedStore<T> = { state?: T; version?: number };

function readStore<T>(document: StateDocument | null, key: string): T | null {
  const record = document?.records[key as keyof typeof document.records];
  if (!record) return null;
  try {
    return (JSON.parse(record) as PersistedStore<T>).state ?? null;
  } catch {
    return null;
  }
}

type Todo = { id: string; title: string; done: boolean; createdAt: string };
type Pomodoro = {
  phase: "work" | "rest";
  remainingSeconds: number;
  workMinutes: number;
  restMinutes: number;
  cycle: number;
  level: number;
  isRunning: boolean;
};
type Scene = { currentCharacterId: string | null };

export function buildPassportSummary(document: StateDocument | null) {
  const todos = readStore<{ items?: Todo[] }>(document, "chillmxmk-todo")?.items ?? [];
  const pomodoro = readStore<Pomodoro>(document, "chillmxmk-pomodoro");
  const scene = readStore<Scene>(document, "chillmxmk-scene");
  const openTodos = todos.filter((todo) => !todo.done);

  return {
    syncedAt: document?.updatedAt ?? null,
    companion: {
      characterId: scene?.currentCharacterId ?? "miki",
      status: pomodoro?.isRunning ? "focusing" : "available",
    },
    todo: {
      total: todos.length,
      open: openTodos.length,
      items: openTodos.slice(0, 8).map(({ id, title, createdAt }) => ({ id, title, createdAt })),
    },
    pomodoro: pomodoro
      ? {
          phase: pomodoro.phase,
          remainingSeconds: pomodoro.remainingSeconds,
          workMinutes: pomodoro.workMinutes,
          restMinutes: pomodoro.restMinutes,
          cycle: pomodoro.cycle,
          level: pomodoro.level,
          isRunning: pomodoro.isRunning,
        }
      : null,
  };
}
