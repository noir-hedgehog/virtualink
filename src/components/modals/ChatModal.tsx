"use client";

import { Modal } from "@/components/ui/Modal";

export function ChatModal() {
  return (
    <Modal id="chat" title="聊天记录">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-lofi-cream/50 text-sm">与角色的聊天记录将在此显示，后续扩展。</p>
      </div>
    </Modal>
  );
}
