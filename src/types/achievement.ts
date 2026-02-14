/**
 * 成就系统类型定义
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */

/** 条件：首次添加待办 */
export type ConditionFirstTodo = { type: "first_todo" };

/** 条件：累计完成 N 个番茄钟（工作阶段完成计 1） */
export type ConditionPomodoroCount = { type: "pomodoro_count"; count: number };

/** 条件：首次习惯打卡 */
export type ConditionHabitCheckOnce = { type: "habit_check_once" };

/** 条件：首次写日记 */
export type ConditionDiaryFirst = { type: "diary_first" };

export type AchievementCondition =
  | ConditionFirstTodo
  | ConditionPomodoroCount
  | ConditionHabitCheckOnce
  | ConditionDiaryFirst;

export type Achievement = {
  id: string;
  name: string;
  description: string;
  condition: AchievementCondition;
};
