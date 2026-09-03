import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The original project was a GitHub Pages export.  VirtuaLink now also has
  // authenticated API routes and a PostgreSQL-backed sync service, so it must
  // run as a Node server when self-hosted.
  output: "standalone",
  images: { unoptimized: true },
  // 部署到 GitHub Pages 项目站时启用（如 https://username.github.io/ChillMxmk/）
  ...(process.env.NODE_ENV === "production" && process.env.BASE_PATH
    ? {
        basePath: process.env.BASE_PATH,
        assetPrefix: process.env.BASE_PATH.endsWith("/") ? process.env.BASE_PATH : `${process.env.BASE_PATH}/`,
      }
    : {}),
};

export default nextConfig;
