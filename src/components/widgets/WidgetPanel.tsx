"use client";

import { useCallback, useState } from "react";
import { X, Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetId } from "@/stores/widgetStore";
import { useWidgetStore } from "@/stores/widgetStore";

const WIDTH = 380;
const MIN_Y = 40;

type WidgetPanelProps = {
  id: WidgetId;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function WidgetPanel({ id, title, children, className }: WidgetPanelProps) {
  const { widgets, closeWidget, setWidgetPosition, setWidgetLocked } = useWidgetStore();
  const state = widgets[id];
  const [drag, setDrag] = useState<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const locked = state?.locked ?? false;
  const effectiveX = drag
    ? drag.baseX + (drag.currentX - drag.startX)
    : (state?.x ?? 120);
  const effectiveY = drag
    ? Math.max(MIN_Y, drag.baseY + (drag.currentY - drag.startY))
    : (state?.y ?? 100);

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (locked) return;
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDrag({
        startX: e.clientX,
        startY: e.clientY,
        baseX: state?.x ?? 120,
        baseY: state?.y ?? 100,
        currentX: e.clientX,
        currentY: e.clientY,
      });
    },
    [locked, state?.x, state?.y]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    setDrag((prev) =>
      prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null
    );
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      const nx = drag.baseX + (e.clientX - drag.startX);
      const ny = Math.max(MIN_Y, drag.baseY + (e.clientY - drag.startY));
      setWidgetPosition(id, nx, ny);
      setDrag(null);
    },
    [drag, id, setWidgetPosition]
  );

  if (!state?.visible) return null;

  return (
    <div
      className={cn(
        "fixed z-40 flex flex-col rounded-2xl border border-lofi-brown/20 bg-lofi-dark/60 shadow-xl backdrop-blur-sm",
        className
      )}
      style={{
        width: WIDTH,
        left: effectiveX,
        top: effectiveY,
        maxHeight: `calc(100vh - ${effectiveY}px - 16px)`,
      }}
    >
      <header
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-lofi-brown/20 px-4 py-2.5",
          locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={(e) => {
          if (drag) {
            const nx = drag.baseX + (e.clientX - drag.startX);
            const ny = Math.max(MIN_Y, drag.baseY + (e.clientY - drag.startY));
            setWidgetPosition(id, nx, ny);
            setDrag(null);
          }
        }}
      >
        <h3 className="text-sm font-medium text-lofi-cream select-none">{title}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWidgetLocked(id, !locked)}
            className="p-1.5 rounded-lg text-lofi-cream/70 hover:text-lofi-cream hover:bg-lofi-brown/20"
            title={locked ? "取消固定以拖拽" : "固定位置"}
          >
            {locked ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => closeWidget(id)}
            className="p-1.5 rounded-lg text-lofi-cream/70 hover:text-lofi-cream hover:bg-lofi-brown/20"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
