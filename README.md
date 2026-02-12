# ChillMxmk

在线版《Chill with you：Lo-Fi Story》—— 和你一起专注。

- **说明**：本项目受 Steam 游戏《Chill with you : Lo-Fi Story》（Nestopi Inc.）启发，为同人/学习用途的在线复刻，非官方作品。
- **默认角色**：默认陪伴角色「弥希（Miki）」为同人二创设定，非官方；壁纸、场景、人物均支持替换为自备资源。

## 功能

- **番茄钟**：创作/休息轮次、循环与等级展示
- **待办**：Todo 列表增删改查
- **日记**：按日期的日记书写与保存
- **习惯**：习惯列表与每日打卡
- **场景与角色**：壁纸、场景、角色可切换；默认角色为弥希 miki（立绘/Live2D/人声为占位，可后续替换）
- **设置**：壁纸、场景、角色选择

## 技术栈

- Next.js 15（App Router）、React 19、TypeScript
- Tailwind CSS、Zustand（状态与持久化）
- 数据暂存于浏览器 localStorage，后续可接云端同步

## 开发

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 部署到 GitHub Pages

本项目已配置为**静态导出**（`output: 'export'`），可直接部署到 GitHub Pages。

1. **推送代码到 GitHub**  
   将仓库推送到 GitHub（例如仓库名为 `ChillMxmk`）。

2. **开启 GitHub Pages**  
   - 仓库 **Settings** → **Pages**  
   - **Build and deployment** → **Source** 选择 **GitHub Actions**  
   - 无需再选具体 workflow，推送后会自动使用仓库内的 workflow。

3. **触发部署**  
   推送或合并到 `main` 分支后，Actions 会执行 `Deploy to GitHub Pages`：  
   - 使用 `BASE_PATH=/<仓库名>` 构建（例如 `ChillMxmk` 则访问路径为 `https://<用户名>.github.io/ChillMxmk/`）  
   - 将构建产物 `out` 部署到 GitHub Pages  

4. **本地先验证构建**（可选）  
   ```bash
   npm run build
   ```
   成功后在项目根目录会生成 `out` 目录，即为将要部署的静态文件。

**说明**：若使用 **用户/组织站**（`https://<用户名>.github.io/`）而不是项目站，需在 workflow 中把 `BASE_PATH` 改为空或删除 `basePath`/`assetPrefix` 相关配置后再部署。

## 布局与交互

- **顶部**：左侧日期时间（如 2026/02/10(周二) 10:33 下午），右侧圆形番茄钟（循环/创作·休息/等级、播放控制）。
- **右侧栏**：待办、习惯、日记、日程、隐藏、设置、退出 — 前五项点击后以**弹窗**形式打开，不跳转页面。
- **主区域**：场景 + 默认角色弥希立绘（带呼吸动画）；左下角为壁纸/音乐等快捷入口。

## 目录结构（资源扩展）

- `public/wallpapers/` — 壁纸图片（默认使用 `default-scene.svg` 日落窗景占位，可替换为网络或本地图）
- `public/characters/miki/` — 弥希立绘等资源
- `public/characters/hiyori/live2D/` — Hiyori Live2D 模型（Cubism 4，含 Idle 等动作）；在设置/人物设定中可选「Hiyori」角色以使用 Live2D 展示（视线跟随鼠标、待机动作）
- Live2D 依赖 **Cubism Core**：运行时从 CDN 加载 `live2dcubismcore.min.js`；生产环境建议从 [Live2D SDK for Web](https://www.live2d.com/download/cubism-sdk/download-web/) 下载并放到 `public` 后修改 `Live2DViewer.tsx` 中的 `CUBISM_CORE_URL`
- `src/config/characters/<id>/config.json` — 角色配置（名称、立绘路径、`live2d.modelPath`、台词 key 等）

## 后续规划

- Phase 2：Live2D、人声/情境台词、音乐与环境音
- Phase 3：账号、跨端进度同步、Docker 部署
- Phase 4：剧情扩展、插件契约与示例插件

## License

MIT
