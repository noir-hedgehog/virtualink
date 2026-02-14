import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useDevLogStore } from "./devLogStore";

export type WidgetId = "todo" | "habits" | "diary" | "calendar";

export type WidgetState = {
  visible: boolean;
  x: number;
  y: number;
  locked: boolean;
};

const DEFAULT_POSITIONS: Record<WidgetId, { x: number; y: number }> = {
  todo: { x: 120, y: 100 },
  habits: { x: 120, y: 320 },
  diary: { x: 120, y: 540 },
  calendar: { x: 520, y: 100 },
};

type WidgetsState = {
  widgets: Record<WidgetId, WidgetState>;
  openWidget: (id: WidgetId) => void;
  closeWidget: (id: WidgetId) => void;
  setWidgetPosition: (id: WidgetId, x: number, y: number) => void;
  setWidgetLocked: (id: WidgetId, locked: boolean) => void;
};

const initialWidgets: Record<WidgetId, WidgetState> = {
  todo: { visible: false, ...DEFAULT_POSITIONS.todo, locked: false },
  habits: { visible: false, ...DEFAULT_POSITIONS.habits, locked: false },
  diary: { visible: false, ...DEFAULT_POSITIONS.diary, locked: false },
  calendar: { visible: false, ...DEFAULT_POSITIONS.calendar, locked: false },
};

export const useWidgetStore = create<WidgetsState>()(
  persist(
    (set) => ({
      widgets: initialWidgets,
      openWidget: (id) =>
        set((state) => ({
          widgets: {
            ...state.widgets,
            [id]: { ...state.widgets[id], visible: true },
          },
        })),
      closeWidget: (id) =>
        set((state) => ({
          widgets: {
            ...state.widgets,
            [id]: { ...state.widgets[id], visible: false },
          },
        })),
      setWidgetPosition: (id, x, y) =>
        set((state) => {
          useDevLogStore.getState().addLog({
            type: "widget_position",
            widgetId: id,
            x,
            y,
            timestamp: Date.now(),
          });
          return {
            widgets: {
              ...state.widgets,
              [id]: { ...state.widgets[id], x, y },
            },
          };
        }),
      setWidgetLocked: (id, locked) =>
        set((state) => ({
          widgets: {
            ...state.widgets,
            [id]: { ...state.widgets[id], locked },
          },
        })),
    }),
    {
      name: "chillmxmk-widgets",
      partialize: (state) => ({
        widgets: state.widgets,
      }),
      merge: (persisted, current) => {
        const p = persisted as { widgets?: Record<WidgetId, WidgetState> } | undefined;
        if (!p?.widgets) return current;
        const merged = { ...current.widgets };
        (Object.keys(p.widgets) as WidgetId[]).forEach((id) => {
          const prev = p.widgets![id];
          if (prev && current.widgets[id]) {
            merged[id] = {
              ...current.widgets[id],
              x: Number(prev.x) ?? current.widgets[id].x,
              y: Number(prev.y) ?? current.widgets[id].y,
              locked: Boolean(prev.locked),
              visible: current.widgets[id].visible,
            };
          }
        });
        return { ...current, widgets: merged };
      },
    }
  )
);
