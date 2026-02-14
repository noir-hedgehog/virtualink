"use client";

import { getCharacterConfig } from "@/config/characters";
import { useStoryStore } from "@/stores/storyStore";
import { Phone } from "lucide-react";

/** 触发剧情时显示的「对方想和你通话」入口，点击后进入全屏剧情 */
export function StoryCallPrompt() {
  const incomingStory = useStoryStore((s) => s.incomingStory);
  const acceptIncomingStory = useStoryStore((s) => s.acceptIncomingStory);
  const setIncomingStory = useStoryStore((s) => s.setIncomingStory);

  if (!incomingStory) return null;

  const config = getCharacterConfig(incomingStory.characterId);
  const name = config?.name ?? "对方";

  return (
    <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 animate-call-shake">
      <button
        type="button"
        onClick={() => acceptIncomingStory()}
        className="flex items-center gap-3 rounded-2xl border border-lofi-brown/30 bg-lofi-dark/95 px-5 py-4 shadow-xl backdrop-blur-sm transition hover:border-lofi-accent/50 hover:bg-lofi-dark"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lofi-accent/30 text-lofi-accent">
          <Phone className="h-6 w-6" />
        </span>
        <div className="text-left">
          <p className="font-medium text-lofi-cream">{name}想和你通话</p>
          <p className="text-xs text-lofi-cream/60">点击接听</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setIncomingStory(null)}
        className="mt-2 w-full text-center text-xs text-lofi-cream/50 hover:text-lofi-cream/70"
      >
        稍后再说
      </button>
    </div>
  );
}
