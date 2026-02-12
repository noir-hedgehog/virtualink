import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiaryEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
};

type DiaryState = {
  entries: DiaryEntry[];
  getByDate: (date: string) => DiaryEntry | null;
  upsert: (date: string, content: string) => void;
  remove: (id: string) => void;
};

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      entries: [],
      getByDate: (date) =>
        get().entries.find((e) => e.date === date) ?? null,
      upsert: (date, content) =>
        set((s) => {
          const now = new Date().toISOString();
          const existing = s.entries.find((e) => e.date === date);
          if (existing) {
            return {
              entries: s.entries.map((e) =>
                e.id === existing.id
                  ? { ...e, content, updatedAt: now }
                  : e
              ),
            };
          }
          return {
            entries: [
              ...s.entries,
              {
                id: crypto.randomUUID(),
                date,
                content,
                createdAt: now,
                updatedAt: now,
              },
            ].sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
        }),
      remove: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: "chillmxmk-diary" }
  )
);
