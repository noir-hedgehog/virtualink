/**
 * 从 JSON 剧情配置规范化为标准 Story 类型
 * 支持 scene.segments（{ text, startMs, endMs }[]）自动转为 lines + lineTimings
 */
import type { Story, StoryGalgame, StoryVideo, GalgameScene, GalgameSceneRaw } from "@/types/story";

export type RawStory = (StoryVideo | (Omit<StoryGalgame, "scenes"> & { scenes: GalgameSceneRaw[] }));

function normalizeScene(raw: GalgameSceneRaw): GalgameScene {
  if (raw.segments?.length) {
    return {
      background: raw.background,
      character: raw.character,
      position: raw.position,
      lines: raw.segments.map((s) => s.text),
      audioUrl: raw.audioUrl,
      lineTimings: raw.segments.map(({ startMs, endMs }) => ({ startMs, endMs })),
    };
  }
  return {
    background: raw.background,
    character: raw.character,
    position: raw.position,
    lines: raw.lines ?? [],
    audioUrl: raw.audioUrl,
    lineTimings: raw.lineTimings,
  };
}

export function normalizeStories(raw: RawStory[]): Story[] {
  return raw.map((s) => {
    if (s.type === "video") return s as StoryVideo;
    return {
      ...s,
      scenes: s.scenes.map(normalizeScene),
    } as StoryGalgame;
  });
}
