"use client";

import { useLaunchStore } from "@/stores/launchStore";
import { useExitTransitionStore, EXIT_DURATION_MS } from "@/stores/exitTransitionStore";
import { useEffect, useState } from "react";

/**
 * 退出转场：黑屏从中心向四周收束，结束后回到启动页
 */
export function ExitTransitionOverlay() {
  const isExiting = useExitTransitionStore((s) => s.isExiting);
  const finishExit = useExitTransitionStore((s) => s.finishExit);
  const exitToLaunchPage = useLaunchStore((s) => s.exitToLaunchPage);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isExiting) {
      setProgress(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / EXIT_DURATION_MS, 1);
      const easeIn = t * t;
      setProgress(easeIn);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        exitToLaunchPage();
        finishExit();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isExiting, exitToLaunchPage, finishExit]);

  if (!isExiting) return null;

  const maskSize = `${(1 - progress) * 150}%`;
  const style: React.CSSProperties = {
    WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${maskSize}, black ${maskSize})`,
    maskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${maskSize}, black ${maskSize})`,
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] bg-black"
      style={style}
      aria-hidden
    />
  );
}
