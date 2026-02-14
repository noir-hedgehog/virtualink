"use client";

import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useSceneStore } from "@/stores/sceneStore";
import { useAchievementStore } from "@/stores/achievementStore";
import { achievements } from "@/config/achievements";
import { Lock } from "lucide-react";

export function AchievementsModal() {
  const characterId = useSceneStore((s) => s.currentCharacterId ?? "miki");
  const isUnlocked = useAchievementStore((s) => s.isUnlocked);

  return (
    <Modal id="achievements" title="成就">
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-lofi-cream/50 text-sm mb-2">
          当前角色的成就进度；已解锁可查看详情。
        </p>
        <ul className="space-y-2 overflow-auto">
          {achievements.map((a) => {
            const unlocked = isUnlocked(characterId, a.id);
            return (
              <li key={a.id}>
                <div
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left",
                    unlocked
                      ? "border-lofi-brown/20 bg-lofi-dark/60 text-lofi-cream"
                      : "border-lofi-brown/10 bg-lofi-dark/30 text-lofi-cream/50"
                  )}
                >
                  {!unlocked && <Lock className="h-4 w-4 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{unlocked ? a.name : "？？？"}</p>
                    {unlocked && (
                      <p className="text-sm text-lofi-cream/60 mt-0.5">{a.description}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
