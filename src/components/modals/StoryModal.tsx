"use client";

import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";
import { Lock } from "lucide-react";

export function StoryModal() {
  const characterId = useSceneStore((s) => s.currentCharacterId ?? "miki");
  const getAllStories = useStoryStore((s) => s.getAllStories);
  const isUnlocked = useStoryStore((s) => s.isUnlocked);
  const openStory = useStoryStore((s) => s.openStory);

  const list = getAllStories(characterId);

  return (
    <Modal id="story" title="剧情">
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-lofi-cream/50 text-sm mb-2">
          已解锁的剧情可点击回看；未解锁为占位显示。
        </p>
        <ul className="space-y-2 overflow-auto">
          {list.length === 0 ? (
            <li className="py-6 text-center text-lofi-cream/50 text-sm">暂无剧情配置</li>
          ) : (
            list.map((s) => {
              const unlocked = isUnlocked(characterId, s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => unlocked && openStory(characterId, s.id)}
                    disabled={!unlocked}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      unlocked
                        ? "border-lofi-brown/20 bg-lofi-dark/60 hover:bg-lofi-brown/20 text-lofi-cream"
                        : "border-lofi-brown/10 bg-lofi-dark/30 cursor-not-allowed text-lofi-cream/50"
                    )}
                  >
                    {!unlocked && <Lock className="h-4 w-4 shrink-0" />}
                    <span className="flex-1 font-medium">{unlocked ? s.title : "？？？"}</span>
                    {unlocked && (
                      <span className="text-xs text-lofi-cream/60">可回看</span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Modal>
  );
}
