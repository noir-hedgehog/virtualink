import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useDevLogStore } from "./devLogStore";
import { defaultScenes, defaultSceneId } from "@/config/scenes";
import type { SceneConfig } from "@/types/scene";

export type CharacterId = string;

/** 某角色的显示设置：位置偏移(px)、缩放倍数（不随背景切换重置） */
export type CharacterDisplay = { x: number; y: number; scale: number };

function characterDisplayKey(characterId: string): string {
  return characterId;
}

const defaultCharacterDisplay: CharacterDisplay = { x: 0, y: 0, scale: 1 };

type SceneState = {
  scenes: SceneConfig[];
  currentSceneId: string | null;
  currentCharacterId: CharacterId | null;
  characterDisplay: Record<string, CharacterDisplay>;
  characterAdjustLocked: boolean;
  /** 主界面人物立绘是否显示，侧栏「隐藏」按钮切换 */
  characterStandVisible: boolean;
  /** 多立绘时，按角色 id 存储当前选中的立绘索引 */
  standIndexByCharacter: Record<string, number>;
  setScene: (id: string | null) => void;
  setCharacter: (id: CharacterId | null) => void;
  getCharacterDisplay: (characterId: string, sceneId: string) => CharacterDisplay;
  setCharacterDisplay: (characterId: string, sceneId: string, value: Partial<CharacterDisplay>) => void;
  setCharacterAdjustLocked: (locked: boolean) => void;
  setCharacterStandVisible: (visible: boolean) => void;
  setStandIndex: (characterId: string, index: number) => void;
  getStandIndex: (characterId: string) => number;
};

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scenes: defaultScenes,
      currentSceneId: defaultSceneId,
      currentCharacterId: "miki",
      characterDisplay: {},
      characterAdjustLocked: true,
      characterStandVisible: true,
      standIndexByCharacter: {},
      setScene: (id) => set({ currentSceneId: id }),
      setCharacter: (id) => set({ currentCharacterId: id }),
      getCharacterDisplay: (characterId, _sceneId) => {
        const key = characterDisplayKey(characterId);
        return get().characterDisplay[key] ?? { ...defaultCharacterDisplay };
      },
      setCharacterDisplay: (characterId, sceneId, value) =>
        set((state) => {
          const key = characterDisplayKey(characterId);
          const prev = state.characterDisplay[key] ?? { ...defaultCharacterDisplay };
          const next: CharacterDisplay = {
            x: value.x ?? prev.x,
            y: value.y ?? prev.y,
            scale: value.scale ?? prev.scale,
          };
          useDevLogStore.getState().addLog({
            type: "character_display",
            characterId,
            sceneId,
            x: next.x,
            y: next.y,
            scale: next.scale,
            timestamp: Date.now(),
          });
          return {
            characterDisplay: { ...state.characterDisplay, [key]: next },
          };
        }),
      setCharacterAdjustLocked: (locked) => set({ characterAdjustLocked: locked }),
      setCharacterStandVisible: (visible) => set({ characterStandVisible: visible }),
      setStandIndex: (characterId, index) =>
        set((s) => ({
          standIndexByCharacter: {
            ...s.standIndexByCharacter,
            [characterId]: index,
          },
        })),
      getStandIndex: (characterId) => {
        const idx = get().standIndexByCharacter[characterId];
        return typeof idx === "number" && idx >= 0 ? idx : 0;
      },
    }),
    {
      name: "chillmxmk-scene",
      partialize: (state) => ({
        currentSceneId: state.currentSceneId,
        currentCharacterId: state.currentCharacterId,
        characterDisplay: state.characterDisplay,
        characterAdjustLocked: state.characterAdjustLocked,
        characterStandVisible: state.characterStandVisible,
        standIndexByCharacter: state.standIndexByCharacter,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<{
          currentWallpaperId?: string | null;
          currentSceneId?: string | null;
          currentCharacterId?: CharacterId | null;
          characterDisplay?: Record<string, CharacterDisplay>;
          characterAdjustLocked?: boolean;
          characterStandVisible?: boolean;
          standIndexByCharacter?: Record<string, number>;
        }> | undefined;
        const oldWallpaperId = p?.currentWallpaperId;
        const mergedSceneId =
          p?.currentSceneId ??
          (oldWallpaperId && current.scenes.some((s) => s.id === oldWallpaperId)
            ? oldWallpaperId
            : current.currentSceneId);
        const validId =
          current.scenes.some((s) => s.id === mergedSceneId) ? mergedSceneId : defaultSceneId;

        const raw = p?.characterDisplay ?? current.characterDisplay;
        const characterDisplay: Record<string, CharacterDisplay> = {};
        for (const [key, value] of Object.entries(raw)) {
          const characterId = key.includes("|") ? key.split("|")[0]! : key;
          if (!characterId || !value) continue;
          characterDisplay[characterId] = value as CharacterDisplay;
        }

        return {
          ...current,
          currentSceneId: validId,
          currentCharacterId: p?.currentCharacterId ?? current.currentCharacterId,
          characterDisplay: Object.keys(characterDisplay).length ? characterDisplay : current.characterDisplay,
          characterAdjustLocked: p?.characterAdjustLocked ?? current.characterAdjustLocked,
          characterStandVisible: p?.characterStandVisible ?? current.characterStandVisible,
          standIndexByCharacter: p?.standIndexByCharacter ?? current.standIndexByCharacter,
        };
      },
    }
  )
);

export function getCurrentSceneConfig(state: SceneState): SceneConfig | null {
  const id = state.currentSceneId ?? defaultSceneId;
  return state.scenes.find((s) => s.id === id) ?? state.scenes[0] ?? null;
}
