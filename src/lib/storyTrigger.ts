/**
 * 剧情触发：成就达成 → 解锁剧情并打开播放；行为后增加当前角色亲密度
 * 成就/剧情/亲密度均按当前选中的角色绑定。
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import { getStories } from "@/config/characters";
import { useAchievementStore } from "@/stores/achievementStore";
import { useIntimacyStore } from "@/stores/intimacyStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";

/** 检查当前角色成就并触发绑定剧情：返回本次新触发的剧情 id 列表 */
export function checkAchievementsAndTriggerStories(): string[] {
  const characterId = useSceneStore.getState().currentCharacterId ?? "miki";
  const newlyUnlockedAchievements = useAchievementStore.getState().checkAndUnlock(characterId);
  const triggeredStoryIds: string[] = [];
  const stories = getStories(characterId);

  const storyStore = useStoryStore.getState();
  for (const achievementId of newlyUnlockedAchievements) {
    const story = stories.find(
      (s) => s.trigger.type === "achievement" && s.trigger.achievementId === achievementId
    );
    if (story) {
      const wasAlreadyUnlocked = storyStore.isUnlocked(characterId, story.id);
      storyStore.unlock(characterId, story.id);
      if (!wasAlreadyUnlocked) {
        storyStore.setIncomingStory({ characterId, storyId: story.id });
        triggeredStoryIds.push(story.id);
      }
    }
  }
  return triggeredStoryIds;
}

/** 用户行为后调用：给当前角色增加亲密度并检查成就/剧情触发。points 为本次行为给予的亲密度点数 */
export function triggerAchievementsAndIntimacy(points: number): string[] {
  const characterId = useSceneStore.getState().currentCharacterId ?? "miki";
  if (points > 0) useIntimacyStore.getState().addPoints(characterId, points);
  return checkAchievementsAndTriggerStories();
}
