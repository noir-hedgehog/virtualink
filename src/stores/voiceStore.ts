import { create } from "zustand";

export type VoiceState = {
  url: string | null;
  text: string | null;
  play: (url: string, text: string) => void;
  stop: () => void;
};

export const useVoiceStore = create<VoiceState>((set) => ({
  url: null,
  text: null,
  play: (url, text) => set({ url, text }),
  stop: () => set({ url: null, text: null }),
}));
