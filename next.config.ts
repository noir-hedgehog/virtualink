import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
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
