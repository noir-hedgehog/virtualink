import { create } from "zustand";
import { persist } from "zustand/middleware";

type VoiceTriggerState = {
  diaryFirstOpenPlayed: boolean;
  setDiaryFirstOpenPlayed: (v: boolean) => void;
};

export const useVoiceTriggerStore = create<VoiceTriggerState>()(
  persist(
    (set) => ({
      diaryFirstOpenPlayed: false,
      setDiaryFirstOpenPlayed: (v) => set({ diaryFirstOpenPlayed: v }),
    }),
    { name: "chillmxmk-voice-triggers" }
  )
);
