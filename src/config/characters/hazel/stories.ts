/**
 * hazel 角色剧情配置
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import type { Story } from "@/types/story";

export const hazelStories: Story[] = [
  {
    id: "story_first_meet",
    type: "galgame",
    title: "初次见面",
    trigger: { type: "achievement", achievementId: "first_todo" },
    scenes: [
      {
        character: "hazel",
        position: "center",
        lines: [
          "你好呀，我是圭圭 Hazel。",
          "果冻要分你一个吗？从今天起请多关照啦。",
        ],
      },
    ],
  },
];
