/**
 * 场景列表：静态背景、动态视频背景
 * 资源放在 public/wallpapers/，动态资源可放在 public/wallpapers/scenes/
 */
import type { SceneConfig } from "@/types/scene";

export const defaultScenes: SceneConfig[] = [
  { type: "static", id: "default", name: "默认", background: "/wallpapers/default-scene.svg" },
  { type: "static", id: "miki", name: "弥希", background: "/wallpapers/miki.png" },
  { type: "static", id: "chill", name: "Chill", background: "/wallpapers/chill.png" },
  { type: "static", id: "hazel", name: "圭圭", background: "/wallpapers/hazel.jpg" },
  {
    type: "video",
    id: "rain",
    name: "雨声",
    videoUrl: "/wallpapers/scenes/rain-loop.webm",
    fallbackImage: "/wallpapers/default-scene.svg",
  },
];

export const defaultSceneId = "default";
