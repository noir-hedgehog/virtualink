import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/config/playlist";
import { defaultPlaylist } from "@/config/playlist";

/** 列表循环 | 单曲循环 | 随机播放，一个按钮三态切换 */
export type PlayMode = "list" | "one" | "shuffle";

type PlayerState = {
  playlist: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  /** 点击静音时保存的音量，恢复时用 */
  savedVolumeBeforeMute: number;
  playMode: PlayMode;
  /** 用户拖动进度条时设置，PlayerAudio 同步后清除 */
  pendingSeek: number | null;
  setPlaylist: (list: Track[]) => void;
  setCurrentIndex: (index: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  setPlayMode: (m: PlayMode) => void;
  /** 点击切换静音：当前有声音则静音并保存音量，当前静音则恢复之前音量 */
  toggleMute: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  cyclePlayMode: () => void;
  seekTo: (t: number) => void;
  clearPendingSeek: () => void;
  getCurrentTrack: () => Track | null;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      playlist: defaultPlaylist,
      currentIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      savedVolumeBeforeMute: 0.8,
      playMode: "list",
      pendingSeek: null,

      setPlaylist: (list) => set({ playlist: list, currentIndex: 0 }),
      setCurrentIndex: (index) =>
        set({ currentIndex: Math.max(0, Math.min(index, get().playlist.length - 1)) }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      setPlayMode: (playMode) => set({ playMode }),

      toggleMute: () =>
        set((s) => {
          if (s.volume > 0) {
            return { volume: 0, savedVolumeBeforeMute: s.volume };
          }
          return { volume: s.savedVolumeBeforeMute };
        }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      next: () => {
        const { playlist, currentIndex, playMode } = get();
        if (playlist.length === 0) return;
        if (playMode === "one") {
          set({ currentTime: 0 });
          return;
        }
        if (playMode === "shuffle") {
          const nextIndex = Math.floor(Math.random() * playlist.length);
          set({ currentIndex: nextIndex, currentTime: 0 });
          return;
        }
        if (currentIndex >= playlist.length - 1) {
          set({ currentIndex: 0, currentTime: 0 });
          return;
        }
        set({ currentIndex: currentIndex + 1, currentTime: 0 });
      },

      prev: () => {
        const { playlist, currentIndex, currentTime } = get();
        if (playlist.length === 0) return;
        if (currentTime > 2) {
          set({ currentTime: 0 });
          return;
        }
        if (currentIndex <= 0) {
          set({ currentIndex: playlist.length - 1, currentTime: 0 });
          return;
        }
        set({ currentIndex: currentIndex - 1, currentTime: 0 });
      },

      cyclePlayMode: () =>
        set((s) => ({
          playMode: s.playMode === "list" ? "one" : s.playMode === "one" ? "shuffle" : "list",
        })),

      seekTo: (t) =>
        set((s) => {
          const d = s.duration;
          const clamped =
            Number.isFinite(d) && d > 0 ? Math.max(0, Math.min(t, d)) : Math.max(0, t);
          return { currentTime: clamped, pendingSeek: clamped };
        }),
      clearPendingSeek: () => set({ pendingSeek: null }),

      getCurrentTrack: () => {
        const { playlist, currentIndex } = get();
        return playlist[currentIndex] ?? null;
      },
    }),
    {
      name: "chillmxmk-player",
      partialize: (state) => ({
        volume: state.volume,
        savedVolumeBeforeMute: state.savedVolumeBeforeMute,
        playMode: state.playMode,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<{
          volume: number;
          savedVolumeBeforeMute: number;
          playMode: PlayMode;
        }> | undefined;
        return {
          ...current,
          volume: p?.volume ?? current.volume,
          savedVolumeBeforeMute: p?.savedVolumeBeforeMute ?? current.savedVolumeBeforeMute,
          playMode: p?.playMode ?? current.playMode,
        };
      },
    }
  )
);
