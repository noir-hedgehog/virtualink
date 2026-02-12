"use client";

import { useSceneStore } from "@/stores/sceneStore";
import { CharacterView } from "./CharacterView";
import { CustomizeBar } from "./CustomizeBar";

export function SceneView() {
  const wallpapers = useSceneStore((s) => s.wallpapers);
  const scenes = useSceneStore((s) => s.scenes);
  const currentWallpaperId = useSceneStore((s) => s.currentWallpaperId);
  const currentSceneId = useSceneStore((s) => s.currentSceneId);
  const currentWallpaper = wallpapers.find((w) => w.id === currentWallpaperId) ?? null;
  const currentScene = scenes.find((s) => s.id === currentSceneId) ?? null;

  return (
    <div className="scene-bg relative h-full w-full overflow-hidden">
      {/* 壁纸层 */}
      {currentWallpaper?.url && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${currentWallpaper.url})` }}
        />
      )}
      {/* 场景遮罩/叠加（可选） */}
      {currentScene?.overlayUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: `url(${currentScene.overlayUrl})` }}
        />
      )}
      {/* 角色层 */}
      <CharacterView />
      <CustomizeBar />
    </div>
  );
}
