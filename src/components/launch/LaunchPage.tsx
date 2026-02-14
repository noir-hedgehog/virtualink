"use client";

import { getCharacterConfig, getStories, listCharacters } from "@/config/characters";
import { defaultScenes } from "@/config/scenes";
import { APP_VERSION, VERSION_HISTORY } from "@/config/version";
import { getAssetUrl } from "@/lib/utils";
import { isStandVideo } from "@/lib/standMedia";
import { useLaunchStore, FIRST_MEET_STORY_ID } from "@/stores/launchStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";
import { isSceneStatic, isSceneVideo } from "@/types/scene";
import { ChevronDown, Settings, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const RIPPLE_DURATION_MS = 900;

function getLaunchBackgroundUrl(characterId: string | null): string {
  if (!characterId) return getAssetUrl("/wallpapers/default-scene.svg");
  const config = getCharacterConfig(characterId);
  const sceneId = config?.defaultSceneId;
  if (!sceneId) return getAssetUrl("/wallpapers/default-scene.svg");
  const scene = defaultScenes.find((s) => s.id === sceneId);
  if (!scene) return getAssetUrl("/wallpapers/default-scene.svg");
  if (isSceneStatic(scene)) return getAssetUrl(scene.background);
  if (isSceneVideo(scene) && scene.fallbackImage) return getAssetUrl(scene.fallbackImage);
  return getAssetUrl("/wallpapers/default-scene.svg");
}

export function LaunchPage() {
  const [selectedId, setSelectedId] = useState<string | null>("miki");
  const [showVersion, setShowVersion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rippleProgress, setRippleProgress] = useState(0);
  const pendingCharacterIdRef = useRef<string>("miki");
  const completeLaunch = useLaunchStore((s) => s.completeLaunch);
  const characters = listCharacters();

  const commitLinkStart = useCallback((characterId: string) => {
    const isFirstTime = completeLaunch(characterId);
    useSceneStore.getState().setCharacter(characterId);
    const config = getCharacterConfig(characterId);
    if (config?.defaultSceneId) {
      useSceneStore.getState().setScene(config.defaultSceneId);
    }
    const hasFirstMeet = getStories(characterId).some((s) => s.id === FIRST_MEET_STORY_ID);
    if (isFirstTime && hasFirstMeet) {
      useStoryStore.getState().unlock(characterId, FIRST_MEET_STORY_ID);
      useStoryStore.getState().setIncomingStory({
        characterId,
        storyId: FIRST_MEET_STORY_ID,
      });
    }
  }, [completeLaunch]);

  useEffect(() => {
    if (!isTransitioning) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / RIPPLE_DURATION_MS, 1);
      const easeOut = 1 - (1 - t) ** 2;
      setRippleProgress(easeOut);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        commitLinkStart(pendingCharacterIdRef.current);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isTransitioning, commitLinkStart]);

  const handleLinkStart = () => {
    const characterId = selectedId ?? characters[0]?.id ?? "miki";
    pendingCharacterIdRef.current = characterId;
    setIsTransitioning(true);
  };

  const selectedConfig = selectedId ? getCharacterConfig(selectedId) : null;
  const standUrl = selectedConfig?.defaultStand ? getAssetUrl(selectedConfig.defaultStand) : null;
  const launchBgUrl = getLaunchBackgroundUrl(selectedId);

  const rippleOverlayStyle: React.CSSProperties = {
    WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${rippleProgress * 150}%, black ${rippleProgress * 150}%)`,
    maskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${rippleProgress * 150}%, black ${rippleProgress * 150}%)`,
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-lofi-dark"
      style={{
        backgroundImage: `url(${launchBgUrl ?? getAssetUrl("/wallpapers/default-scene.svg")})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex flex-1 flex-col items-center justify-between p-6 pb-10 pt-12">
        <header className="flex w-full max-w-lg items-start justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="font-pixel text-lg leading-tight md:text-xl">
              <span className="text-lofi-cream/95">Virtua</span>
              <span className="text-lofi-purple-deep">Link</span>
            </h1>
            <p className="mt-1.5 text-sm text-lofi-cream/60">真实连结：与你相伴的日常</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="rounded-lg p-2 text-lofi-cream/70 hover:bg-white/10 hover:text-lofi-cream"
              title="基础设置"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowVersion(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-lofi-cream/70 hover:bg-white/10 hover:text-lofi-cream"
              title="版本与更新说明"
            >
              <span className="text-sm">v{APP_VERSION}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </header>

        {showVersion && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowVersion(false)}
              aria-hidden
            />
            <div
              className="fixed left-1/2 top-1/2 z-50 w-[min(400px,calc(100vw-2rem))] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-lofi-brown/30 bg-lofi-dark/95 shadow-2xl backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="version-modal-title"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-lofi-brown/20 px-4 py-3">
                <h2 id="version-modal-title" className="text-base font-medium text-lofi-cream">
                  版本与更新说明
                </h2>
                <button
                  type="button"
                  onClick={() => setShowVersion(false)}
                  className="rounded-lg p-1.5 text-lofi-cream/70 hover:bg-lofi-brown/20 hover:text-lofi-cream transition-colors"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>
              <div className="max-h-[calc(80vh-3.5rem)] overflow-y-auto p-4 space-y-5">
                {VERSION_HISTORY.map((entry) => (
                  <section key={entry.version}>
                    <p className="mb-2 font-medium text-lofi-cream">v{entry.version}</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-lofi-cream/70">
                      {entry.notes.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </>
        )}

        {showSettings && (
          <div className="w-full max-w-lg rounded-xl border border-lofi-brown/30 bg-lofi-dark/90 p-4 text-sm text-lofi-cream/80 shadow-xl backdrop-blur-sm">
            <p className="font-medium text-lofi-cream">基础设置</p>
            <p className="mt-1 text-lofi-cream/50">进入应用后可在右下角或设置中调整背景、声音与播放等。</p>
          </div>
        )}

        <div className="flex w-full max-w-lg flex-col items-center gap-6">
          <div className="w-full">
            {selectedId && standUrl && (
              <div className="mb-4 flex justify-center">
                <div
                  className={cn(
                    "character-stand relative h-[480px] w-[min(360px,72vw)] max-w-[360px] select-none",
                    isStandVideo(selectedConfig?.defaultStand ?? "") && "bg-transparent character-stand--video"
                  )}
                >
                  {isStandVideo(selectedConfig?.defaultStand ?? "") ? (
                    <video
                      src={standUrl}
                      className="h-full w-full object-contain object-bottom bg-transparent"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={standUrl}
                      alt={selectedConfig?.name ?? ""}
                      fill
                      className="object-contain object-bottom"
                      unoptimized
                    />
                  )}
                </div>
              </div>
            )}
            <p className="mb-3 text-center text-sm text-lofi-cream/70">选择连线角色</p>
            <div className="flex flex-wrap justify-center gap-3">
              {characters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "rounded-xl border-2 px-5 py-3 text-sm font-medium transition",
                    selectedId === c.id
                      ? "border-lofi-accent bg-lofi-accent/30 text-lofi-cream"
                      : "border-lofi-brown/40 bg-lofi-dark/60 text-lofi-cream/80 hover:border-lofi-brown/60"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLinkStart}
            disabled={isTransitioning}
            className="rounded-2xl bg-lofi-accent/80 px-8 py-4 text-lg font-medium text-lofi-dark shadow-lg transition hover:bg-lofi-accent disabled:opacity-70 disabled:pointer-events-none"
          >
            Link Start
          </button>
        </div>
      </div>

      {isTransitioning && (
        <div
          className="pointer-events-none fixed inset-0 z-50 bg-black"
          style={rippleOverlayStyle}
          aria-hidden
        />
      )}
    </div>
  );
}
