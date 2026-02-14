"use client";

import { useRef, useEffect } from "react";
import { useSceneStore, getCurrentSceneConfig } from "@/stores/sceneStore";
import { getAssetUrl } from "@/lib/utils";
import { CharacterView } from "./CharacterView";
import { CustomizeBar } from "./CustomizeBar";
import { isSceneStatic, isSceneVideo } from "@/types/scene";

export function SceneView() {
  const scene = useSceneStore((s) => getCurrentSceneConfig(s));
  const characterStandVisible = useSceneStore((s) => s.characterStandVisible);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v && scene && isSceneVideo(scene)) v.play().catch(() => {});
  }, [scene?.id, scene?.type]);

  return (
    <div className="scene-bg relative h-full w-full overflow-hidden">
      {scene && isSceneStatic(scene) && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${getAssetUrl(scene.background)})` }}
        />
      )}

      {scene && isSceneVideo(scene) && (
        <>
          {scene.fallbackImage && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${getAssetUrl(scene.fallbackImage)})` }}
              aria-hidden
            />
          )}
          <video
            ref={videoRef}
            src={getAssetUrl(scene.videoUrl)}
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            autoPlay
            onError={() => {}}
          />
        </>
      )}

      {characterStandVisible && <CharacterView />}
      <CustomizeBar />
    </div>
  );
}
