"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useSceneStore } from "@/stores/sceneStore";
import { getCharacterConfig } from "@/config/characters";
import { getAssetUrl, cn } from "@/lib/utils";
import { isStandVideo } from "@/lib/standMedia";
import { usePlayVoice } from "@/lib/voice";
import { Live2DViewer } from "./Live2DViewer";

const TAP_MOVE_THRESHOLD = 8;
const RAPID_TAP_WINDOW_MS = 2000;
const RAPID_TAP_COUNT = 5;
const RANDOM_TAP_PROB = 0.35;

function getDisplayFromStore(
  characterDisplay: Record<string, { x?: number; y?: number; scale?: number }>,
  characterId: string | null,
  sceneId: string
): { x: number; y: number; scale: number } {
  if (!characterId) return { x: 0, y: 0, scale: 1 };
  const key = `${characterId}|${sceneId}`;
  const raw = characterDisplay[key];
  return {
    x: Number(raw?.x) || 0,
    y: Number(raw?.y) || 0,
    scale: Number(raw?.scale) || 1,
  };
}

export function CharacterView() {
  const characterId = useSceneStore((s) => s.currentCharacterId);
  const sceneId = useSceneStore((s) => s.currentSceneId) ?? "default";
  const characterDisplay = useSceneStore((s) => s.characterDisplay);
  const characterAdjustLocked = useSceneStore((s) => s.characterAdjustLocked);
  const setCharacterDisplay = useSceneStore((s) => s.setCharacterDisplay);
  const getStandIndex = useSceneStore((s) => s.getStandIndex);

  const display = getDisplayFromStore(characterDisplay, characterId, sceneId);
  const config = characterId ? getCharacterConfig(characterId) : null;
  const effectiveStand =
    config?.stands?.length
      ? (config.stands[getStandIndex(characterId ?? "")] ?? config.stands[0])
      : config?.defaultStand;
  const canAdjust = !characterAdjustLocked;
  const playVoice = usePlayVoice();
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const tapTimestampsRef = useRef<number[]>([]);

  const [drag, setDrag] = useState<{
    startClientX: number;
    startClientY: number;
    baseX: number;
    baseY: number;
    currentClientX: number;
    currentClientY: number;
  } | null>(null);
  const effectiveX = drag
    ? drag.baseX + (drag.currentClientX - drag.startClientX)
    : display.x;
  const effectiveY = drag
    ? drag.baseY + (drag.currentClientY - drag.startClientY)
    : display.y;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!characterId || !sceneId) return;
      if ((e.target as HTMLElement).closest("[data-character-toolbar]")) return;
      e.preventDefault();
      pointerDownRef.current = { x: e.clientX, y: e.clientY };
      if (canAdjust) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag({
          startClientX: e.clientX,
          startClientY: e.clientY,
          baseX: display.x,
          baseY: display.y,
          currentClientX: e.clientX,
          currentClientY: e.clientY,
        });
      }
    },
    [canAdjust, characterId, sceneId, display.x, display.y]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    setDrag((prev) =>
      prev
        ? { ...prev, currentClientX: e.clientX, currentClientY: e.clientY }
        : null
    );
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerDownRef.current;
      pointerDownRef.current = null;
      if (drag) e.currentTarget.releasePointerCapture(e.pointerId);
      const dist = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 999;
      const isTap = dist < TAP_MOVE_THRESHOLD;

      if (isTap && config?.voice) {
        const now = Date.now();
        const timestamps = tapTimestampsRef.current;
        timestamps.push(now);
        const cutoff = now - RAPID_TAP_WINDOW_MS;
        const recent = timestamps.filter((t) => t > cutoff);
        tapTimestampsRef.current = recent;
        if (recent.length >= RAPID_TAP_COUNT) {
          tapTimestampsRef.current = [];
          playVoice("stand_tap_5");
        } else if (Math.random() < RANDOM_TAP_PROB) {
          const keys = config.tapRandomKeys?.length
            ? config.tapRandomKeys
            : ["stand_tap"];
          const key = keys[Math.floor(Math.random() * keys.length)];
          playVoice(key);
        }
      }

      if (drag) {
        if (!isTap) {
          const x = drag.baseX + (e.clientX - drag.startClientX);
          const y = drag.baseY + (e.clientY - drag.startClientY);
          setCharacterDisplay(characterId!, sceneId, { x, y });
        }
        setDrag(null);
      }
    },
    [drag, characterId, sceneId, setCharacterDisplay, config?.voice, playVoice]
  );

  const setScale = useCallback(
    (scale: number) => {
      if (characterId && sceneId) setCharacterDisplay(characterId, sceneId, { scale });
    },
    [characterId, sceneId, setCharacterDisplay]
  );

  const resetDisplay = useCallback(() => {
    if (characterId && sceneId)
      setCharacterDisplay(characterId, sceneId, { x: 0, y: 0, scale: 1 });
  }, [characterId, sceneId, setCharacterDisplay]);

  if (!config) return null;

  const content = (
    <>
      {config.live2d?.modelPath ? (
        <div className="h-full w-full">
          <Live2DViewer
            modelPath={config.live2d.modelPath}
            motionGroup={config.live2d.motions?.idle ?? "Idle"}
          />
        </div>
      ) : effectiveStand ? (
        <div
          className={cn(
            "relative h-full max-w-full aspect-[2/3] character-stand select-none min-w-0",
            isStandVideo(effectiveStand) && "bg-transparent character-stand--video"
          )}
          style={{
            minWidth: 0,
            userSelect: "none",
            ...({ WebkitUserDrag: "none" } as React.CSSProperties),
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          {isStandVideo(effectiveStand) ? (
            <video
              src={getAssetUrl(effectiveStand)}
              className="h-full w-full object-contain object-bottom pointer-events-none bg-transparent"
              autoPlay
              loop
              muted
              playsInline
              draggable={false}
            />
          ) : (
            <Image
              src={getAssetUrl(effectiveStand)}
              alt={config.name}
              fill
              className="object-contain object-bottom pointer-events-none"
              sizes="50vw"
              unoptimized
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          )}
        </div>
      ) : (
        <div className="flex h-full max-w-[50%] items-center justify-center text-lofi-cream/50 text-sm">
          {config.name} 立绘占位
        </div>
      )}
    </>
  );

  const wrapperStyle: React.CSSProperties = {
    transform: `translate(${effectiveX}px, ${effectiveY}px) scale(${display.scale})`,
    transformOrigin: "50% 100%",
  };

  return (
    <>
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center h-[85%] w-full max-w-[50%]">
          <div
            className={`relative h-full w-full flex items-end justify-center touch-none ${canAdjust ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
            style={wrapperStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={(e) => {
              if (drag && e.currentTarget.hasPointerCapture(e.pointerId)) {
                const x = drag.baseX + (e.clientX - drag.startClientX);
                const y = drag.baseY + (e.clientY - drag.startClientY);
                setCharacterDisplay(characterId!, sceneId, { x, y });
                setDrag(null);
              }
            }}
          >
            <div className="h-full w-full min-h-0 flex flex-col justify-end">
              {content}
            </div>
          </div>
        </div>
      </div>

      {/* 角色调整工具栏：固定在顶部与时间/番茄钟同一行，避免被底部播放器挡住 */}
      {canAdjust && (
        <div
          data-character-toolbar
          className="fixed left-1/2 top-6 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-lofi-brown/20 bg-lofi-dark/60 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <span className="text-lofi-cream/80 text-sm whitespace-nowrap">缩放</span>
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.05}
            value={display.scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-24 h-2 rounded accent-lofi-cream/70"
          />
          <span className="text-lofi-cream/60 text-xs tabular-nums w-8">
            {Math.round(display.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={resetDisplay}
            className="text-lofi-cream/70 hover:text-lofi-cream text-sm px-2 py-1 rounded hover:bg-lofi-cream/10"
          >
            重置
          </button>
        </div>
      )}
    </>
  );
}
