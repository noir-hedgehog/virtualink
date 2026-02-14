"use client";

import {
  ListTodo,
  CheckSquare,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  Settings,
  Phone,
} from "lucide-react";
import { getCharacterConfig } from "@/config/characters";
import { getAssetUrl, cn } from "@/lib/utils";
import { usePlayVoice } from "@/lib/voice";
import { useExitTransitionStore } from "@/stores/exitTransitionStore";
import { useModalStore } from "@/stores/modalStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useWidgetStore } from "@/stores/widgetStore";
import type { WidgetId } from "@/stores/widgetStore";

const floatButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-lg bg-lofi-dark/60 text-lofi-cream/80 hover:bg-lofi-brown/30 hover:text-lofi-cream border border-lofi-brown/20 transition-colors";

const widgetIds: WidgetId[] = ["todo", "habits", "diary", "calendar"];

const items: Array<{
  id: "todo" | "habits" | "diary" | "calendar" | "hide" | "settings" | "exit";
  icon: typeof ListTodo;
  iconHidden?: typeof EyeOff;
  label: string;
  labelHidden?: string;
  isWidget: boolean;
}> = [
  { id: "todo", icon: ListTodo, label: "待办", isWidget: true },
  { id: "habits", icon: CheckSquare, label: "习惯", isWidget: true },
  { id: "diary", icon: BookOpen, label: "日记", isWidget: true },
  { id: "calendar", icon: Calendar, label: "日程", isWidget: true },
  { id: "hide", icon: Eye, iconHidden: EyeOff, label: "隐藏立绘", labelHidden: "显示立绘", isWidget: false },
  { id: "settings", icon: Settings, label: "设置", isWidget: false },
  { id: "exit", icon: Phone, label: "退出", isWidget: false },
];

export function FloatingSidebar() {
  const openModal = useModalStore((s) => s.openModal);
  const open = useModalStore((s) => s.open);
  const openWidget = useWidgetStore((s) => s.openWidget);
  const closeWidget = useWidgetStore((s) => s.closeWidget);
  const widgets = useWidgetStore((s) => s.widgets);
  const characterStandVisible = useSceneStore((s) => s.characterStandVisible);
  const setCharacterStandVisible = useSceneStore((s) => s.setCharacterStandVisible);
  const currentCharacterId = useSceneStore((s) => s.currentCharacterId);
  const playVoice = usePlayVoice();

  const isWidgetVisible = (id: string) =>
    widgetIds.includes(id as WidgetId) && widgets[id as WidgetId]?.visible;

  const handleExit = () => {
    const characterId = currentCharacterId ?? useSceneStore.getState().currentCharacterId;
    const config = characterId ? getCharacterConfig(characterId) : null;
    const entry = config?.voice?.exit;
    const url = entry?.url ? getAssetUrl(entry.url) : null;
    if (url) {
      const audio = new Audio(url);
      audio.onended = () => useExitTransitionStore.getState().startExit();
      audio.play().catch(() => useExitTransitionStore.getState().startExit());
    } else {
      useExitTransitionStore.getState().startExit();
    }
  };

  return (
    <div className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-2 rounded-xl border border-lofi-brown/20 bg-lofi-dark/60 p-2 shadow-lg backdrop-blur-sm">
      {items.map(({ id, icon: Icon, iconHidden, label, labelHidden, isWidget }) => {
        const isHide = id === "hide";
        const showHiddenState = isHide && !characterStandVisible;
        const IconToShow = showHiddenState && iconHidden ? iconHidden : Icon;
        const displayLabel = showHiddenState && labelHidden ? labelHidden : label;
        return (
        <button
          key={id}
          type="button"
          onClick={() => {
            if (id === "hide") {
              setCharacterStandVisible(!characterStandVisible);
              return;
            }
            if (id === "exit") {
              handleExit();
              return;
            }
            if (isWidget) {
              const widgetId = id as WidgetId;
              if (isWidgetVisible(id)) {
                closeWidget(widgetId);
              } else {
                if (id === "calendar") playVoice("calendar_open");
                openWidget(widgetId);
              }
            } else {
              open(id);
            }
          }}
          className={cn(
            floatButtonClass,
            (isWidget ? isWidgetVisible(id) : openModal === id) &&
              "bg-lofi-accent/30 text-lofi-accent border-lofi-accent/40",
            isHide && !characterStandVisible && "bg-lofi-accent/30 text-lofi-accent border-lofi-accent/40"
          )}
          title={displayLabel}
        >
          <IconToShow className="h-5 w-5" />
        </button>
      );
      })}
    </div>
  );
}
