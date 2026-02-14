/**
 * 剧情 Store（按角色）：已解锁剧情、触发与回放
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getStories } from "@/config/characters";
import type { Story } from "@/types/story";
import { useDevLogStore } from "./devLogStore";

const DEFAULT_CHARACTER = "miki";

/** 待接听的通话（触发剧情时先显示入口，点击后进入全屏剧情） */
export type IncomingStory = { characterId: string; storyId: string };

type StoryState = {
  /** 按角色 id 存储已解锁剧情 id 列表 */
  unlockedIdsByCharacter: Record<string, string[]>;
  /** 待接听：对方想和你通话，点击后进入剧情 */
  incomingStory: IncomingStory | null;
  /** 当前要播放的剧情：角色 id + 剧情 id */
  currentStoryCharacterId: string | null;
  currentStoryId: string | null;
  unlock: (characterId: string, id: string) => void;
  isUnlocked: (characterId: string, id: string) => boolean;
  /** 设置待接听剧情（触发时调用，不直接打开） */
  setIncomingStory: (payload: IncomingStory | null) => void;
  /** 接听：进入全屏剧情并清除待接听 */
  acceptIncomingStory: () => void;
  openStory: (characterId: string, id: string) => void;
  closeStory: () => void;
  getStory: (characterId: string, id: string) => Story | undefined;
  getAllStories: (characterId: string) => Story[];
};

function migrateUnlockedIds(loaded: unknown): Record<string, string[]> {
  if (loaded && typeof loaded === "object" && "unlockedIds" in loaded) {
    const arr = (loaded as { unlockedIds: string[] }).unlockedIds;
    if (Array.isArray(arr)) return { [DEFAULT_CHARACTER]: arr };
  }
  if (loaded && typeof loaded === "object" && "unlockedIdsByCharacter" in loaded) {
    const r = (loaded as { unlockedIdsByCharacter: Record<string, string[]> }).unlockedIdsByCharacter;
    return typeof r === "object" && r !== null ? r : {};
  }
  return {};
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      unlockedIdsByCharacter: {},
      incomingStory: null,
      currentStoryCharacterId: null,
      currentStoryId: null,

      unlock: (characterId, id) => {
        const hadBefore = (get().unlockedIdsByCharacter[characterId] ?? []).includes(id);
        set((s) => {
          const list = s.unlockedIdsByCharacter[characterId] ?? [];
          if (list.includes(id)) return s;
          return {
            unlockedIdsByCharacter: {
              ...s.unlockedIdsByCharacter,
              [characterId]: [...list, id],
            },
          };
        });
        if (!hadBefore) {
          useDevLogStore.getState().addLog({
            type: "story_unlock",
            characterId,
            storyId: id,
            timestamp: Date.now(),
          });
        }
      },

      isUnlocked: (characterId, id) =>
        (get().unlockedIdsByCharacter[characterId] ?? []).includes(id),

      setIncomingStory: (payload) => set({ incomingStory: payload }),

      acceptIncomingStory: () => {
        const { incomingStory } = get();
        if (!incomingStory) return;
        set({
          currentStoryCharacterId: incomingStory.characterId,
          currentStoryId: incomingStory.storyId,
          incomingStory: null,
        });
      },

      openStory: (characterId, id) =>
        set({ currentStoryCharacterId: characterId, currentStoryId: id }),

      closeStory: () =>
        set({ currentStoryCharacterId: null, currentStoryId: null }),

      getStory: (characterId, id) =>
        getStories(characterId).find((s) => s.id === id),

      getAllStories: (characterId) => getStories(characterId),
    }),
    {
      name: "chillmxmk-story",
      partialize: (s) => ({ unlockedIdsByCharacter: s.unlockedIdsByCharacter }),
      merge: (persisted, current) => ({
        ...current,
        unlockedIdsByCharacter: {
          ...current.unlockedIdsByCharacter,
          ...migrateUnlockedIds(persisted),
        },
      }),
    }
  )
);
