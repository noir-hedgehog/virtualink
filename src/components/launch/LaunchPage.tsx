"use client";

import { getCharacterConfig, getStories, listCharacters } from "@/config/characters";
import { APP_VERSION, UPDATE_NOTES } from "@/config/version";
import { getAssetUrl } from "@/lib/utils";
import { useLaunchStore, FIRST_MEET_STORY_ID } from "@/stores/launchStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";
import { ChevronDown, Settings } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LAUNCH_BG = "/wallpapers/background-test.png";
const RIPPLE_DURATION_MS = 900;

export function LaunchPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const rippleOverlayStyle: React.CSSProperties = {
    WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${rippleProgress * 150}%, black ${rippleProgress * 150}%)`,
    maskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${rippleProgress * 150}%, black ${rippleProgress * 150}%)`,
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-lofi-dark"
      style={{
        backgroundImage: `url(${getAssetUrl(LAUNCH_BG)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex flex-1 flex-col items-center justify-between p-6 pb-10 pt-12">
        <header className="flex w-full max-w-lg items-start justify-between gap-4">
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
              onClick={() => setShowVersion((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-lofi-cream/70 hover:bg-white/10 hover:text-lofi-cream"
              title="版本与更新说明"
            >
              <span className="text-sm">v{APP_VERSION}</span>
              <ChevronDown
                className={cn("h-4 w-4 transition", showVersion && "rotate-180")}
              />
            </button>
          </div>
          <div className="flex flex-col items-end text-right">
            <h1 className="font-pixel text-lg leading-tight text-lofi-cream/95 md:text-xl">
              VirtuaLink
            </h1>
            <p className="mt-1.5 text-xs text-lofi-cream/60">真实连结：与你相伴的日常</p>
          </div>
        </header>

        {showVersion && (
          <div className="w-full max-w-lg rounded-xl border border-lofi-brown/30 bg-lofi-dark/90 p-4 text-sm text-lofi-cream/80 shadow-xl backdrop-blur-sm">
            <p className="mb-2 font-medium text-lofi-cream">更新说明 v{APP_VERSION}</p>
            <ul className="list-inside list-disc space-y-1 text-lofi-cream/70">
              {UPDATE_NOTES.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {showSettings && (
          <div className="w-full max-w-lg rounded-xl border border-lofi-brown/30 bg-lofi-dark/90 p-4 text-sm text-lofi-cream/80 shadow-xl backdrop-blur-sm">
            <p className="font-medium text-lofi-cream">基础设置</p>
            <p className="mt-1 text-lofi-cream/50">进入应用后可在右下角或设置中调整壁纸、场景、角色与播放等。</p>
          </div>
        )}

        <div className="flex w-full max-w-lg flex-col items-center gap-6">
          <div className="w-full">
            {selectedId && standUrl && (
              <div className="mb-4 flex justify-center">
                <div className="character-stand relative h-[240px] w-[min(180px,36vw)] max-w-[180px] select-none">
                  <Image
                    src={standUrl}
                    alt={selectedConfig?.name ?? ""}
                    fill
                    className="object-contain object-bottom"
                    unoptimized
                  />
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
