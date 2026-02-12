"use client";

import { SceneView } from "../scene/SceneView";
import { BottomBar } from "./BottomBar";
import { FloatingTime } from "../floating/FloatingTime";
import { FloatingPomodoro } from "../floating/FloatingPomodoro";
import { FloatingSidebar } from "../floating/FloatingSidebar";
import { Widgets } from "../widgets/Widgets";
import { SettingsModal } from "../modals/SettingsModal";
import { BottomLeftPanel } from "../floating/BottomLeftPanel";
import { PlayerAudio } from "../player/PlayerAudio";

export function MainLayout() {
  return (
    <div className="flex h-screen flex-col">
      <PlayerAudio />
      <Widgets />
      <SettingsModal />
      <BottomLeftPanel />

      {/* 主内容区：场景全屏 + 悬浮面板 */}
      <div className="relative flex-1 min-h-0">
        <SceneView />
        <FloatingTime />
        <FloatingPomodoro />
        <FloatingSidebar />
      </div>

      <BottomBar />
    </div>
  );
}
