# VirtuaLink

在线版的《Chill with you：Lo-Fi Story》，本来是想给游戏做Mod来着，结果发现它没开创意工坊；
另外就是我有跨端显示和同步数据的需求，所以需要一个在线版；
当然还有夹带私货的想要复活弥希Miki（x

体验地址：https://noir-hedgehog.github.io/virtualink/ 

## 说明
默认陪伴角色「弥希（Miki）」为同人二创设定；壁纸、场景、人物均支持替换为自备资源。
在设置/人物设定中可选「Hiyori」角色以使用 Live2D 展示（视线跟随鼠标、待机动作）
- Live2D 依赖 **Cubism Core**：运行时从 CDN 加载 `live2dcubismcore.min.js`；
- `src/config/characters/<id>/config.json` — 角色配置（名称、立绘路径、`live2d.modelPath`、台词 key 等）

## 功能

- **番茄钟**：创作/休息轮次、循环与等级展示
- **待办**：Todo 列表增删改查
- **日记**：按日期的日记书写与保存
- **习惯**：习惯列表与每日打卡
- **场景与角色**：壁纸、场景、角色可切换；
- **设置**：壁纸、场景、角色选择

## 技术栈

- Next.js 15（App Router）、React 19、TypeScript
- Tailwind CSS、Zustand（状态与持久化）
- 数据暂存于浏览器 localStorage，后续可接云端同步

## 独立部署

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。


## License

MIT
