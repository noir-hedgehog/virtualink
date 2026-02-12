"use client";

import { Modal } from "@/components/ui/Modal";

export function AchievementsModal() {
  return (
    <Modal id="achievements" title="成就">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-lofi-cream/50 text-sm">成就与收集将在此显示，后续扩展。</p>
      </div>
    </Modal>
  );
}
