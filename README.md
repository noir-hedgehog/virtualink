# VirtuaLink 真实连结：与你相伴的日常
这是一个能陪伴你日常学习和工作的小应用；
也是在线版的《Chill with you：Lo-Fi Story》（其实我本来是想给游戏做Mod来着，结果发现它没开创意工坊，并且开发者也不打算开；
所以我只能自己手搓一个。
当然还有夹带私货的想要复活弥希Miki（x

体验地址：https://noir-hedgehog.github.io/virtualink/ 

## 制作说明
相比于原作游戏，支持网页打开，省掉在工作等场合需要下载 Steam 的困扰；
网页更适合跨端，未来也会支持更多联网能力和数据同步能力；
默认陪伴角色「弥希（Miki）」为同人二创设定；另可选「圭圭（Hazel）」等角色，壁纸、场景、人物均支持替换为自备资源。
可以私有化部署，也可以直接用 Github Page 打开（数据存在 Local Storage，完全本地）。
人物设定面板含「角色信息」与「人物设定」两个标签，后者在配置多立绘时可切换立绘。
在设置/人物设定中可选「Hiyori」角色以使用 Live2D 展示（视线跟随鼠标、待机动作）。
- Live2D 依赖 **Cubism Core**：运行时从 CDN 加载 `live2dcubismcore.min.js`；
- `src/config/characters/<id>/config.json` — 角色配置（名称、立绘路径、`live2d.modelPath`、台词 key 等）

## 功能

- **番茄钟**：创作/休息轮次、循环与等级展示；剩余 10 分钟时可触发情境语音（圭圭等）
- **待办**：Todo 列表增删改查
- **日记**：按日期的日记书写与保存；首次打开可触发剧情与情境语音
- **习惯**：习惯列表与每日打卡
- **场景与角色**：壁纸、场景、角色可切换；人物设定内可切换多立绘（若角色配置了多立绘）
- **回忆**：已解锁剧情回看（原「剧情」面板）；Galgame 剧情使用角色默认立绘与默认场景背景
- **启动页**：选择角色后背景与立绘同步切换，默认选中弥希
- **侧栏**：待办 / 习惯 / 日记 / 日程按钮再次点击可关闭对应浮层
- **设置**：壁纸、场景、角色选择

## 技术栈

- Next.js 15（App Router）、React 19、TypeScript
- Tailwind CSS、Zustand（状态与持久化）
- 数据暂存于浏览器 localStorage，后续可接云端同步

## 文档

- [剧情与成就系统规划](docs/STORY_AND_ACHIEVEMENTS.md) — 剧情形态、触发方式、成就与亲密度设计
- [定制指南](docs/CUSTOMIZATION.md) — 如何定制场景（壁纸/叠加）、角色、剧情、成就

## 独立部署

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。


## License

MIT