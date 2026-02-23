"use client";

import { ensureCharactersLoaded, isCharactersLoaded } from "@/config/characters";
import { useLaunchStore } from "@/stores/launchStore";
import { LaunchPage } from "./LaunchPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";

/** 根据是否已完成启动显示启动页或主应用 */
export function HomeGate() {
  const launchCompleted = useLaunchStore((s) => s.launchCompleted);
  const [ready, setReady] = useState(isCharactersLoaded());

  useEffect(() => {
    if (ready) return;
    ensureCharactersLoaded().then(() => setReady(true));
  }, [ready]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lofi-dark">
        <div className="text-lofi-cream/70">加载中…</div>
      </div>
    );
  }

  if (!launchCompleted) {
    return <LaunchPage />;
  }
  return <MainLayout />;
}
