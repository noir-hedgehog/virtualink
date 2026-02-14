import type { Story } from "@/types/story";
import mikiConfig from "./miki/config.json";
import { mikiStories } from "./miki/stories";
import hiyoriConfig from "./hiyori/config.json";

/** 单条语音：音频地址 + 字幕文案（galgame 式显示） */
export type VoiceEntry = { url: string; text: string };

export type CharacterConfig = {
  id: string;
  name: string;
  intro: string;
  defaultStand?: string;
  live2d?: { modelPath: string; motions?: Record<string, string> } | null;
  /** 情境 id -> 语音（url + 字幕），如 pomodoro_pause、work_start */
  voice?: Record<string, VoiceEntry> | null;
  lineKeys?: string[];
};

const registry: Record<string, CharacterConfig> = {
  miki: mikiConfig as CharacterConfig,
  hiyori: hiyoriConfig as CharacterConfig,
};

/** 各角色剧情列表（按角色独立） */
const storiesByCharacter: Record<string, Story[]> = {
  miki: mikiStories,
  hiyori: [],
};

export function getCharacterConfig(id: string): CharacterConfig | null {
  return registry[id] ?? null;
}

export function listCharacters(): CharacterConfig[] {
  return Object.values(registry);
}

/** 获取指定角色的剧情配置 */
export function getStories(characterId: string): Story[] {
  return storiesByCharacter[characterId] ?? [];
}
