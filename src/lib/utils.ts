import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 部署在子路径（如 GitHub Pages /virtualink）时，给静态资源路径加上 basePath */
export function getAssetUrl(path: string): string {
  if (!path) return path;
  const base = typeof process.env.NEXT_PUBLIC_BASE_PATH === "string" ? process.env.NEXT_PUBLIC_BASE_PATH : "";
  if (!base) return path;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
