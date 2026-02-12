import mikiConfig from "./miki/config.json";
import hiyoriConfig from "./hiyori/config.json";

export type CharacterConfig = {
  id: string;
  name: string;
  intro: string;
  defaultStand?: string;
  live2d?: { modelPath: string; motions?: Record<string, string> } | null;
  voice?: Record<string, string> | null; // situationId -> audio url
  lineKeys?: string[];
};

const registry: Record<string, CharacterConfig> = {
  miki: mikiConfig as CharacterConfig,
  hiyori: hiyoriConfig as CharacterConfig,
};

export function getCharacterConfig(id: string): CharacterConfig | null {
  return registry[id] ?? null;
}

export function listCharacters(): CharacterConfig[] {
  return Object.values(registry);
}
