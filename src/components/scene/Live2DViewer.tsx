"use client";

import { useEffect, useRef, useState } from "react";

const CUBISM_CORE_URL =
  "https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js";

type Live2DViewerProps = {
  modelPath: string;
  motionGroup?: string;
  className?: string;
};

export function Live2DViewer({
  modelPath,
  motionGroup = "Idle",
  className = "",
}: Live2DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let app: unknown = null;
    let model: unknown = null;
    let ro: ResizeObserver | null = null;

    const init = async () => {
      try {
        // 1. 确保 Cubism Core 已加载
        if (!(window as unknown as { Live2DCubismCore?: unknown }).Live2DCubismCore) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = CUBISM_CORE_URL;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Cubism Core"));
            document.head.appendChild(script);
          });
        }

        const PIXI = await import("pixi.js");
        const { Live2DModel } = await import("pixi-live2d-display/cubism4");

        (window as unknown as { PIXI: unknown }).PIXI = PIXI;

        container.innerHTML = "";
        const rect = container.getBoundingClientRect();
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        container.appendChild(canvas);

        app = new PIXI.Application({
          view: canvas,
          width: Math.max(rect.width, 1),
          height: Math.max(rect.height, 1),
          backgroundAlpha: 0,
          antialias: true,
        });

        const application = app as {
          stage: { addChild: (c: unknown) => void };
          view: HTMLCanvasElement;
          renderer: { resize: (w: number, h: number) => void };
        };
        const stage = application.stage;

        const resize = () => {
          const r = container.getBoundingClientRect();
          application.renderer.resize(r.width, r.height);
        };
        ro = new ResizeObserver(resize);
        ro.observe(container);

        model = await Live2DModel.from(modelPath, {
          autoInteract: true,
        });

        const live2dModel = model as {
          x: number;
          y: number;
          scale: { set: (x: number, y: number) => void };
          anchor: { set: (x: number, y: number) => void };
          motion: (group: string) => void;
          focus: (x: number, y: number) => void;
        };

        stage.addChild(live2dModel);

        const bounds = (live2dModel as unknown as { getBounds: () => { width: number; height: number } }).getBounds?.();
        const w = bounds?.width ?? 1;
        const h = bounds?.height ?? 1;
        const r = container.getBoundingClientRect();
        const scale = Math.min((r.width * 0.5) / w, (r.height * 0.85) / h);
        live2dModel.scale.set(scale, scale);
        live2dModel.anchor.set(0.5, 1);
        live2dModel.x = r.width / 2;
        live2dModel.y = r.height;

        if (motionGroup) {
          try {
            live2dModel.motion(motionGroup);
          } catch {
            // 部分模型动作组名可能不同
          }
        }

        container.addEventListener("pointermove", (e: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          live2dModel.focus(x, y);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Live2D 加载失败");
      }
    };

    init();

    return () => {
      if (ro) ro.disconnect();
      if (model && typeof (model as { destroy?: () => void }).destroy === "function") {
        (model as { destroy: () => void }).destroy();
      }
      if (app && typeof (app as { destroy: (opts: unknown) => void }).destroy === "function") {
        (app as { destroy: (opts: unknown) => void }).destroy({ removeView: true });
      }
    };
  }, [modelPath, motionGroup]);

  if (error) {
    return (
      <div className={`flex h-full items-center justify-center text-lofi-cream/50 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
      style={{ minHeight: "60vh" }}
    />
  );
}
