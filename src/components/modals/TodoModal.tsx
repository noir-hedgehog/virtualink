"use client";

import { useTodoStore } from "@/stores/todoStore";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function TodoContent() {
  const { items, add, toggle, remove, updateTitle } = useTodoStore();
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    const t = newTitle.trim();
    if (t) {
      add(t);
      setNewTitle("");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="添加待办..."
            className="flex-1 rounded-lg border border-lofi-brown/40 bg-lofi-dark/80 px-4 py-2 text-lofi-cream placeholder:text-lofi-cream/40"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-lofi-accent/40 px-4 py-2 text-lofi-cream hover:bg-lofi-accent/60 shrink-0"
          >
            <Plus className="h-4 w-4" /> 添加
          </button>
        </div>
        <ul className="space-y-2 overflow-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-lofi-brown/20 bg-lofi-dark/60 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggle(item.id)}
                className="h-4 w-4 rounded border-lofi-brown accent-lofi-accent shrink-0"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateTitle(item.id, e.target.value)}
                className={`flex-1 min-w-0 bg-transparent text-lofi-cream outline-none ${
                  item.done ? "line-through text-lofi-cream/50" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="p-1 text-lofi-cream/50 hover:text-red-400 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="py-8 text-center text-lofi-cream/50 text-sm">暂无待办</p>
        )}
    </div>
  );
}
