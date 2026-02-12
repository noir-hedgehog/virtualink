import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TodoItem = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

type TodoState = {
  items: TodoItem[];
  add: (title: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
};

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      items: [],
      add: (title) =>
        set((s) => ({
          items: [
            ...s.items,
            {
              id: crypto.randomUUID(),
              title,
              done: false,
              createdAt: new Date().toISOString(),
            },
          ].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        })),
      toggle: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, done: !i.done } : i
          ),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateTitle: (id, title) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, title } : i)),
        })),
    }),
    { name: "chillmxmk-todo" }
  )
);
