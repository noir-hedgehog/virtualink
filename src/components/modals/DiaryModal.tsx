"use client";

import { useDiaryStore } from "@/stores/diaryStore";
import { useState, useEffect } from "react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function DiaryContent() {
  const { getByDate, upsert } = useDiaryStore();
  const [date, setDate] = useState(todayStr());
  const [content, setContent] = useState("");

  useEffect(() => {
    const e = getByDate(date);
    setContent(e?.content ?? "");
  }, [date, getByDate]);

  const handleSave = () => {
    upsert(date, content);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-lofi-brown/40 bg-lofi-dark/80 px-3 py-2 text-lofi-cream"
          />
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-lofi-accent/40 px-4 py-2 text-lofi-cream hover:bg-lofi-accent/60"
          >
            保存
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          placeholder="写点什么..."
          className="min-h-[280px] w-full resize-y rounded-lg border border-lofi-brown/40 bg-lofi-dark/80 p-4 text-lofi-cream placeholder:text-lofi-cream/40"
          rows={10}
        />
    </div>
  );
}
