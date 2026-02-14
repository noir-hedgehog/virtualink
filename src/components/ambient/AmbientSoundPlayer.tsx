"use client";

import { useEffect, useRef } from "react";
import { useAmbientSoundStore } from "@/stores/ambientSoundStore";
import { ambientSoundOptions, AMBIENT_NONE } from "@/config/ambientSounds";
import { getAssetUrl } from "@/lib/utils";

export function AmbientSoundPlayer() {
  const ambientSoundId = useAmbientSoundStore((s) => s.ambientSoundId);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const option = ambientSoundOptions.find((o) => o.id === ambientSoundId);
  const src = option?.url ? getAssetUrl(option.url) : null;

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (ambientSoundId === AMBIENT_NONE || !src) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    audio.src = src;
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
    };
  }, [ambientSoundId, src]);

  return <audio ref={audioRef} className="hidden" />;
}
