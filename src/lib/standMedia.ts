/**
 * 立绘资源类型：支持图片（PNG/JPG）、动图（GIF/AVIF）、视频（WebM/MP4/MOV）、Live2D
 */
const VIDEO_EXT = [".webm", ".mp4", ".mov"];

export function isStandVideo(url: string): boolean {
  const lower = url.toLowerCase();
  return VIDEO_EXT.some((ext) => lower.endsWith(ext));
}

export type StandDynamicFormat = "webm" | "gif" | "avif";

/** 当动态立绘显示黑底时，可切换为 gif/avif 用 img 渲染；返回替换扩展名后的 URL */
export function getStandUrlForFormat(standUrl: string, format: StandDynamicFormat): string {
  if (format === "webm") return standUrl;
  const lastDot = standUrl.lastIndexOf(".");
  const base = lastDot >= 0 ? standUrl.slice(0, lastDot) : standUrl;
  const ext = format === "gif" ? ".gif" : ".avif";
  return base + ext;
}
