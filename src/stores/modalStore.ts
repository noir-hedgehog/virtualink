import { create } from "zustand";

export type ModalId = "todo" | "habits" | "diary" | "calendar" | "settings" | "chat" | "story" | "achievements" | "character" | null;

type ModalState = {
  openModal: ModalId;
  settingsTab: "general" | "wallpaper" | "scene" | "character" | "developer";
  open: (id: ModalId, options?: { settingsTab?: ModalState["settingsTab"] }) => void;
  close: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  openModal: null,
  settingsTab: "general",
  open: (id, options) =>
    set({
      openModal: id,
      ...(id === "settings" && options?.settingsTab
        ? { settingsTab: options.settingsTab }
        : {}),
    }),
  close: () => set({ openModal: null }),
}));
