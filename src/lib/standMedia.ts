/**
 * 立绘资源类型：支持图片（PNG/JPG）、动图（GIF/AVIF）、视频（WebM/MP4/MOV）、Live2D
 */
const VIDEO_EXT = [".webm", ".mp4", ".mov"];

export function isStandVideo(url: string): boolean {
  const lower = url.toLowerCase();
  return VIDEO_EXT.some((ext) => lower.endsWith(ext));
}
