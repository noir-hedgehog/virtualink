"use client";

import { useEffect, useState } from "react";
import { Lock, X } from "lucide-react";
import { achievements } from "@/config/achievements";
import { useAchievementStore } from "@/stores/achievementStore";
import { useModalStore } from "@/stores/modalStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";
import { getCharacterConfig } from "@/config/characters";
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
          {panelId === "story" && <StoryPanelContent />}
          {panelId === "achievements" && <AchievementsPanelContent />}
        </div>
      </div>
    </>
  );
}

function CharacterContent() {
  const currentCharacterId = useSceneStore((s) => s.currentCharacterId);
  const current = currentCharacterId ? getCharacterConfig(currentCharacterId) : null;

  return (
    <div className="flex flex-col gap-4">
      {current ? (
        <div className="rounded-xl border border-lofi-brown/20 bg-lofi-dark/40 p-3 text-sm">
          <p className="font-medium text-lofi-cream mb-2">{current.name}</p>
          {(current.age ?? current.birthday ?? current.zodiac) && (
            <p className="text-lofi-cream/60 text-xs mb-2 space-x-2">
              {current.age && <span>{current.age}</span>}
              {current.birthday && <span>· {current.birthday}</span>}
              {current.zodiac && <span>· {current.zodiac}</span>}
            </p>
          )}
          <p className="text-lofi-cream/80 leading-relaxed whitespace-pre-line">
            {current.intro}
          </p>
        </div>
      ) : (
        <p className="text-lofi-cream/50 text-sm">未选择角色</p>
      )}
    </div>
  );
}

function StoryPanelContent() {
  const characterId = useSceneStore((s) => s.currentCharacterId ?? "miki");
  const getAllStories = useStoryStore((s) => s.getAllStories);
  const isUnlocked = useStoryStore((s) => s.isUnlocked);
  const openStory = useStoryStore((s) => s.openStory);

  const list = getAllStories(characterId);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-lofi-cream/50 text-sm mb-1">已解锁可点击回看，未解锁为占位。</p>
      <ul className="space-y-2">
        {list.length === 0 ? (
          <li className="py-4 text-center text-lofi-cream/50 text-sm">暂无剧情配置</li>
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
                    "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors text-sm",
                    unlocked
                      ? "border-lofi-brown/20 bg-lofi-dark/60 hover:bg-lofi-brown/20 text-lofi-cream"
                      : "border-lofi-brown/10 bg-lofi-dark/30 cursor-not-allowed text-lofi-cream/50"
                  )}
                >
                  {!unlocked && <Lock className="h-4 w-4 shrink-0" />}
                  <span className="flex-1 font-medium">{unlocked ? s.title : "？？？"}</span>
                  {unlocked && <span className="text-xs text-lofi-cream/60">可回看</span>}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function AchievementsPanelContent() {
  const characterId = useSceneStore((s) => s.currentCharacterId ?? "miki");
  const isUnlocked = useAchievementStore((s) => s.isUnlocked);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-lofi-cream/50 text-sm mb-1">当前角色成就；已解锁可查看详情。</p>
      <ul className="space-y-2">
        {achievements.map((a) => {
          const unlocked = isUnlocked(characterId, a.id);
          return (
            <li key={a.id}>
              <div
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm",
                  unlocked
                    ? "border-lofi-brown/20 bg-lofi-dark/60 text-lofi-cream"
                    : "border-lofi-brown/10 bg-lofi-dark/30 text-lofi-cream/50"
                )}
              >
                {!unlocked && <Lock className="h-4 w-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{unlocked ? a.name : "？？？"}</p>
                  {unlocked && (
                    <p className="text-xs text-lofi-cream/60 mt-0.5">{a.description}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
