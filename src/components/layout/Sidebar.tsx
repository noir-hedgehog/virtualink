"use client";

import { useClockTick } from "@/stores/uiStore";
import {
  ListTodo,
  CheckSquare,
  BookOpen,
  Calendar,
  Eye,
  Settings,
  Phone,
} from "lucide-react";
import { useExitTransitionStore } from "@/stores/exitTransitionStore";
import { useModalStore } from "@/stores/modalStore";
import { useWidgetStore } from "@/stores/widgetStore";
import type { WidgetId } from "@/stores/widgetStore";
import { cn } from "@/lib/utils";

const widgetIds: WidgetId[] = ["todo", "habits", "diary", "calendar"];

const items = [
  { id: "todo" as const, icon: ListTodo, label: "待办", isWidget: true },
  { id: "habits" as const, icon: CheckSquare, label: "习惯", isWidget: true },
  { id: "diary" as const, icon: BookOpen, label: "日记", isWidget: true },
  { id: "calendar" as const, icon: Calendar, label: "日程", isWidget: true },
  { id: "hide" as const, icon: Eye, label: "隐藏", isWidget: false },
  { id: "settings" as const, icon: Settings, label: "设置", isWidget: false },
  { id: "exit" as const, icon: Phone, label: "退出", isWidget: false },
];

export function Sidebar() {
  useClockTick(1000);
  const openModal = useModalStore((s) => s.openModal);
  const open = useModalStore((s) => s.open);
  const openWidget = useWidgetStore((s) => s.openWidget);
  const widgets = useWidgetStore((s) => s.widgets);

  const isWidgetVisible = (id: string) =>
    widgetIds.includes(id as WidgetId) && widgets[id as WidgetId]?.visible;

  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-lofi-brown/30 bg-lofi-dark/80 py-4">
      {items.map(({ id, icon: Icon, label, isWidget }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            if (id === "hide") return;
            if (id === "exit") {
              useExitTransitionStore.getState().startExit();
              return;
            }
            if (isWidget) openWidget(id as WidgetId);
            else open(id);
          }}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            (isWidget ? isWidgetVisible(id) : openModal === id)
              ? "bg-lofi-accent/30 text-lofi-accent"
              : "text-lofi-cream/70 hover:bg-lofi-brown/20 hover:text-lofi-cream"
          )}
          title={label}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </aside>
  );
}
