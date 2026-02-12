"use client";

import { Suspense } from "react";
import { useSceneStore } from "@/stores/sceneStore";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { listCharacters } from "@/config/characters";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "general";
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

  return (
    <div className="flex h-screen flex-col bg-lofi-dark/95">
      <header className="flex shrink-0 items-center gap-4 border-b border-lofi-brown/30 px-6 py-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="p-2 text-lofi-cream/80 hover:text-lofi-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-medium text-lofi-cream">设置</h1>
      </header>
      <div className="flex flex-1 gap-6 overflow-auto p-6">
        <nav className="flex w-40 shrink-0 flex-col gap-1">
          {["general", "wallpaper", "scene", "character"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => router.push(`/settings?tab=${t}`)}
              className={`rounded-lg px-3 py-2 text-left text-sm ${
                tab === t
                  ? "bg-lofi-accent/30 text-lofi-cream"
                  : "text-lofi-cream/70 hover:bg-lofi-brown/20"
              }`}
            >
              {t === "general" && "通用"}
              {t === "wallpaper" && "壁纸"}
              {t === "scene" && "场景"}
              {t === "character" && "角色"}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          {tab === "general" && (
            <div className="space-y-4">
              <p className="text-lofi-cream/70">番茄钟时长等可在主界面番茄钟处后续扩展。</p>
            </div>
          )}
          {tab === "wallpaper" && (
            <div className="space-y-3">
              <h2 className="text-lofi-cream font-medium">选择壁纸</h2>
              <div className="flex flex-wrap gap-3">
                {wallpapers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWallpaper(w.id)}
                    className={`rounded-lg border-2 px-4 py-2 text-sm transition-colors ${
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
              <h2 className="text-lofi-cream font-medium">选择场景</h2>
              <div className="flex flex-wrap gap-3">
                {scenes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScene(s.id)}
                    className={`rounded-lg border-2 px-4 py-2 text-sm transition-colors ${
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
              <h2 className="text-lofi-cream font-medium">选择角色</h2>
              <div className="flex flex-wrap gap-3">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCharacter(c.id)}
                    className={`rounded-lg border-2 px-4 py-2 text-sm transition-colors ${
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
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-lofi-dark text-lofi-cream/60">加载中...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
