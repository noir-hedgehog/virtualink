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

/** 单句带时间轴（与一条音频的片段对应，用于点击播放下句） */
export type GalgameLineTiming = { startMs: number; endMs: number };

/** Galgame 单镜：背景 + 立绘 + 对话；可选整段音频 + 每句时间轴，点击下一句时播放对应片段 */
export type GalgameScene = {
  background?: string;
  character?: string;
  position?: "left" | "center" | "right";
  lines: string[];
  /** 整段音频 URL，与 lineTimings 配合使用 */
  audioUrl?: string;
  /** 每句对应的起止时间（毫秒），与 lines 一一对应 */
  lineTimings?: GalgameLineTiming[];
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
