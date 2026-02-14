"use client";

import { getCharacterConfig } from "@/config/characters";
import { defaultScenes } from "@/config/scenes";
import { getAssetUrl, cn } from "@/lib/utils";
import { isStandVideo } from "@/lib/standMedia";
import { usePlayerStore } from "@/stores/playerStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";
import { isStoryGalgame, isStoryVideo } from "@/types/story";
import { isSceneStatic, isSceneVideo } from "@/types/scene";
import { Volume2, VolumeX, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const RIPPLE_DURATION_MS = 900;

/** 视频型剧情：全黑 → 中心亮圆如水波扩散至全屏，转场结束后自动播放；音量按钮点击静音，再次点击恢复之前音量 */
function VideoStoryPlayer({ url, onEnd }: { url: string; onEnd: () => void }) {
  const src = getAssetUrl(url);
  const ref = useRef<HTMLVideoElement>(null);
  const appVolume = usePlayerStore((s) => s.volume);
  const [rippleProgress, setRippleProgress] = useState(0);
  const [transitionDone, setTransitionDone] = useState(false);
  const [muted, setMuted] = useState(appVolume <= 0);
  const savedVolumeRef = useRef(appVolume > 0 ? appVolume : 0.8);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = muted;
    if (!muted) el.volume = savedVolumeRef.current;
  }, [muted]);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / RIPPLE_DURATION_MS, 1);
      const easeOut = 1 - (1 - t) ** 2;
      setRippleProgress(easeOut);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTransitionDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!transitionDone) return;
    const el = ref.current;
    if (el) {
      el.muted = muted;
      if (!muted) el.volume = savedVolumeRef.current;
      el.play().catch(() => {});
    }
  }, [transitionDone, muted]);

  const toggleMute = useCallback(() => {
    const el = ref.current;
    if (muted) {
      setMuted(false);
      if (el) el.volume = savedVolumeRef.current;
    } else {
      if (el) savedVolumeRef.current = el.volume;
      setMuted(true);
    }
  }, [muted]);

  const maskSize = `${rippleProgress * 150}%`;
  const overlayStyle = {
    WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${maskSize}, black ${maskSize})`,
    maskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${maskSize}, black ${maskSize})`,
  } as React.CSSProperties;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <video
        ref={ref}
        className="max-h-full max-w-full object-contain"
        src={src}
        playsInline
        muted={muted}
        onEnded={onEnd}
        preload="auto"
      />
      {!transitionDone && (
        <div
          className="pointer-events-none absolute inset-0 bg-black"
          style={overlayStyle}
          aria-hidden
        />
      )}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMute}
          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label={muted ? "取消静音" : "静音"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** Galgame 型剧情：场景 + 立绘 + 对话，点击推进；若场景带 audioUrl + lineTimings 则点击下一句时播放对应音频片段；未指定背景/立绘时使用角色默认场景背景与默认立绘 */
function GalgameStoryPlayer({
  characterId,
  defaultBackgroundUrl,
  scenes,
  onEnd,
}: {
  characterId: string;
  defaultBackgroundUrl: string | null;
  scenes: Array<{
    background?: string;
    character?: string;
    position?: "left" | "center" | "right";
    lines: string[];
    audioUrl?: string;
    lineTimings?: Array<{ startMs: number; endMs: number }>;
  }>;
  onEnd: () => void;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scene = scenes[sceneIndex];
  const line = scene?.lines[lineIndex] ?? "";
  const timing = scene?.lineTimings?.[lineIndex];

  const advance = useCallback(() => {
    if (!scene) return;
    if (lineIndex < scene.lines.length - 1) {
      setLineIndex((i) => i + 1);
    } else if (sceneIndex < scenes.length - 1) {
      setSceneIndex((i) => i + 1);
      setLineIndex(0);
    } else {
      onEnd();
    }
  }, [scene, sceneIndex, lineIndex, scenes.length, onEnd]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (scene?.audioUrl) {
      audio.src = getAssetUrl(scene.audioUrl);
    } else {
      audio.removeAttribute("src");
    }
  }, [sceneIndex, scene?.audioUrl]);

  useEffect(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    const audio = audioRef.current;
    if (!scene?.audioUrl || !timing || !audio) return;
    const startSec = timing.startMs / 1000;
    const durationMs = Math.max(0, timing.endMs - timing.startMs);
    const playSegment = () => {
      audio.currentTime = startSec;
      audio.play().catch(() => {});
      stopTimeoutRef.current = setTimeout(() => {
        audio.pause();
        stopTimeoutRef.current = null;
      }, durationMs);
    };
    if (audio.readyState >= 2) {
      playSegment();
    } else {
      audio.addEventListener("canplay", () => playSegment(), { once: true });
    }
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [sceneIndex, lineIndex, scene?.audioUrl, timing]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [advance]);

  if (!scene) return null;

  const charId = scene.character ?? characterId;
  const config = getCharacterConfig(charId);
  const getStandIndex = useSceneStore((s) => s.getStandIndex);
  const standSrc = config?.stands?.length
    ? (config.stands[getStandIndex(charId)] ?? config.stands[0])
    : config?.defaultStand;
  const standUrl = standSrc ? getAssetUrl(standSrc) : "";
  const bgUrl = scene.background ? getAssetUrl(scene.background) : (defaultBackgroundUrl ?? "");
  const positionClass =
    scene.position === "left"
      ? "justify-start"
      : scene.position === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-lofi-dark"
      style={
        bgUrl
          ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover" }
          : undefined
      }
    >
      <audio ref={audioRef} className="hidden" />
      <button
        type="button"
        onClick={onEnd}
        className="absolute right-4 top-4 z-10 rounded-lg bg-black/30 p-2 text-lofi-cream hover:bg-black/50"
        aria-label="关闭"
      >
        <X className="h-5 w-5" />
      </button>

      <div className={`flex flex-1 items-end ${positionClass} p-4 pb-32`}>
        {standUrl && (
          <div
            className={cn(
              "character-stand relative h-[70vh] max-h-[480px] w-auto max-w-[45%] aspect-[2/3] select-none",
              standSrc && isStandVideo(standSrc) && "bg-transparent character-stand--video"
            )}
          >
            {standSrc && isStandVideo(standSrc) ? (
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
                alt={config?.name ?? ""}
                fill
                className="object-contain object-bottom"
                unoptimized
              />
            )}
          </div>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={advance}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? advance() : null)}
        className="absolute bottom-0 left-0 right-0 border-t border-lofi-brown/30 bg-lofi-dark/95 px-6 py-4 text-lofi-cream cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-lofi-accent"
      >
        <p className="min-h-[2.5rem] text-base">{line || "..."}</p>
        <p className="mt-2 text-xs text-lofi-cream/50">点击或按空格 / 回车继续</p>
      </div>
    </div>
  );
}

export function StoryPlayer() {
  const currentStoryCharacterId = useStoryStore((s) => s.currentStoryCharacterId);
  const currentStoryId = useStoryStore((s) => s.currentStoryId);
  const getStory = useStoryStore((s) => s.getStory);
  const closeStory = useStoryStore((s) => s.closeStory);

  const story =
    currentStoryCharacterId && currentStoryId
      ? getStory(currentStoryCharacterId, currentStoryId)
      : null;

  if (!story) return null;

  if (isStoryVideo(story)) {
    return (
      <VideoStoryPlayer url={story.url} onEnd={closeStory} />
    );
  }

  if (isStoryGalgame(story)) {
    const config = currentStoryCharacterId ? getCharacterConfig(currentStoryCharacterId) : null;
    const defaultSceneId = config?.defaultSceneId;
    const defaultScene = defaultSceneId
      ? defaultScenes.find((s) => s.id === defaultSceneId)
      : null;
    const defaultBackgroundUrl =
      defaultScene && isSceneStatic(defaultScene)
        ? getAssetUrl(defaultScene.background)
        : defaultScene && isSceneVideo(defaultScene) && defaultScene.fallbackImage
          ? getAssetUrl(defaultScene.fallbackImage)
          : null;
    return (
      <GalgameStoryPlayer
        characterId={currentStoryCharacterId!}
        defaultBackgroundUrl={defaultBackgroundUrl}
        scenes={story.scenes}
        onEnd={closeStory}
      />
    );
  }

  return null;
}
