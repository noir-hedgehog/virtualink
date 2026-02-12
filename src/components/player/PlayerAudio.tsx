"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { getAssetUrl } from "@/lib/utils";

export function PlayerAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playlist = usePlayerStore((s) => s.playlist);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const pendingSeek = usePlayerStore((s) => s.pendingSeek);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const clearPendingSeek = usePlayerStore((s) => s.clearPendingSeek);
  const next = usePlayerStore((s) => s.next);

  const track = playlist[currentIndex];
  const src = track?.url ? getAssetUrl(track.url) : "";

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (src) {
      el.src = src;
      el.load();
    } else {
      el.removeAttribute("src");
    }
  }, [src]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying && src) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [isPlaying, src, setPlaying]);

  useEffect(() => {
    if (pendingSeek == null) return;
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = pendingSeek;
    clearPendingSeek();
  }, [pendingSeek, clearPendingSeek]);

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
      onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
      onEnded={() => next()}
      onError={() => setPlaying(false)}
    />
  );
}
