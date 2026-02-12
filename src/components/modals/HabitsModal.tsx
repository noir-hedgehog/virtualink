"use client";

import { useHabitsStore } from "@/stores/habitsStore";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function HabitsContent() {
  const { habits, addHabit, removeHabit, toggleCheck, isChecked } = useHabitsStore();
  const [newName, setNewName] = useState("");
  const today = todayStr();

  const handleAdd = () => {
    const n = newName.trim();
    if (n) {
      addHabit(n);
      setNewName("");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="新习惯名称..."
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
        <p className="text-sm text-lofi-cream/60">今日 ({today}) 打卡</p>
        <ul className="space-y-2 overflow-auto">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center gap-3 rounded-lg border border-lofi-brown/20 bg-lofi-dark/60 px-4 py-3"
            >
              <button
                type="button"
                onClick={() => toggleCheck(habit.id, today)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  borderColor: habit.color,
                  backgroundColor: isChecked(habit.id, today) ? habit.color : "transparent",
                }}
              >
                {isChecked(habit.id, today) && (
                  <span className="text-xs text-white">✓</span>
                )}
              </button>
              <span className="flex-1 text-lofi-cream">{habit.name}</span>
              <button
                type="button"
                onClick={() => removeHabit(habit.id)}
                className="p-1 text-lofi-cream/50 hover:text-red-400 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        {habits.length === 0 && (
          <p className="py-8 text-center text-lofi-cream/50 text-sm">
            暂无习惯，添加一个开始打卡吧
          </p>
        )}
    </div>
  );
}
