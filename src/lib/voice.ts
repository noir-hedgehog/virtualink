import { getCharacterConfig } from "@/config/characters";
import { getAssetUrl } from "./utils";
import { useVoiceStore } from "@/stores/voiceStore";
import { useSceneStore } from "@/stores/sceneStore";

/** 根据当前角色配置播放情境语音并显示字幕（需在组件内调用） */
export function usePlayVoice() {
  const characterId = useSceneStore((s) => s.currentCharacterId);
  const play = useVoiceStore((s) => s.play);

  return (situationId: string) => {
    const config = characterId ? getCharacterConfig(characterId) : null;
    const entry = config?.voice?.[situationId];
    if (!entry?.url) return;
    play(getAssetUrl(entry.url), entry.text ?? "");
  };
}
