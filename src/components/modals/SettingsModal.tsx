"use client";

import { useEffect } from "react";
import { useSceneStore } from "@/stores/sceneStore";
import { useModalStore } from "@/stores/modalStore";
import { Modal } from "@/components/ui/Modal";
import { listCharacters } from "@/config/characters";
import { useState } from "react";

const TABS = [
  { id: "general", label: "通用" },
  { id: "wallpaper", label: "壁纸" },
  { id: "scene", label: "场景" },
  { id: "character", label: "角色" },
] as const;

export function SettingsModal() {
  const settingsTab = useModalStore((s) => s.settingsTab);
  const [tab, setTab] = useState<typeof TABS[number]["id"]>(settingsTab);
  const {
    wallpapers,
    scenes,
    currentWallpaperId,
    currentSceneId,
    currentCharacterId,
    setWallpaper,
    setScene,
    setCharacter,
  } = useSceneStore();
  const characters = listCharacters();

  useEffect(() => {
    setTab(settingsTab);
  }, [settingsTab]);

  return (
    <Modal id="settings" title="设置" className="max-w-2xl">
      <div className="flex flex-1 min-h-0">
        <nav className="flex w-32 shrink-0 flex-col gap-0.5 border-r border-lofi-brown/30 p-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-left text-sm ${
                tab === t.id
                  ? "bg-lofi-accent/30 text-lofi-cream"
                  : "text-lofi-cream/70 hover:bg-lofi-brown/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="flex-1 overflow-auto p-4">
          {tab === "general" && (
            <p className="text-lofi-cream/70 text-sm">番茄钟时长等可在主界面番茄钟处后续扩展。</p>
          )}
          {tab === "wallpaper" && (
            <div className="space-y-3">
              <h3 className="text-lofi-cream font-medium text-sm">选择壁纸</h3>
              <div className="flex flex-wrap gap-2">
                {wallpapers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWallpaper(w.id)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      currentWallpaperId === w.id
                        ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                        : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === "scene" && (
            <div className="space-y-3">
              <h3 className="text-lofi-cream font-medium text-sm">选择场景</h3>
              <div className="flex flex-wrap gap-2">
                {scenes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScene(s.id)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      currentSceneId === s.id
                        ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                        : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === "character" && (
            <div className="space-y-3">
              <h3 className="text-lofi-cream font-medium text-sm">选择角色</h3>
              <div className="flex flex-wrap gap-2">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCharacter(c.id)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      currentCharacterId === c.id
                        ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                        : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
