/**
 * 启动页状态：是否已完成「Link Start」、已连线（首次见面）过的角色
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

const FIRST_MEET_STORY_ID = "story_first_meet";

type LaunchState = {
  /** 是否已完成启动（点击过 Link Start），完成后直接进主应用 */
  launchCompleted: boolean;
  /** 已连线过的角色 id（用于判断是否首次见面） */
  metCharacterIds: string[];
  /** 完成启动并进入主应用；返回该角色是否首次连线（需触发初次见面剧情） */
  completeLaunch: (characterId: string) => boolean;
};

export const useLaunchStore = create<LaunchState>()(
  persist(
    (set, get) => ({
      launchCompleted: false,
      metCharacterIds: [],

      completeLaunch: (characterId) => {
        const { metCharacterIds } = get();
        const isFirstTime = !metCharacterIds.includes(characterId);
        set({
          launchCompleted: true,
          metCharacterIds: isFirstTime
            ? [...metCharacterIds, characterId]
            : metCharacterIds,
        });
        return isFirstTime;
      },
    }),
    { name: "chillmxmk-launch" }
  )
);

export { FIRST_MEET_STORY_ID };
