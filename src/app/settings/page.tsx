"use client";

import { Suspense } from "react";
import { useSceneStore } from "@/stores/sceneStore";
import { useAmbientSoundStore } from "@/stores/ambientSoundStore";
import { ambientSoundOptions } from "@/config/ambientSounds";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "general";
  const { scenes, currentSceneId, setScene } = useSceneStore();
  const standBreathingEnabled = useSceneStore((s) => s.standBreathingEnabled);
  const setStandBreathingEnabled = useSceneStore((s) => s.setStandBreathingEnabled);
  const standDynamicFormat = useSceneStore((s) => s.standDynamicFormat);
  const setStandDynamicFormat = useSceneStore((s) => s.setStandDynamicFormat);
  const ambientSoundId = useAmbientSoundStore((s) => s.ambientSoundId);
  const setAmbientSound = useAmbientSoundStore((s) => s.setAmbientSound);

  return (
    <div className="flex h-screen flex-col bg-lofi-dark/95">
      <header className="flex shrink-0 items-center gap-4 border-b border-lofi-brown/30 px-6 py-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="p-2 text-lofi-cream/80 hover:text-lofi-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-medium text-lofi-cream">设置</h1>
      </header>
      <div className="flex flex-1 gap-6 overflow-auto p-6">
        <nav className="flex w-40 shrink-0 flex-col gap-1">
          {["general", "scene"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => router.push(`/settings?tab=${t}`)}
              className={`rounded-lg px-3 py-2 text-left text-sm ${
                tab === t
                  ? "bg-lofi-accent/30 text-lofi-cream"
                  : "text-lofi-cream/70 hover:bg-lofi-brown/20"
              }`}
            >
              {t === "general" && "通用"}
              {t === "scene" && "场景"}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          {tab === "general" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lofi-cream font-medium">通用</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lofi-cream/90 text-sm">静态立绘呼吸效果</p>
                      <p className="text-lofi-cream/50 text-xs mt-0.5">开启后静态立绘有轻微呼吸动画</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={standBreathingEnabled}
                      onClick={() => setStandBreathingEnabled(!standBreathingEnabled)}
                      className={cn(
                        "relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors",
                        standBreathingEnabled
                          ? "border-lofi-accent bg-lofi-accent/50"
                          : "border-lofi-brown/40 bg-lofi-dark/60"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 block h-5 w-5 rounded-full bg-lofi-cream transition-transform",
                          standBreathingEnabled ? "left-6" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-lofi-cream/90 text-sm">动态立绘兼容</p>
                    <p className="text-lofi-cream/50 text-xs">当动态立绘显示黑底时，可切换为其他格式尝试</p>
                    <select
                      value={standDynamicFormat}
                      onChange={(e) => setStandDynamicFormat(e.target.value as "webm" | "gif" | "avif")}
                      className="rounded-lg border border-lofi-brown/40 bg-lofi-dark/80 px-3 py-2 text-sm text-lofi-cream focus:border-lofi-accent/50 focus:outline-none"
                    >
                      <option value="webm">webm</option>
                      <option value="gif">gif</option>
                      <option value="avif">avif</option>
                    </select>
                  </div>
                </div>
              </div>
              <p className="text-lofi-cream/50 text-sm">番茄钟时长等可在主界面番茄钟处调整。</p>
            </div>
          )}
          {tab === "scene" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lofi-cream font-medium">背景</h2>
                <p className="text-lofi-cream/60 text-sm">静态图或循环视频。</p>
                <div className="flex flex-wrap gap-3">
                  {scenes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setScene(s.id)}
                      className={`rounded-lg border-2 px-4 py-2 text-sm transition-colors ${
                        currentSceneId === s.id
                          ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                          : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-lofi-cream font-medium">声音</h2>
                <p className="text-lofi-cream/60 text-sm">环境音循环播放，需自备音频文件。</p>
                <div className="flex flex-wrap gap-3">
                  {ambientSoundOptions.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setAmbientSound(o.id)}
                      className={`rounded-lg border-2 px-4 py-2 text-sm transition-colors ${
                        ambientSoundId === o.id
                          ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                          : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                      }`}
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-lofi-dark text-lofi-cream/60">加载中...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
