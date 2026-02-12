import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Wallpaper = { id: string; name: string; url: string };
export type Scene = { id: string; name: string; overlayUrl?: string };
export type CharacterId = string;

/** 某角色在某场景下的显示设置：位置偏移(px)、缩放倍数 */
export type CharacterDisplay = { x: number; y: number; scale: number };

function characterDisplayKey(characterId: string, sceneId: string): string {
  return `${characterId}|${sceneId}`;
}

type SceneState = {
  wallpapers: Wallpaper[];
  scenes: Scene[];
  currentWallpaperId: string | null;
  currentSceneId: string | null;
  currentCharacterId: CharacterId | null;
  /** 按 "characterId|sceneId" 存储位置与缩放，持久化 */
  characterDisplay: Record<string, CharacterDisplay>;
  /** 为 true 时不可拖拽/缩放角色，持久化 */
  characterAdjustLocked: boolean;
  setWallpaper: (id: string | null) => void;
  setScene: (id: string | null) => void;
  setCharacter: (id: CharacterId | null) => void;
  getCharacterDisplay: (characterId: string, sceneId: string) => CharacterDisplay;
  setCharacterDisplay: (characterId: string, sceneId: string, value: Partial<CharacterDisplay>) => void;
  setCharacterAdjustLocked: (locked: boolean) => void;
};

const defaultWallpapers: Wallpaper[] = [
  { id: "default", name: "默认", url: "/wallpapers/background-test.png" },
  { id: "sunset", name: "日落", url: "/wallpapers/sunset.jpg" },
];

const defaultScenes: Scene[] = [
  { id: "default", name: "默认" },
  { id: "room", name: "房间", overlayUrl: "" },
];

const defaultCharacterDisplay: CharacterDisplay = { x: 0, y: 0, scale: 1 };

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      wallpapers: defaultWallpapers,
      scenes: defaultScenes,
      currentWallpaperId: "default",
      currentSceneId: "default",
      currentCharacterId: "miki",
      characterDisplay: {},
      characterAdjustLocked: true,
      setWallpaper: (id) => set({ currentWallpaperId: id }),
      setScene: (id) => set({ currentSceneId: id }),
      setCharacter: (id) => set({ currentCharacterId: id }),
      getCharacterDisplay: (characterId, sceneId) => {
        const key = characterDisplayKey(characterId, sceneId);
        return get().characterDisplay[key] ?? { ...defaultCharacterDisplay };
      },
      setCharacterDisplay: (characterId, sceneId, value) =>
        set((state) => {
          const key = characterDisplayKey(characterId, sceneId);
          const prev = state.characterDisplay[key] ?? { ...defaultCharacterDisplay };
          const next: CharacterDisplay = {
            x: value.x ?? prev.x,
            y: value.y ?? prev.y,
            scale: value.scale ?? prev.scale,
          };
          return {
            characterDisplay: { ...state.characterDisplay, [key]: next },
          };
        }),
      setCharacterAdjustLocked: (locked) => set({ characterAdjustLocked: locked }),
    }),
    {
      name: "chillmxmk-scene",
      partialize: (state) => ({
        currentWallpaperId: state.currentWallpaperId,
        currentSceneId: state.currentSceneId,
        currentCharacterId: state.currentCharacterId,
        characterDisplay: state.characterDisplay,
        characterAdjustLocked: state.characterAdjustLocked,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<{
          currentWallpaperId: string | null;
          currentSceneId: string | null;
          currentCharacterId: CharacterId | null;
          characterDisplay: Record<string, CharacterDisplay>;
          characterAdjustLocked: boolean;
        }> | undefined;
        return {
          ...current,
          currentWallpaperId: p?.currentWallpaperId ?? current.currentWallpaperId,
          currentSceneId: p?.currentSceneId ?? current.currentSceneId,
          currentCharacterId: p?.currentCharacterId ?? current.currentCharacterId,
          characterDisplay: p?.characterDisplay ?? current.characterDisplay,
          characterAdjustLocked: p?.characterAdjustLocked ?? current.characterAdjustLocked,
        };
      },
    }
  )
);

export function getCurrentWallpaper(state: SceneState): Wallpaper | null {
  const id = state.currentWallpaperId;
  if (!id) return null;
  return state.wallpapers.find((w) => w.id === id) ?? null;
}

export function getCurrentScene(state: SceneState): Scene | null {
  const id = state.currentSceneId;
  if (!id) return null;
  return state.scenes.find((s) => s.id === id) ?? null;
}
