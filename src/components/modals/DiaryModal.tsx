"use client";

import { triggerAchievementsAndIntimacy } from "@/lib/storyTrigger";
import { usePlayVoice } from "@/lib/voice";
import { useDiaryStore } from "@/stores/diaryStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";
import { useVoiceTriggerStore } from "@/stores/voiceTriggerStore";
import { useState, useEffect } from "react";

const STORY_HEARTMEM_ID = "story_heartmem";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function DiaryContent() {
  const { getByDate, upsert } = useDiaryStore();
  const [date, setDate] = useState(todayStr());
  const [content, setContent] = useState("");
  const playVoice = usePlayVoice();
  const currentCharacterId = useSceneStore((s) => s.currentCharacterId);
  const diaryFirstOpenPlayed = useVoiceTriggerStore((s) => s.diaryFirstOpenPlayed);
  const setDiaryFirstOpenPlayed = useVoiceTriggerStore((s) => s.setDiaryFirstOpenPlayed);

  useEffect(() => {
    const e = getByDate(date);
    setContent(e?.content ?? "");
  }, [date, getByDate]);

  useEffect(() => {
    if (diaryFirstOpenPlayed) return;
    setDiaryFirstOpenPlayed(true);
    if (currentCharacterId === "hazel") {
      useStoryStore.getState().unlock("hazel", STORY_HEARTMEM_ID);
      useStoryStore.getState().setIncomingStory({ characterId: "hazel", storyId: STORY_HEARTMEM_ID });
    } else {
      playVoice("diary_first_open");
    }
  }, [diaryFirstOpenPlayed, currentCharacterId, playVoice, setDiaryFirstOpenPlayed]);

  const handleSave = () => {
    upsert(date, content);
    triggerAchievementsAndIntimacy(5);
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
