"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { useVoiceStore } from "@/stores/voiceStore";

export function VoicePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const url = useVoiceStore((s) => s.url);
  const stop = useVoiceStore((s) => s.stop);
  const volume = usePlayerStore((s) => s.volume);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !url) return;
    el.src = url;
    el.volume = Math.max(0, Math.min(1, volume));
    el.play().catch(() => stop());
  }, [url, stop, volume]);

  return (
    <audio
      ref={audioRef}
      onEnded={stop}
      onError={() => stop()}
    />
  );
}
