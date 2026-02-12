"use client";

import { useDiaryStore } from "@/stores/diaryStore";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DiaryPage() {
  const router = useRouter();
  const { entries, getByDate, upsert } = useDiaryStore();
  const [date, setDate] = useState(todayStr());
  const [content, setContent] = useState("");
  const entry = getByDate(date);

  useEffect(() => {
    const e = getByDate(date);
    setContent(e?.content ?? "");
  }, [date, getByDate]);

  const handleSave = () => {
    upsert(date, content);
  };

  return (
    <div className="flex h-screen flex-col bg-lofi-dark/95">
      <header className="flex shrink-0 items-center gap-4 border-b border-lofi-brown/30 px-6 py-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="p-2 text-lofi-cream/80 hover:text-lofi-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-medium text-lofi-cream">日记</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-lofi-brown/40 bg-lofi-dark/80 px-3 py-1.5 text-lofi-cream"
        />
        <button
          type="button"
          onClick={handleSave}
          className="ml-auto rounded-lg bg-lofi-accent/40 px-4 py-2 text-lofi-cream hover:bg-lofi-accent/60"
        >
          保存
        </button>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          placeholder="写点什么..."
          className="min-h-[300px] w-full resize-y rounded-lg border border-lofi-brown/40 bg-lofi-dark/80 p-4 text-lofi-cream placeholder:text-lofi-cream/40"
          rows={12}
        />
      </div>
    </div>
  );
}
