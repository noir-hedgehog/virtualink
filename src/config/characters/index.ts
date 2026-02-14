import type { Story } from "@/types/story";
import mikiConfig from "./miki/config.json";
import { mikiStories } from "./miki/stories";
import hiyoriConfig from "./hiyori/config.json";
import hazelConfig from "./hazel/config.json";
import { hazelStories } from "./hazel/stories";

/** 单条语音：音频地址 + 字幕文案（galgame 式显示） */
export type VoiceEntry = { url: string; text: string };

export type CharacterConfig = {
  id: string;
  name: string;
  intro: string;
  /** 可选：年龄、生日、星座等设定 */
  age?: string;
  birthday?: string;
  zodiac?: string;
  defaultStand?: string;
  /** 可选：多立绘列表（URL），人物设定中可切换；未配置或仅一条时无切换 */
  stands?: string[];
  /** 该角色对应的默认场景 id（选择此角色时自动切换，需与 src/config/scenes 中的 id 一致） */
  defaultSceneId?: string;
  live2d?: { modelPath: string; motions?: Record<string, string> } | null;
  /** 情境 id -> 语音（url + 字幕），如 pomodoro_pause、work_start */
  voice?: Record<string, VoiceEntry> | null;
  lineKeys?: string[];
  /** 点击立绘随机触发时，从这些 voice key 中随机选一个播放（每次最多一个） */
  tapRandomKeys?: string[];
};

const registry: Record<string, CharacterConfig> = {
  miki: mikiConfig as CharacterConfig,
  hiyori: hiyoriConfig as CharacterConfig,
  hazel: hazelConfig as CharacterConfig,
};

/** 各角色剧情列表（按角色独立） */
const storiesByCharacter: Record<string, Story[]> = {
  miki: mikiStories,
  hiyori: [],
  hazel: hazelStories,
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
