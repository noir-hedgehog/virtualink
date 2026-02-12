"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useSceneStore } from "@/stores/sceneStore";
import { getCharacterConfig } from "@/config/characters";
import { Live2DViewer } from "./Live2DViewer";

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

  const display = getDisplayFromStore(characterDisplay, characterId, sceneId);
  const config = characterId ? getCharacterConfig(characterId) : null;
  const canAdjust = !characterAdjustLocked;

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
      if (!canAdjust || !characterId || !sceneId) return;
      if ((e.target as HTMLElement).closest("[data-character-toolbar]")) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({
        startClientX: e.clientX,
        startClientY: e.clientY,
        baseX: display.x,
        baseY: display.y,
        currentClientX: e.clientX,
        currentClientY: e.clientY,
      });
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
      if (!drag) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      const x = drag.baseX + (e.clientX - drag.startClientX);
      const y = drag.baseY + (e.clientY - drag.startClientY);
      setCharacterDisplay(characterId!, sceneId, { x, y });
      setDrag(null);
    },
    [drag, characterId, sceneId, setCharacterDisplay]
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
      ) : config.defaultStand ? (
        <div
          className="relative h-full w-full max-w-[50%] aspect-[2/3] character-stand select-none"
          style={{
            minWidth: 0,
            userSelect: "none",
            ...({ WebkitUserDrag: "none" } as React.CSSProperties),
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          <Image
            src={config.defaultStand}
            alt={config.name}
            fill
            className="object-contain object-bottom pointer-events-none"
            sizes="50vw"
            unoptimized={config.defaultStand.endsWith(".svg")}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
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
          <div className="h-full w-full" style={{ minHeight: "60vh" }}>
            {content}
          </div>
        </div>

        {canAdjust && (
        <div
          data-character-toolbar
          className="mt-2 flex items-center gap-3 rounded-lg bg-lofi-dark/60 backdrop-blur-sm px-3 py-2 border border-lofi-cream/10"
        >
          <span className="text-lofi-cream/80 text-sm whitespace-nowrap">缩放</span>
          <input
            type="range"
            min={0.3}
            max={2}
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
      </div>
    </div>
  );
}
