"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useModalStore } from "@/stores/modalStore";
import { useSceneStore } from "@/stores/sceneStore";
import { listCharacters } from "@/config/characters";
import { cn } from "@/lib/utils";

const PANEL_IDS = ["character", "chat", "story", "achievements"] as const;
type PanelId = (typeof PANEL_IDS)[number];

const TITLES: Record<PanelId, string> = {
  character: "人物设定",
  chat: "聊天记录",
  story: "剧情",
  achievements: "成就",
};

const PANEL_DURATION_MS = 280;

export function BottomLeftPanel() {
  const openModal = useModalStore((s) => s.openModal);
  const close = useModalStore((s) => s.close);
  const [isEntered, setIsEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const panelId = PANEL_IDS.some((id) => id === openModal) ? (openModal as PanelId) : null;

  useEffect(() => {
    if (panelId) {
      setIsExiting(false);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsEntered(true));
      });
      return () => cancelAnimationFrame(t);
    } else {
      setIsEntered(false);
    }
  }, [panelId]);

  const handleClose = () => {
    if (!panelId) return;
    setIsExiting(true);
  };

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => {
      close();
      setIsEntered(false);
      setIsExiting(false);
    }, PANEL_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isExiting, close]);

  const isVisible = isEntered && !isExiting;

  if (!panelId) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: isExiting ? 0 : 1 }}
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed left-6 bottom-[12.5rem] z-40 flex h-[400px] w-[min(380px,calc(100vw-3rem))] flex-col rounded-t-xl border border-b-0 border-lofi-brown/20 bg-lofi-dark/60 shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-[20%] opacity-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`bottom-panel-title-${panelId}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-lofi-brown/20 px-4 py-3">
          <h2 id={`bottom-panel-title-${panelId}`} className="text-base font-medium text-lofi-cream">
            {TITLES[panelId]}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-lofi-cream/70 hover:text-lofi-cream hover:bg-lofi-brown/20 transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 min-h-0 overflow-auto p-4">
          {panelId === "character" && <CharacterContent />}
          {panelId === "chat" && (
            <p className="text-lofi-cream/50 text-sm">与角色的聊天记录将在此显示，后续扩展。</p>
          )}
          {panelId === "story" && (
            <p className="text-lofi-cream/50 text-sm">剧情进度与节点将在此显示，后续扩展。</p>
          )}
          {panelId === "achievements" && (
            <p className="text-lofi-cream/50 text-sm">成就与收集将在此显示，后续扩展。</p>
          )}
        </div>
      </div>
    </>
  );
}

function CharacterContent() {
  const { currentCharacterId, setCharacter } = useSceneStore();
  const characters = listCharacters();

  return (
    <div className="flex flex-wrap gap-2">
      {characters.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => setCharacter(c.id)}
          className={cn(
            "rounded-lg border-2 px-4 py-2 text-sm transition-colors",
            currentCharacterId === c.id
              ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
              : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
