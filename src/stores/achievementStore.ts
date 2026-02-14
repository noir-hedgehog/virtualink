/**
 * 成就 Store（按角色）：已解锁成就列表，检查并解锁
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { achievements } from "@/config/achievements";
import type { AchievementCondition } from "@/types/achievement";
import { useDevLogStore } from "./devLogStore";
import { useDiaryStore } from "./diaryStore";
import { useHabitsStore } from "./habitsStore";
import { usePomodoroStore } from "./pomodoroStore";
import { useTodoStore } from "./todoStore";

const DEFAULT_CHARACTER = "miki";

type AchievementState = {
  /** 按角色 id 存储已解锁成就 id 列表 */
  unlockedIdsByCharacter: Record<string, string[]>;
  unlock: (characterId: string, id: string) => void;
  isUnlocked: (characterId: string, id: string) => boolean;
  /** 根据当前各 store 状态检查并解锁该角色的成就，返回本次新解锁的 id 列表 */
  checkAndUnlock: (characterId: string) => string[];
};

function checkCondition(condition: AchievementCondition, getters: {
  todoCount: number;
  pomodoroCompletedCycles: number;
  habitCheckedOnce: boolean;
  diaryEntryCount: number;
}): boolean {
  switch (condition.type) {
    case "first_todo":
      return getters.todoCount >= 1;
    case "pomodoro_count":
      return getters.pomodoroCompletedCycles >= condition.count;
    case "habit_check_once":
      return getters.habitCheckedOnce;
    case "diary_first":
      return getters.diaryEntryCount >= 1;
    default:
      return false;
  }
}

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

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedIdsByCharacter: {},

      unlock: (characterId, id) =>
        set((s) => {
          const list = s.unlockedIdsByCharacter[characterId] ?? [];
          if (list.includes(id)) return s;
          return {
            unlockedIdsByCharacter: {
              ...s.unlockedIdsByCharacter,
              [characterId]: [...list, id],
            },
          };
        }),

      isUnlocked: (characterId, id) =>
        (get().unlockedIdsByCharacter[characterId] ?? []).includes(id),

      checkAndUnlock: (characterId) => {
        const state = get();
        const todoItems = useTodoStore.getState().items;
        const pomodoroState = usePomodoroStore.getState();
        const habitsState = useHabitsStore.getState();
        const diaryState = useDiaryStore.getState();

        const habitCheckedOnce = habitsState.checks.length >= 1;
        const diaryEntryCount = diaryState.entries.length;
        const pomodoroCompletedCycles =
          pomodoroState.phase === "rest"
            ? pomodoroState.cycle
            : Math.max(0, pomodoroState.cycle - 1);

        const getters = {
          todoCount: todoItems.length,
          pomodoroCompletedCycles,
          habitCheckedOnce,
          diaryEntryCount,
        };

        const unlocked = state.unlockedIdsByCharacter[characterId] ?? [];
        const newlyUnlocked: string[] = [];
        for (const a of achievements) {
          if (unlocked.includes(a.id)) continue;
          if (checkCondition(a.condition, getters)) {
            set((s) => {
              const list = s.unlockedIdsByCharacter[characterId] ?? [];
              return {
                unlockedIdsByCharacter: {
                  ...s.unlockedIdsByCharacter,
                  [characterId]: [...list, a.id],
                },
              };
            });
            newlyUnlocked.push(a.id);
            useDevLogStore.getState().addLog({
              type: "achievement_unlock",
              characterId,
              achievementId: a.id,
              timestamp: Date.now(),
            });
          }
        }
        return newlyUnlocked;
      },
    }),
    {
      name: "chillmxmk-achievements",
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
