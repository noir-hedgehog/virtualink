"use client";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useClockTick } from "@/stores/uiStore";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export function PomodoroWidget() {
  useClockTick(1000);
  const {
    phase,
    remainingSeconds,
    workMinutes,
    restMinutes,
    cycle,
    level,
    isRunning,
    start,
    pause,
  } = usePomodoroStore();

  const label = phase === "work" ? "创作" : "休息";
  const totalSeconds = phase === "work" ? workMinutes * 60 : restMinutes * 60;
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const display = formatTime(remainingSeconds);

  return (
    <div className="flex items-center gap-3">
      {/* 等级 */}
      <span className="rounded-full bg-lofi-accent/20 px-2.5 py-0.5 text-xs text-lofi-cream/80">
        等级 {level}
      </span>
      {/* 圆形番茄钟 */}
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
        {/* 外圈：循环 */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-lofi-brown/40"
          />
        </svg>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-lofi-cream/60">
          循环 {cycle}
        </div>
        {/* 内圈：进度 */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 251.2} 251.2`}
            className="text-lofi-accent/70 transition-all duration-1000"
          />
        </svg>
        {/* 中心：时间 + 控制 */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-lofi-cream/60">{label} {phase === "work" ? workMinutes : restMinutes}</span>
          <span className="font-mono text-lg font-medium text-lofi-cream tabular-nums">{display}</span>
          <div className="mt-0.5 flex items-center gap-0.5">
            <button
              type="button"
              className="p-0.5 text-lofi-cream/60 hover:text-lofi-cream"
              aria-label="上一阶段"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => (isRunning ? pause() : start())}
              className="flex items-center justify-center rounded-full bg-lofi-accent/50 p-0.5 text-lofi-cream hover:bg-lofi-accent/70"
              aria-label={isRunning ? "暂停" : "开始"}
            >
              {isRunning ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 ml-0.5" />
              )}
            </button>
            <button
              type="button"
              className="p-0.5 text-lofi-cream/60 hover:text-lofi-cream"
              aria-label="下一阶段"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
