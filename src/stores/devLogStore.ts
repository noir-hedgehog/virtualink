/**
 * 开发者日志：剧情解锁、成就触发、亲密度变化等记录，供设置内查询
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ENTRIES = 500;

export type DevLogEntry =
  | {
      type: "story_unlock";
      characterId: string;
      storyId: string;
      timestamp: number;
    }
  | {
      type: "achievement_unlock";
      characterId: string;
      achievementId: string;
      timestamp: number;
    }
  | {
      type: "intimacy_change";
      characterId: string;
      amount: number;
      pointsAfter: number;
      timestamp: number;
    }
  | {
      type: "character_display";
      characterId: string;
      sceneId: string;
      x: number;
      y: number;
      scale: number;
      timestamp: number;
    }
  | {
      type: "widget_position";
      widgetId: string;
      x: number;
      y: number;
      timestamp: number;
    };

type DevLogState = {
  entries: DevLogEntry[];
  addLog: (entry: DevLogEntry) => void;
  getLogs: () => DevLogEntry[];
  clearLogs: () => void;
};

export const useDevLogStore = create<DevLogState>()(
  persist(
    (set, get) => ({
      entries: [],

      addLog: (entry) =>
        set((s) => {
          const next = [...s.entries, entry].slice(-MAX_ENTRIES);
          return { entries: next };
        }),

      getLogs: () => get().entries,

      clearLogs: () => set({ entries: [] }),
    }),
    { name: "chillmxmk-devlog" }
  )
);
