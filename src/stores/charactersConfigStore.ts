import type { Story } from "@/types/story";
import { normalizeStories, type RawStory } from "@/config/characters/loadStories";
import { getAssetUrl } from "@/lib/utils";

/** 单条语音：音频地址 + 字幕文案 */
export type VoiceEntry = { url: string; text: string };

export type CharacterConfig = {
  id: string;
  name: string;
  intro: string;
  age?: string;
  birthday?: string;
  zodiac?: string;
  defaultStand?: string;
  stands?: string[];
  defaultSceneId?: string;
  live2d?: { modelPath: string; motions?: Record<string, string> } | null;
  voice?: Record<string, VoiceEntry> | null;
  lineKeys?: string[];
  tapRandomKeys?: string[];
};

type Manifest = { characterIds: string[] };

const registry: Record<string, CharacterConfig> = {};
const storiesByCharacter: Record<string, Story[]> = {};
let loaded = false;
let loading: Promise<void> | null = null;

async function loadFromPublic(): Promise<void> {
  const base = getAssetUrl("/characters/manifest.json");
  const manifestRes = await fetch(base);
  if (!manifestRes.ok) return;
  const manifest = (await manifestRes.json()) as Manifest;
  const ids = manifest.characterIds ?? [];

  await Promise.all(
    ids.map(async (id) => {
      const configUrl = getAssetUrl(`/characters/${id}/config.json`);
      const storiesUrl = getAssetUrl(`/characters/${id}/stories.json`);
      try {
        const [configRes, storiesRes] = await Promise.all([
          fetch(configUrl),
          fetch(storiesUrl),
        ]);
        if (configRes.ok) {
          const config = (await configRes.json()) as CharacterConfig;
          registry[id] = config;
        }
        if (storiesRes.ok) {
          const raw = (await storiesRes.json()) as RawStory[];
          storiesByCharacter[id] = normalizeStories(raw);
        } else {
          storiesByCharacter[id] = [];
        }
      } catch {
        // 忽略加载失败的角色
      }
    })
  );
  loaded = true;
}

/** 从 public/characters 加载配置，返回加载完成的 Promise */
export function ensureCharactersLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loading) return loading;
  loading = loadFromPublic();
  return loading;
}

export function getCharacterConfig(id: string): CharacterConfig | null {
  return registry[id] ?? null;
}

export function listCharacters(): CharacterConfig[] {
  return Object.values(registry);
}

export function getStories(characterId: string): Story[] {
  return storiesByCharacter[characterId] ?? [];
}

export function isCharactersLoaded(): boolean {
  return loaded;
}
