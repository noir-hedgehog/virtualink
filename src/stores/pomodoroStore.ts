import { create } from "zustand";
import { persist } from "zustand/middleware";

type Phase = "work" | "rest";

type PomodoroState = {
  phase: Phase;
  remainingSeconds: number;
  workMinutes: number;
  restMinutes: number;
  cycle: number;
  level: number;
  isRunning: boolean;
  _intervalId: ReturnType<typeof setInterval> | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setWorkMinutes: (m: number) => void;
  setRestMinutes: (m: number) => void;
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      phase: "work",
      remainingSeconds: 45 * 60,
      workMinutes: 45,
      restMinutes: 15,
      cycle: 1,
      level: 1,
      isRunning: false,
      _intervalId: null,

      start: () => {
        const state = get();
        if (state.isRunning) return;
        const id = setInterval(() => get().tick(), 1000);
        set({ isRunning: true, _intervalId: id });
      },

      pause: () => {
        const { _intervalId } = get();
        if (_intervalId) clearInterval(_intervalId);
        set({ isRunning: false, _intervalId: null });
      },

      reset: () => {
        const { _intervalId } = get();
        if (_intervalId) clearInterval(_intervalId);
        set({
          isRunning: false,
          _intervalId: null,
          phase: "work",
          remainingSeconds: get().workMinutes * 60,
          cycle: 1,
        });
      },

      tick: () => {
        const state = get();
        let { remainingSeconds, phase, cycle } = state;
        remainingSeconds--;
        if (remainingSeconds <= 0) {
          if (phase === "work") {
            phase = "rest";
            remainingSeconds = state.restMinutes * 60;
          } else {
            phase = "work";
            remainingSeconds = state.workMinutes * 60;
            cycle = state.cycle + 1;
          }
        }
        set({ remainingSeconds, phase, cycle });
      },

      setWorkMinutes: (m) => {
        const state = get();
        set({
          workMinutes: m,
          ...(state.phase === "work" && !state.isRunning
            ? { remainingSeconds: m * 60 }
            : {}),
        });
      },

      setRestMinutes: (m) => {
        const state = get();
        set({
          restMinutes: m,
          ...(state.phase === "rest" && !state.isRunning
            ? { remainingSeconds: m * 60 }
            : {}),
        });
      },
    }),
    { name: "chillmxmk-pomodoro" }
  )
);
