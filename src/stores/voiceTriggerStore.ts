import { accountStorage } from "@/lib/sync/storage";
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
    { storage: accountStorage, name: "chillmxmk-voice-triggers" }
  )
);
