"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  ListMusic,
} from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import type { PlayMode } from "@/stores/playerStore";
import { cn } from "@/lib/utils";

const PLAY_MODE_TITLE: Record<PlayMode, string> = {
  list: "列表循环",
  one: "单曲循环",
  shuffle: "随机播放",
};

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** 时长未加载时显示 */
function formatDuration(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "--:--";
  return formatTime(s);
}

export function BottomBar() {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const playMode = usePlayerStore((s) => s.playMode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const cyclePlayMode = usePlayerStore((s) => s.cyclePlayMode);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setCurrentIndex = usePlayerStore((s) => s.setCurrentIndex);
  const getCurrentTrack = usePlayerStore((s) => s.getCurrentTrack);

  const track = getCurrentTrack();
  const hasUrl = Boolean(track?.url);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const playlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaylistOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (playlistRef.current && !playlistRef.current.contains(e.target as Node)) {
        setIsPlaylistOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPlaylistOpen]);

  const displayTime = isSeeking ? seekValue : currentTime;
  const displayDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setSeekValue(v);
      seekTo(v);
    },
    [seekTo]
  );

  const handleSeekMouseDown = useCallback(() => {
    setSeekValue(currentTime);
    setIsSeeking(true);
  }, [currentTime]);
  const handleSeekMouseUp = useCallback(() => setIsSeeking(false), []);

  const handlePlayClick = useCallback(() => {
    if (!hasUrl) return;
    togglePlay();
  }, [hasUrl, togglePlay]);

  const rangeMax = displayDuration > 0 ? displayDuration : 100;

  return (
    <footer className="flex shrink-0 flex-col gap-2 border-t border-lofi-brown/30 bg-lofi-dark/90 px-6 py-3">
      {/* 进度条：右侧与右侧栏(right-6)对齐，中间进度条撑满 */}
      <div className="flex w-full items-center gap-3 text-xs text-lofi-cream/60">
        <span className="w-10 shrink-0 tabular-nums">{formatTime(displayTime)}</span>
        <input
          type="range"
          min={0}
          max={rangeMax}
          step={0.1}
          value={Math.min(displayTime, rangeMax)}
          onChange={handleSeek}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}
          onTouchStart={handleSeekMouseDown}
          onTouchEnd={handleSeekMouseUp}
          className="h-1.5 min-w-0 flex-1 appearance-none rounded-full bg-lofi-brown/40 accent-lofi-accent"
        />
        <span className="w-10 shrink-0 tabular-nums text-right">
          {formatDuration(displayDuration)}
        </span>
      </div>

      <div className="flex w-full items-center">
        {/* 左侧：曲目信息，占位使播放控制居中 */}
        <div className="flex min-w-0 flex-1 items-center text-sm text-lofi-cream/80">
          {track ? (
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="font-medium shrink-0">{track.title}</span>
              <span className="text-lofi-cream/60 shrink-0">{track.artist}</span>
              {!hasUrl && (
                <span className="text-lofi-cream/40 text-xs shrink-0">(暂无音源)</span>
              )}
            </div>
          ) : (
            <span className="text-lofi-cream/50">暂无曲目</span>
          )}
        </div>

        {/* 中间：播放控制，相对进度条行居中 */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => cyclePlayMode()}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "text-lofi-cream/70 hover:text-lofi-cream",
              playMode !== "list" && "text-lofi-accent"
            )}
            title={PLAY_MODE_TITLE[playMode]}
          >
            {playMode === "shuffle" ? (
              <Shuffle className="h-4 w-4" />
            ) : playMode === "one" ? (
              <Repeat1 className="h-4 w-4" />
            ) : (
              <Repeat className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => prev()}
            className="p-2 text-lofi-cream/70 hover:text-lofi-cream rounded-lg"
            title="上一首"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handlePlayClick}
            disabled={!hasUrl}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-lofi-accent/40 text-lofi-cream hover:bg-lofi-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasUrl ? (isPlaying ? "暂停" : "播放") : "暂无音源"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => next()}
            className="p-2 text-lofi-cream/70 hover:text-lofi-cream rounded-lg"
            title="下一首"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <div className="relative" ref={playlistRef}>
            <button
              type="button"
              onClick={() => setIsPlaylistOpen((v) => !v)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isPlaylistOpen
                  ? "text-lofi-accent bg-lofi-accent/20"
                  : "text-lofi-cream/70 hover:text-lofi-cream"
              )}
              title="播放列表"
            >
              <ListMusic className="h-4 w-4" />
            </button>
            {isPlaylistOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-72 max-h-80 overflow-auto rounded-xl border border-lofi-brown/20 bg-lofi-dark/95 py-2 shadow-xl backdrop-blur-sm z-50">
                <p className="px-3 py-1.5 text-xs text-lofi-cream/50 border-b border-lofi-brown/20">
                  播放列表
                </p>
                <ul className="py-1">
                  {playlist.map((t, i) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex(i);
                          setIsPlaylistOpen(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm flex flex-col gap-0.5 rounded-none hover:bg-lofi-brown/20 transition-colors",
                          i === currentIndex
                            ? "text-lofi-accent bg-lofi-accent/10"
                            : "text-lofi-cream/90"
                        )}
                      >
                        <span className="font-medium truncate">{t.title}</span>
                        <span className="text-xs text-lofi-cream/60 truncate">{t.artist}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {playlist.length === 0 && (
                  <p className="px-3 py-4 text-center text-sm text-lofi-cream/50">暂无曲目</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：音量，与进度条行右对齐 */}
        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-2 border-l border-lofi-brown/30 pl-2">
            <Volume2 className="h-4 w-4 shrink-0 text-lofi-cream/60" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1.5 w-20 appearance-none rounded-full bg-lofi-brown/40 accent-lofi-accent"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
