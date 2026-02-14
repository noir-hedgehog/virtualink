"use client";

import { getCharacterConfig } from "@/config/characters";
import { getAssetUrl } from "@/lib/utils";
import { usePlayerStore } from "@/stores/playerStore";
import { useStoryStore } from "@/stores/storyStore";
import { isStoryGalgame, isStoryVideo } from "@/types/story";
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

/** Galgame 型剧情：场景 + 立绘 + 对话，点击推进 */
function GalgameStoryPlayer({
  scenes,
  onEnd,
}: {
  scenes: Array<{
    background?: string;
    character?: string;
    position?: "left" | "center" | "right";
    lines: string[];
  }>;
  onEnd: () => void;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  const scene = scenes[sceneIndex];
  const line = scene?.lines[lineIndex] ?? "";

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

  const config = scene.character ? getCharacterConfig(scene.character) : null;
  const standUrl = config?.defaultStand ? getAssetUrl(config.defaultStand) : "";
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
        scene.background
          ? { backgroundImage: `url(${getAssetUrl(scene.background)})`, backgroundSize: "cover" }
          : undefined
      }
    >
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
          <div className="character-stand relative h-[70vh] max-h-[480px] w-auto max-w-[45%] aspect-[2/3] select-none">
            <Image
              src={standUrl}
              alt={config?.name ?? ""}
              fill
              className="object-contain object-bottom"
              unoptimized
            />
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
    return (
      <GalgameStoryPlayer scenes={story.scenes} onEnd={closeStory} />
    );
  }

  return null;
}
