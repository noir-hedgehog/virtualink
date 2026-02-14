/**
 * miki 角色剧情配置：与成就/随机触发绑定
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import type { Story } from "@/types/story";

export const mikiStories: Story[] = [
  {
    id: "story_first_meet",
    type: "galgame",
    title: "初次见面",
    trigger: { type: "achievement", achievementId: "first_todo" },
    scenes: [
      {
        character: "miki",
        position: "center",
        lines: [
          "你好呀，我是弥希 miki。",
          "从今天起就一起专注学习与工作吧，请多关照。",
        ],
      },
    ],
  },
  {
    id: "story_first_todo",
    type: "galgame",
    title: "第一次待办",
    trigger: { type: "achievement", achievementId: "first_todo" },
    scenes: [
      {
        character: "miki",
        position: "left",
        lines: ["你添加了第一条待办呢。", "以后一起把任务都勾掉吧。"],
      },
    ],
  },
  {
    id: "story_pomodoro_5",
    type: "galgame",
    title: "专注初体验",
    trigger: { type: "achievement", achievementId: "pomodoro_5" },
    scenes: [
      {
        character: "miki",
        position: "center",
        lines: ["已经完成 5 个番茄钟了呢。", "继续保持这份专注吧。"],
      },
    ],
  },
  {
    id: "story_diary_first",
    type: "video",
    title: "跳跳糖",
    url: "/characters/miki/story/video/跳跳糖.mp4",
    trigger: { type: "achievement", achievementId: "diary_first" },
  },
];
