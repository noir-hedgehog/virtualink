/**
 * 版本与更新说明（启动页弹窗展示，保留历史）
 */
export const APP_VERSION = "0.2.0";

export type VersionEntry = { version: string; notes: string[] };

/** 历史版本与更新说明（从新到旧） */
export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: "0.2.0",
    notes: [
      "启动页：背景与立绘随选中角色切换，默认选中弥希",
      "人物设定面板：角色信息 / 人物设定双标签，支持多立绘切换",
      "回忆（原剧情）：Galgame 剧情使用角色默认立绘与默认场景背景",
      "侧栏：待办 / 习惯 / 日记 / 日程再次点击可关闭对应面板",
      "圭圭情境语音：番茄钟剩 10 分钟、退出、打开日程、立绘点击随机等",
      "剧情触发修复：初次见面稍后再看后不再重复触发；日记首次打开先显示通话再进入",
    ],
  },
  {
    version: "0.1.0",
    notes: [
      "番茄钟、待办、习惯、日记与角色相伴",
      "情境语音与剧情回看",
      "成就与亲密度（按角色）",
      "Link Start 启动页与初次见面剧情",
    ],
  },
];

/** 当前版本说明（取历史第一条，兼容旧用法） */
export const UPDATE_NOTES: string[] =
  VERSION_HISTORY[0]?.notes ?? [];
