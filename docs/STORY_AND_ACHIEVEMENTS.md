# 剧情与成就系统规划

## 一、剧情内容形态

### 1.1 两种内容类型

| 类型 | 说明 | 数据结构 |
|------|------|----------|
| **video** | 全屏/弹窗播放 MP4 视频 | `type: "video"`, `url: string`, 可选 `title` |
| **galgame** | 场景 + 立绘 + 对话（多段） | `type: "galgame"`, `scenes: Array<{ background?, character?, position?, lines: string[] }>` |

- **video**：一条剧情 = 一个视频文件，播完即结束，可带标题。
- **galgame**：一条剧情 = 多「镜」（scene），每镜可配置背景图、立绘、立绘位置、多句对话；用户点击/按键推进，最后一镜结束后剧情结束。

### 1.2 剧情配置示例（代码内或 JSON）

```ts
// 视频型
{ id: "story_intro", type: "video", title: "开场", url: "/story/intro.mp4", trigger: {...} }

// Galgame 型
{ id: "story_first_todo", type: "galgame", title: "第一次待办", trigger: {...}, scenes: [
  { background: "/story/bg_room.png", character: "miki", position: "left", lines: ["你添加了第一条待办呢。", "以后一起把任务都勾掉吧。"] },
  { character: "miki", position: "center", lines: ["……"] }
]}
```

---

## 二、触发方式

### 2.1 成就式触发（与成就系统联动）

- **思路**：成就系统维护「成就项」与完成条件；剧情配置引用「成就 id」作为触发条件，成就首次达成时触发对应剧情。
- **成就项示例**：
  - `first_todo`：首次添加一条待办
  - `pomodoro_5`：累计完成 5 个番茄钟（以「工作阶段完成」计 1 次）
  - `habit_first_check`：首次习惯打卡
  - `diary_first`：首次写日记
- **流程**：用户操作 → 更新各业务 store（todo / pomodoro / habits / diary）→ **成就检查器**读取当前状态，若某成就从「未完成」变为「完成」→ 解锁成就 + 若该成就绑定剧情则 **触发剧情**（弹窗/全屏播放）。
- **数据**：成就列表（id, name, description, condition）；剧情列表（id, type, content, **trigger: { type: "achievement", achievementId: string }**）。

### 2.2 随机触发（基于亲密度）

- **亲密度**：隐性数值，不对外展示。随用户行为增加（如完成待办 +2、完成番茄 +3、写日记 +5 等），可设上限。
- **随机触发**：在合适时机（如进入主界面、完成一个番茄、关闭弹窗回到主界面等）做一次「随机判定」：按当前亲密度等级（如 0–100 为 Lv1，100–300 为 Lv2）与配置的剧情池（如 `random_story_lv1`）随机选一条**未解锁**剧情，按概率或权重触发；触发后解锁并播放。
- **数据**：剧情配置中 `trigger: { type: "random", intimacyLevel: number, weight?: number }`；亲密度存在单独 store，仅内部使用。

### 2.3 触发后的行为

- **播放**：根据剧情类型打开「视频播放器」或「Galgame 对话播放器」。
- **解锁**：将该剧情 id 写入「已解锁剧情」列表（持久化），并在「剧情」功能里标记为可再次观看。
- **再次观看**：剧情列表里已解锁项可点击，再次播放（不重复触发成就/随机逻辑）。

---

## 三、成就系统规划（与剧情联动）

### 3.1 成就数据结构

- `id`: 唯一
- `name` / `description`: 展示用
- `condition`: 判定逻辑（可枚举或函数引用），例如：
  - `{ type: "first_todo" }`
  - `{ type: "pomodoro_count", count: 5 }`
  - `{ type: "habit_check_once" }`
  - `{ type: "diary_first" }`
- 成就 store：已解锁成就 id 列表（持久化）；提供 `checkAndUnlock()`，在适当时机调用并返回本次新解锁的成就，用于触发剧情。

### 3.2 剧情与成就的绑定

- 剧情配置中 `trigger: { type: "achievement", achievementId: "first_todo" }`。
- 成就检查器发现 `first_todo` 新解锁时，查剧情表，找到 `trigger.achievementId === "first_todo"` 的剧情，触发播放并解锁剧情。

### 3.3 成就展示（成就弹窗/页面）

- 列表展示所有成就项；已解锁显示名称、描述、解锁时间（可选）；未解锁显示占位（如「？？？」或统一 placeholder）。
- 与剧情类似：未解锁不展示详情，仅占位。

---

## 四、亲密度（隐性）与随机剧情

### 4.1 亲密度

- 单一日志/数值，不展示给用户。
- 规则示例：添加待办 +2、完成待办 +1、完成一个番茄（工作阶段结束）+3、习惯打卡 +2、写日记 +5；可设日上限或总上限。
- Store：`intimacy: number`（持久化），提供 `addPoints(amount)`；可选 `level: 1..n` 由数值区间推导，供随机剧情使用。

### 4.2 随机剧情配置

- 剧情 `trigger: { type: "random", minIntimacyLevel: number, weight?: number }`。
- 随机判定时机：例如每次从弹窗回到主界面、或每完成一个番茄后，调用 `tryTriggerRandomStory()`：按当前亲密度等级过滤出可选的未解锁随机剧情，按权重随机一条并触发。

---

## 五、剧情功能入口（剧情列表 + 回放）

### 5.1 剧情列表（现有「剧情」弹窗增强）

- 列表来源：所有剧情配置（静态或从配置中心读取）。
- 每条展示：标题（或占位「未解锁」）、缩略图/占位图、是否已解锁。
- **已解锁**：可点击 → 进入播放（视频或 Galgame），仅回放，不再改成就/亲密度。
- **未解锁**：显示为灰色/锁的 placeholder，不可播放。

### 5.2 播放器

- **视频型**：全屏或大弹窗，`<video>` 播放 MP4，支持暂停/进度条/关闭；播完自动关闭并记录「已观看」可选。
- **Galgame 型**：全屏或大弹窗，背景 + 立绘 + 对话框，点击/按键下一句，镜内多句逐句，镜与镜之间可切换背景/立绘；全部结束后关闭。

---

## 六、数据流与实现顺序建议

1. **类型与配置**  
   定义剧情类型（video / galgame）、成就类型、trigger 类型；写 1～2 条示例剧情配置与成就配置。

2. **成就 Store + 检查器**  
   成就解锁列表持久化；实现 `checkAndUnlock()`，在 todo add、pomodoro 完成、习惯打卡、日记保存等处调用；成就解锁时发出事件或返回新解锁 id。

3. **亲密度 Store**  
   数值持久化；在待办/番茄/习惯/日记等操作后调用 `addPoints`；实现按区间算 level（可选）。

4. **剧情 Store**  
   已解锁剧情 id 列表持久化；`unlock(id)`、`isUnlocked(id)`；提供「根据成就 id 查剧情」与「随机剧情判定」的接口。

5. **触发串联**  
   成就检查后若新解锁成就，查剧情表，若存在绑定剧情则 `storyStore.unlock` + 打开播放器；随机判定在选定时机调用，未解锁则按权重选一条并 unlock + 打开播放器。

6. **剧情列表 UI**  
   在剧情弹窗中列出所有剧情，已解锁可点播，未解锁显示 placeholder。

7. **视频播放器**  
   全屏/弹窗播放 MP4，播完关闭。

8. **Galgame 播放器**  
   场景 + 立绘 + 对话，按句推进，结束关闭。

9. **随机触发时机**  
   在主界面 mount、番茄完成、关闭弹窗等时机调用 `tryTriggerRandomStory()`。

---

## 七、文件与模块划分建议

| 模块 | 说明 |
|------|------|
| `src/types/story.ts` | 剧情、trigger、galgame scene 类型 |
| `src/types/achievement.ts` | 成就、condition 类型 |
| `src/config/stories.ts` | 剧情配置列表（或从 JSON 读） |
| `src/config/achievements.ts` | 成就配置列表 |
| `src/stores/achievementStore.ts` | 已解锁成就、checkAndUnlock |
| `src/stores/intimacyStore.ts` | 亲密度数值、addPoints、level |
| `src/stores/storyStore.ts` | 已解锁剧情、unlock、触发入口 |
| `src/lib/achievementChecker.ts` | 根据业务 store 状态判断成就是否达成 |
| `src/lib/storyTrigger.ts` | 成就→剧情、随机→剧情的封装 |
| `src/components/story/StoryListView.tsx` | 剧情弹窗内列表（已解锁/未解锁） |
| `src/components/story/VideoPlayer.tsx` | 视频剧情播放器 |
| `src/components/story/GalgamePlayer.tsx` | Galgame 剧情播放器 |

以上为剧情与成就的完整规划，可按节实现并迭代。
