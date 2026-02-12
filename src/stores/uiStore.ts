import { create } from "zustand";
import { useEffect } from "react";

type UIState = {
  dateTime: Date;
  tick: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  dateTime: new Date(),
  tick: () => set({ dateTime: new Date() }),
}));

export function useClockTick(intervalMs = 1000) {
  const tick = useUIStore((s) => s.tick);
  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);
}
