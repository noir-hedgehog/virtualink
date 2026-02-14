/**
 * 亲密度（隐性、按角色）：不对外展示，用于随机剧情触发
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useDevLogStore } from "./devLogStore";

const MAX_POINTS = 9999;
const LEVEL_INTERVAL = 100; // 每 100 点一级
const DEFAULT_CHARACTER = "miki";

type IntimacyState = {
  /** 按角色 id 存储点数 */
  pointsByCharacter: Record<string, number>;
  addPoints: (characterId: string, amount: number) => void;
  getLevel: (characterId: string) => number;
};

function migratePoints(loaded: unknown): Record<string, number> {
  if (loaded && typeof loaded === "object" && "points" in loaded) {
    const p = (loaded as { points: number }).points;
    if (typeof p === "number") return { [DEFAULT_CHARACTER]: p };
  }
  if (loaded && typeof loaded === "object" && "pointsByCharacter" in loaded) {
    const r = (loaded as { pointsByCharacter: Record<string, number> }).pointsByCharacter;
    return typeof r === "object" && r !== null ? r : {};
  }
  return {};
}

export const useIntimacyStore = create<IntimacyState>()(
  persist(
    (set, get) => ({
      pointsByCharacter: {},

      addPoints: (characterId, amount) => {
        const add = Math.max(0, amount);
        if (add <= 0) return;
        set((s) => {
          const prev = s.pointsByCharacter[characterId] ?? 0;
          const next = Math.min(MAX_POINTS, prev + add);
          return {
            pointsByCharacter: { ...s.pointsByCharacter, [characterId]: next },
          };
        });
        const pointsAfter = get().pointsByCharacter[characterId] ?? 0;
        useDevLogStore.getState().addLog({
          type: "intimacy_change",
          characterId,
          amount: add,
          pointsAfter,
          timestamp: Date.now(),
        });
      },

      getLevel: (characterId) => {
        const p = get().pointsByCharacter[characterId] ?? 0;
        return Math.max(1, Math.floor(p / LEVEL_INTERVAL) + 1);
      },
    }),
    {
      name: "chillmxmk-intimacy",
      partialize: (s) => ({ pointsByCharacter: s.pointsByCharacter }),
      merge: (persisted, current) => ({
        ...current,
        pointsByCharacter: { ...current.pointsByCharacter, ...migratePoints(persisted) },
      }),
    }
  )
);
