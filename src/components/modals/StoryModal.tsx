"use client";

import { Modal } from "@/components/ui/Modal";

export function StoryModal() {
  return (
    <Modal id="story" title="剧情">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-lofi-cream/50 text-sm">剧情进度与节点将在此显示，后续扩展。</p>
      </div>
    </Modal>
  );
}
