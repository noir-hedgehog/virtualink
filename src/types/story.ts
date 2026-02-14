/**
 * 剧情系统类型定义
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */

/** 成就触发：达成指定成就时触发 */
export type StoryTriggerAchievement = {
  type: "achievement";
  achievementId: string;
};

/** 随机触发：按亲密度等级与权重随机 */
export type StoryTriggerRandom = {
  type: "random";
  minIntimacyLevel: number;
  weight?: number;
};

export type StoryTrigger = StoryTriggerAchievement | StoryTriggerRandom;

/** 视频型剧情 */
export type StoryVideo = {
  id: string;
  type: "video";
  title: string;
  url: string;
  trigger: StoryTrigger;
};

/** Galgame 单镜：背景 + 立绘 + 对话 */
export type GalgameScene = {
  background?: string;
  character?: string;
  position?: "left" | "center" | "right";
  lines: string[];
};

/** Galgame 型剧情 */
export type StoryGalgame = {
  id: string;
  type: "galgame";
  title: string;
  trigger: StoryTrigger;
  scenes: GalgameScene[];
};

export type Story = StoryVideo | StoryGalgame;

export function isStoryVideo(s: Story): s is StoryVideo {
  return s.type === "video";
}

export function isStoryGalgame(s: Story): s is StoryGalgame {
  return s.type === "galgame";
}
