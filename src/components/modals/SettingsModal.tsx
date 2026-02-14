"use client";

import { Modal } from "@/components/ui/Modal";
import { listCharacters } from "@/config/characters";
import type { DevLogEntry } from "@/stores/devLogStore";
import { useDevLogStore } from "@/stores/devLogStore";
import { useModalStore } from "@/stores/modalStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useEffect, useState } from "react";

/** 清空历史数据时移除的所有持久化 key（待办、日记、习惯、番茄钟、场景、小部件、播放器、成就、剧情、亲密度、日志） */
const DEV_STORAGE_KEYS = [
  "chillmxmk-todo",
  "chillmxmk-diary",
  "chillmxmk-habits",
  "chillmxmk-pomodoro",
  "chillmxmk-scene",
  "chillmxmk-widgets",
  "chillmxmk-player",
  "chillmxmk-achievements",
  "chillmxmk-story",
  "chillmxmk-intimacy",
  "chillmxmk-devlog",
  "chillmxmk-launch",
];

function formatLogTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatLogEntry(e: DevLogEntry): string {
  const time = formatLogTime(e.timestamp);
  switch (e.type) {
    case "story_unlock":
      return `[剧情解锁] ${e.characterId} · ${e.storyId} · ${time}`;
    case "achievement_unlock":
      return `[成就触发] ${e.characterId} · ${e.achievementId} · ${time}`;
    case "intimacy_change":
      return `[亲密度] ${e.characterId} +${e.amount} → ${e.pointsAfter} · ${time}`;
    default:
      return `${time}`;
  }
}

function DeveloperToolsTab() {
  const entries = useDevLogStore((s) => s.entries);
  const clearLogs = useDevLogStore((s) => s.clearLogs);
  const [confirmClear, setConfirmClear] = useState(false);

  const logsNewestFirst = [...entries].reverse();

  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    DEV_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    clearLogs();
    setConfirmClear(false);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lofi-cream font-medium text-sm">开发者工具</h3>

      <div>
        <p className="text-lofi-cream/70 text-sm mb-2">查询日志（剧情解锁、成就触发、亲密度变化，最近 {entries.length} 条）</p>
        <div className="rounded-lg border border-lofi-brown/30 bg-lofi-dark/60 max-h-64 overflow-auto p-3 font-mono text-xs text-lofi-cream/90">
          {logsNewestFirst.length === 0 ? (
            <p className="text-lofi-cream/50">暂无记录</p>
          ) : (
            <ul className="space-y-1.5">
              {logsNewestFirst.map((e, i) => (
                <li key={`${e.timestamp}-${i}`} className="break-all">
                  {formatLogEntry(e)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <p className="text-lofi-cream/70 text-sm mb-2">清空历史数据（含启动页进度、待办、日记、习惯、番茄钟、场景/小部件/播放器、成就、剧情、亲密度及上述日志，清空后刷新将回到启动页）</p>
        <button
          type="button"
          onClick={handleClearHistory}
          className={`rounded-lg px-4 py-2 text-sm ${
            confirmClear
              ? "bg-red-500/80 text-white hover:bg-red-500"
              : "border border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
          }`}
        >
          {confirmClear ? "确认清空并刷新" : "清空历史数据"}
        </button>
        {confirmClear && (
          <button
            type="button"
            onClick={() => setConfirmClear(false)}
            className="ml-2 rounded-lg border border-lofi-brown/40 px-4 py-2 text-sm text-lofi-cream/80 hover:bg-lofi-brown/20"
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
}

const TABS = [
  { id: "general", label: "通用" },
  { id: "wallpaper", label: "壁纸" },
  { id: "scene", label: "场景" },
  { id: "character", label: "角色" },
  { id: "developer", label: "开发者工具" },
] as const;

export function SettingsModal() {
  const settingsTab = useModalStore((s) => s.settingsTab);
  const [tab, setTab] = useState<typeof TABS[number]["id"]>(settingsTab);
  const {
    wallpapers,
    scenes,
    currentWallpaperId,
    currentSceneId,
    currentCharacterId,
    setWallpaper,
    setScene,
    setCharacter,
  } = useSceneStore();
  const characters = listCharacters();

  useEffect(() => {
    setTab(settingsTab);
  }, [settingsTab]);

  return (
    <Modal id="settings" title="设置" className="max-w-2xl">
      <div className="flex flex-1 min-h-0">
        <nav className="flex w-32 shrink-0 flex-col gap-0.5 border-r border-lofi-brown/30 p-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-left text-sm ${
                tab === t.id
                  ? "bg-lofi-accent/30 text-lofi-cream"
                  : "text-lofi-cream/70 hover:bg-lofi-brown/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="flex-1 overflow-auto p-4">
          {tab === "general" && (
            <p className="text-lofi-cream/70 text-sm">番茄钟时长等可在主界面番茄钟处后续扩展。</p>
          )}
          {tab === "wallpaper" && (
            <div className="space-y-3">
              <h3 className="text-lofi-cream font-medium text-sm">选择壁纸</h3>
              <div className="flex flex-wrap gap-2">
                {wallpapers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWallpaper(w.id)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      currentWallpaperId === w.id
                        ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                        : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === "scene" && (
            <div className="space-y-3">
              <h3 className="text-lofi-cream font-medium text-sm">选择场景</h3>
              <div className="flex flex-wrap gap-2">
                {scenes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScene(s.id)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      currentSceneId === s.id
                        ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                        : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === "character" && (
            <div className="space-y-3">
              <h3 className="text-lofi-cream font-medium text-sm">选择角色</h3>
              <div className="flex flex-wrap gap-2">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCharacter(c.id)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      currentCharacterId === c.id
                        ? "border-lofi-accent bg-lofi-accent/20 text-lofi-cream"
                        : "border-lofi-brown/40 text-lofi-cream/80 hover:border-lofi-brown/60"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === "developer" && (
            <DeveloperToolsTab />
          )}
        </div>
      </div>
    </Modal>
  );
}
