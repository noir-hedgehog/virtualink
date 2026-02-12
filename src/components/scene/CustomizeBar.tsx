"use client";

import { User, MessageCircle, BookOpen, Trophy, Lock, Unlock } from "lucide-react";
import { useModalStore } from "@/stores/modalStore";
import { useSceneStore } from "@/stores/sceneStore";

const items: {
  id: string;
  icon: typeof User;
  label: string;
  action: "character" | "chat" | "story" | "achievements";
}[] = [
  { id: "character", icon: User, label: "人物设定", action: "character" },
  { id: "chat", icon: MessageCircle, label: "聊天记录", action: "chat" },
  { id: "story", icon: BookOpen, label: "剧情", action: "story" },
  { id: "achievements", icon: Trophy, label: "成就", action: "achievements" },
];

export function CustomizeBar() {
  const open = useModalStore((s) => s.open);
  const characterAdjustLocked = useSceneStore((s) => s.characterAdjustLocked);
  const setCharacterAdjustLocked = useSceneStore((s) => s.setCharacterAdjustLocked);

  const handleClick = (action: (typeof items)[number]["action"]) => {
    open(action);
  };

  return (
    <div className="absolute bottom-16 left-6 z-50 flex gap-2 rounded-xl border border-lofi-brown/20 bg-lofi-dark/60 p-2 shadow-lg backdrop-blur-sm">
      {items.map(({ id, icon: Icon, label, action }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(action)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-lofi-cream/80 hover:bg-lofi-brown/30 hover:text-lofi-cream transition-colors"
          title={label}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => setCharacterAdjustLocked(!characterAdjustLocked)}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-lofi-cream/80 hover:bg-lofi-brown/30 hover:text-lofi-cream transition-colors"
        title={characterAdjustLocked ? "解锁以调整角色位置与缩放" : "锁定角色位置与缩放"}
      >
        {characterAdjustLocked ? (
          <Lock className="h-5 w-5" />
        ) : (
          <Unlock className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
