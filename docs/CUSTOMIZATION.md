# 定制指南：场景、角色、剧情与成就

本文说明如何在本项目中新增或修改**场景（壁纸/叠加）**、**角色**、**剧情**和**成就**的配置与资源。

---

## 一、场景定制

设置中的**场景**面板包含两项：**背景**（静态图或循环视频）、**声音**（环境音循环）。背景配置在 `src/config/scenes.ts`，类型在 `src/types/scene.ts`；声音配置在 `src/config/ambientSounds.ts`。

### 1.1 背景类型（两种）

| 类型 | 说明 |
|------|------|
| **static** | 静态背景图，单张图片铺满 |
| **video** | 全屏循环播放背景视频（如雨景） |

### 1.2 背景数据结构（SceneConfig）

- **静态** `type: "static"`：`id`、`name`、`background`（图片 URL）。
- **视频** `type: "video"`：`id`、`name`、`videoUrl`（循环视频），可选 `fallbackImage`（加载失败时占位）。

### 1.3 添加新背景

1. **放置资源**：静态图、视频放在 `public/wallpapers/` 或 `public/wallpapers/scenes/`。
2. 在 `src/config/scenes.ts` 的 `defaultScenes` 中追加一项（静态或 video）。
3. 用户在设置 → **场景** → **背景** 中选择即可。

### 1.4 声音（环境音）

- 选项在 `src/config/ambientSounds.ts`（如：无、白噪声、下雨、敲键盘）。
- 音频文件放在 `public/sounds/ambient/`，参见该目录下 README。
- 用户在设置 → **场景** → **声音** 中选择，选中后全局循环播放，持久化在 `chillmxmk-ambient`。

---

## 二、角色定制

角色配置按「每个角色一个目录」组织，并在统一入口注册。

### 2.1 目录与文件

```
src/config/characters/
├── index.ts              # 注册表：所有角色 + 各角色剧情列表
├── miki/
│   ├── config.json       # 角色基础信息与立绘/Live2D/语音
│   └── stories.ts        # 该角色的剧情列表
├── hazel/
│   ├── config.json
│   └── stories.ts
└── 你的角色id/
    ├── config.json
    └── stories.ts
```

### 2.2 角色配置 config.json

`config.json` 对应类型 `CharacterConfig`：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识，与目录名一致，如 `miki`、`hazel` |
| `name` | string | 是 | 展示名称 |
| `intro` | string | 是 | 介绍文案（多行用 `\n`） |
| `age` | string | 否 | 如 `"16岁"` |
| `birthday` | string | 否 | 如 `"8月8日"` |
| `zodiac` | string | 否 | 如 `"狮子座"` |
| `defaultStand` | string | 否 | 主立绘资源路径，见下文 |
| `live2d` | object \| null | 否 | Live2D 模型与动作，见下文 |
| `voice` | object \| null | 否 | 情境语音，如 `pomodoro_pause` → `{ url, text }` |
| `lineKeys` | string[] | 否 | 情境台词 key 列表 |

**立绘 `defaultStand`**（二选一与 Live2D 共存，通常只用其一）：

- **图片**：`.png` / `.jpg` 等，如 `"/characters/miki/miki-test.png"`。
- **动图**：`.gif`、`.avif`，同图片用法。
- **视频**：`.webm`、`.mp4`、`.mov`，如 `"/characters/hazel/stand.webm"`。

资源放在 `public/characters/<角色id>/` 下，路径以 `/characters/...` 开头。

**Live2D**（可选）：

```json
"live2d": {
  "modelPath": "/characters/hiyori/live2D/runtime/hiyori_free_t08.model3.json",
  "motions": {
    "idle": "Idle",
    "tap_body": "Tap@Body",
    "flick": "Flick"
  }
}
```

### 2.3 注册角色

在 `src/config/characters/index.ts` 中：

1. 引入该角色的 `config.json` 与 `stories`：
2. 写入 `registry` 与 `storiesByCharacter`：

```ts
import yourConfig from "./你的角色id/config.json";
import { yourStories } from "./你的角色id/stories";

const registry: Record<string, CharacterConfig> = {
  miki: mikiConfig as CharacterConfig,
  hazel: hazelConfig as CharacterConfig,
  your_id: yourConfig as CharacterConfig,
};

const storiesByCharacter: Record<string, Story[]> = {
  miki: mikiStories,
  hazel: hazelStories,
  your_id: yourStories,
};
```

完成后，设置里会多出一个可选角色，主界面可切换为该角色。

---

## 三、剧情定制

剧情分为 **video**（单视频）和 **galgame**（多镜对话），按角色写在 `src/config/characters/<角色id>/stories.ts` 中。

### 3.1 类型与触发

- **触发方式**（`trigger`）：
  - `{ type: "achievement", achievementId: "成就id" }`：成就首次达成时触发。
  - `{ type: "random", minIntimacyLevel: number, weight?: number }`：按亲密度等级随机触发。
- **剧情类型**：
  - `video`：一条剧情一个视频，播完即结束。
  - `galgame`：多镜（scenes），每镜可配背景、立绘、位置、多句对话。

类型定义见 `src/types/story.ts`。

### 3.2 视频型剧情示例

```ts
{
  id: "story_diary_first",
  type: "video",
  title: "跳跳糖",
  url: "/characters/miki/story/video/跳跳糖.mp4",
  trigger: { type: "achievement", achievementId: "diary_first" },
}
```

- 视频文件放在 `public` 下，`url` 用绝对路径如 `/characters/miki/story/video/xxx.mp4`。

### 3.3 Galgame 型剧情示例

```ts
{
  id: "story_first_todo",
  type: "galgame",
  title: "第一次待办",
  trigger: { type: "achievement", achievementId: "first_todo" },
  scenes: [
    {
      background: "/story/bg_room.png",  // 可选
      character: "miki",
      position: "left",                   // "left" | "center" | "right"
      lines: ["你添加了第一条待办呢。", "以后一起把任务都勾掉吧。"],
    },
    {
      character: "miki",
      position: "center",
      lines: ["……"],
    },
  ],
}
```

- 每镜可单独指定 `background`、`character`、`position`；`lines` 为当前镜的对话数组，点击/按键逐句推进。

### 3.4 与成就的绑定

- 在成就配置（见下一节）中定义 `achievementId`。
- 在剧情里使用 `trigger: { type: "achievement", achievementId: "同一id" }`。
- 成就首次解锁时，会触发对应剧情并解锁该剧情，之后可在「剧情」列表中回放。

---

## 四、成就定制

成就配置在 `src/config/achievements.ts`，条件类型在 `src/types/achievement.ts`。

### 4.1 数据结构

```ts
type Achievement = {
  id: string;
  name: string;
  description: string;
  condition: AchievementCondition;
};
```

### 4.2 条件类型（condition）

| condition.type | 说明 | 示例 |
|----------------|------|------|
| `first_todo` | 首次添加一条待办 | `{ type: "first_todo" }` |
| `pomodoro_count` | 累计完成 N 个番茄钟（工作阶段完成计 1） | `{ type: "pomodoro_count", count: 5 }` |
| `habit_check_once` | 首次习惯打卡 | `{ type: "habit_check_once" }` |
| `diary_first` | 首次写日记 | `{ type: "diary_first" }` |

新增条件类型时，需在 `src/types/achievement.ts` 增加类型定义，并在成就检查逻辑（如 `achievementChecker` / 各 store 的检查调用）中实现判定。

### 4.3 添加新成就

在 `src/config/achievements.ts` 的 `achievements` 数组中追加：

```ts
{
  id: "your_achievement_id",
  name: "展示名称",
  description: "简短描述",
  condition: { type: "pomodoro_count", count: 10 },
}
```

若希望该成就触发剧情，在对应角色的 `stories.ts` 中增加一条剧情，并设置：

```ts
trigger: { type: "achievement", achievementId: "your_achievement_id" }
```

---

## 五、文件与入口速查

| 用途 | 文件/目录 |
|------|------------|
| 场景默认列表与类型 | `src/config/scenes.ts`、`src/types/scene.ts` |
| 场景状态与当前选中 | `src/stores/sceneStore.ts` |
| 环境音选项与当前选中 | `src/config/ambientSounds.ts`、`src/stores/ambientSoundStore.ts` |
| 角色注册与剧情入口 | `src/config/characters/index.ts` |
| 单角色配置 | `src/config/characters/<id>/config.json` |
| 单角色剧情 | `src/config/characters/<id>/stories.ts` |
| 成就列表 | `src/config/achievements.ts` |
| 剧情类型 | `src/types/story.ts` |
| 成就类型与条件 | `src/types/achievement.ts` |
| 剧情与成就整体设计 | `docs/STORY_AND_ACHIEVEMENTS.md` |

角色/剧情/视频等静态资源放在 `public/` 下，路径以 `/` 开头（如 `/wallpapers/xxx.jpg`、`/characters/miki/stand.webm`）。
