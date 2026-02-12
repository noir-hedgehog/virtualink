"use client";

import { useWidgetStore } from "@/stores/widgetStore";
import { WidgetPanel } from "./WidgetPanel";
import { TodoContent } from "@/components/modals/TodoModal";
import { HabitsContent } from "@/components/modals/HabitsModal";
import { DiaryContent } from "@/components/modals/DiaryModal";
import { CalendarContent } from "@/components/modals/CalendarModal";

const WIDGET_CONFIG = [
  { id: "todo" as const, title: "待办", Content: TodoContent },
  { id: "habits" as const, title: "习惯", Content: HabitsContent },
  { id: "diary" as const, title: "日记", Content: DiaryContent },
  { id: "calendar" as const, title: "日程", Content: CalendarContent },
];

export function Widgets() {
  const widgets = useWidgetStore((s) => s.widgets);

  return (
    <>
      {WIDGET_CONFIG.map(({ id, title, Content }) =>
        widgets[id]?.visible ? (
          <WidgetPanel key={id} id={id} title={title}>
            <Content />
          </WidgetPanel>
        ) : null
      )}
    </>
  );
}
