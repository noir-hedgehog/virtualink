"use client";

import { useLaunchStore } from "@/stores/launchStore";
import { LaunchPage } from "./LaunchPage";
import { MainLayout } from "@/components/layout/MainLayout";

/** 根据是否已完成启动显示启动页或主应用 */
export function HomeGate() {
  const launchCompleted = useLaunchStore((s) => s.launchCompleted);

  if (!launchCompleted) {
    return <LaunchPage />;
  }
  return <MainLayout />;
}
