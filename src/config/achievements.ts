/**
 * 成就配置：与剧情触发联动
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import type { Achievement } from "@/types/achievement";

export const achievements: Achievement[] = [
  { id: "first_todo", name: "第一步", description: "添加第一条待办", condition: { type: "first_todo" } },
  { id: "pomodoro_5", name: "专注初体验", description: "完成 5 个番茄钟", condition: { type: "pomodoro_count", count: 5 } },
  { id: "habit_first_check", name: "今日打卡", description: "首次完成习惯打卡", condition: { type: "habit_check_once" } },
  { id: "diary_first", name: "记录生活", description: "首次写下日记", condition: { type: "diary_first" } },
];
