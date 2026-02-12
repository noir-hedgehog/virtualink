import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HabitItem = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type HabitCheck = {
  habitId: string;
  date: string; // YYYY-MM-DD
};

type HabitsState = {
  habits: HabitItem[];
  checks: HabitCheck[];
  addHabit: (name: string, color?: string) => void;
  removeHabit: (id: string) => void;
  toggleCheck: (habitId: string, date: string) => void;
  isChecked: (habitId: string, date: string) => boolean;
  getChecksForDate: (date: string) => HabitCheck[];
};

const defaultColors = ["#c4a77d", "#8b7355", "#6b5344", "#9c7c5c"];

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [],
      checks: [],
      addHabit: (name, color) =>
        set((s) => ({
          habits: [
            ...s.habits,
            {
              id: crypto.randomUUID(),
              name,
              color: color ?? defaultColors[s.habits.length % defaultColors.length],
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          checks: s.checks.filter((c) => c.habitId !== id),
        })),
      toggleCheck: (habitId, date) =>
        set((s) => {
          const exists = s.checks.some(
            (c) => c.habitId === habitId && c.date === date
          );
          if (exists) {
            return {
              checks: s.checks.filter(
                (c) => !(c.habitId === habitId && c.date === date)
              ),
            };
          }
          return {
            checks: [...s.checks, { habitId, date }],
          };
        }),
      isChecked: (habitId, date) =>
        get().checks.some(
          (c) => c.habitId === habitId && c.date === date
        ),
      getChecksForDate: (date) =>
        get().checks.filter((c) => c.date === date),
    }),
    { name: "chillmxmk-habits" }
  )
);
