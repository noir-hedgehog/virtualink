import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AMBIENT_NONE } from "@/config/ambientSounds";

type AmbientSoundState = {
  ambientSoundId: string;
  setAmbientSound: (id: string) => void;
};

export const useAmbientSoundStore = create<AmbientSoundState>()(
  persist(
    (set) => ({
      ambientSoundId: AMBIENT_NONE,
      setAmbientSound: (id) => set({ ambientSoundId: id }),
    }),
    { name: "chillmxmk-ambient" }
  )
);
