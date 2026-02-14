"use client";

import { triggerAchievementsAndIntimacy } from "@/lib/storyTrigger";
import { usePlayVoice } from "@/lib/voice";
import { Play, Pause, ArrowLeftRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useClockTick } from "@/stores/uiStore";

const floatPanelClass =
  "rounded-xl bg-lofi-dark/60 backdrop-blur-sm border border-lofi-brown/20 shadow-lg";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const MINUTES_OPTIONS = [5, 10, 15, 25, 30, 45, 60];

export function FloatingPomodoro() {
  useClockTick(1000);
  const {
    phase,
    remainingSeconds,
    workMinutes,
    restMinutes,
    isRunning,
    start,
    pause,
    setWorkMinutes,
    setRestMinutes,
    switchPhase,
  } = usePomodoroStore();
  const playVoice = usePlayVoice();

  const prevPhaseRef = useRef<"work" | "rest">("work");
  const prevRemainingRef = useRef<number>(remainingSeconds);
  useEffect(() => {
    const now = phase;
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = now;
    if (prev === "work" && now === "rest") {
      triggerAchievementsAndIntimacy(3);
    }
  }, [phase]);

  useEffect(() => {
    const prev = prevRemainingRef.current;
    prevRemainingRef.current = remainingSeconds;
    if (isRunning && phase === "work" && prev > 600 && remainingSeconds === 600) {
      playVoice("pomodoro_10min");
    }
  }, [isRunning, phase, remainingSeconds, playVoice]);

  const display = formatTime(remainingSeconds);
  const statusLabel =
    isRunning
      ? (phase === "work" ? "工作中" : "休息中")
      : (phase === "work" ? "开始工作" : "开始休息");

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
      playVoice("pomodoro_pause");
    } else {
      start();
    }
  };

  return (
    <div className={`absolute right-6 top-6 flex items-stretch gap-4 px-4 py-3 ${floatPanelClass}`}>
      {/* 左侧：工作、休息设定（上下排列） */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-lofi-cream/60">工作</span>
          <select
            value={workMinutes}
            onChange={(e) => setWorkMinutes(Number(e.target.value))}
            disabled={isRunning}
            className="rounded-lg border border-lofi-brown/40 bg-lofi-dark/80 px-2 py-1 text-sm text-lofi-cream focus:border-lofi-accent/50 focus:outline-none disabled:opacity-60"
          >
            {MINUTES_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} 分钟
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-lofi-cream/60">休息</span>
          <select
            value={restMinutes}
            onChange={(e) => setRestMinutes(Number(e.target.value))}
            disabled={isRunning}
            className="rounded-lg border border-lofi-brown/40 bg-lofi-dark/80 px-2 py-1 text-sm text-lofi-cream focus:border-lofi-accent/50 focus:outline-none disabled:opacity-60"
          >
            {MINUTES_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} 分钟
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 右侧：状态、倒计时、开始 + 切换工作/休息 */}
      <div className="flex flex-col items-center justify-center gap-3">
        <span className="text-lg text-lofi-cream/60">{statusLabel}</span>
        <span className="font-mono text-xl font-medium text-lofi-cream tabular-nums">{display}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex items-center justify-center rounded-lg bg-lofi-accent/50 px-3 py-1.5 text-lofi-cream hover:bg-lofi-accent/70 transition-colors"
            aria-label={isRunning ? "暂停" : "开始"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={switchPhase}
            className="flex items-center justify-center rounded-lg border-0 bg-transparent px-1.5 py-1.5 text-lofi-cream/80 hover:bg-lofi-brown/30 hover:text-lofi-cream transition-colors"
            aria-label="切换工作/休息"
            title="切换工作/休息"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
