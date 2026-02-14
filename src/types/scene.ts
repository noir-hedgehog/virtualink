/**
 * 场景配置类型：静态图、动态视频背景
 */

/** 静态场景：单张背景图 */
export type SceneStatic = {
  type: "static";
  id: string;
  name: string;
  /** 背景图 URL */
  background: string;
};

/** 动态视频场景：循环播放全屏背景视频 */
export type SceneVideo = {
  type: "video";
  id: string;
  name: string;
  /** 循环播放的视频 URL（建议 webm/mp4） */
  videoUrl: string;
  /** 视频加载失败时的占位图（可选） */
  fallbackImage?: string;
};

export type SceneConfig = SceneStatic | SceneVideo;

export function isSceneStatic(s: SceneConfig): s is SceneStatic {
  return s.type === "static";
}

export function isSceneVideo(s: SceneConfig): s is SceneVideo {
  return s.type === "video";
}
