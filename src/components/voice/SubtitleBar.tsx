"use client";

import { useVoiceStore } from "@/stores/voiceStore";

/** 播放器上方的 galgame 式字幕条 */
export function SubtitleBar() {
  const text = useVoiceStore((s) => s.text);

  if (!text) return null;

  return (
    <div className="fixed left-0 right-0 bottom-24 z-40 flex justify-center px-4 pb-2 pointer-events-none">
      <div className="max-w-2xl rounded-lg border border-lofi-brown/20 bg-lofi-dark/80 px-5 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-center text-lofi-cream text-sm leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
