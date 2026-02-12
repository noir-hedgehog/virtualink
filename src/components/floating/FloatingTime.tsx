"use client";

import { useUIStore } from "@/stores/uiStore";
import { useClockTick } from "@/stores/uiStore";

const floatPanelClass =
  "rounded-xl bg-lofi-dark/60 backdrop-blur-sm border border-lofi-brown/20 shadow-lg";

export function FloatingTime() {
  useClockTick(1000);
  const { dateTime } = useUIStore();
  const y = dateTime.getFullYear();
  const m = String(dateTime.getMonth() + 1).padStart(2, "0");
  const d = String(dateTime.getDate()).padStart(2, "0");
  const w = dateTime.toLocaleDateString("zh-CN", { weekday: "short" });
  const dateStr = `${y}/${m}/${d}(${w})`;
  const timeStr = dateTime.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={`absolute left-6 top-6 px-4 py-2.5 text-lofi-cream/90 text-sm font-medium ${floatPanelClass}`}
      suppressHydrationWarning
    >
      {dateStr} {timeStr}
    </div>
  );
}
