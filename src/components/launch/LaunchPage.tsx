"use client";

import { getStories, listCharacters } from "@/config/characters";
import { APP_VERSION, UPDATE_NOTES } from "@/config/version";
import { getAssetUrl } from "@/lib/utils";
import { useLaunchStore, FIRST_MEET_STORY_ID } from "@/stores/launchStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useStoryStore } from "@/stores/storyStore";
import { ChevronDown, Link2, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LAUNCH_BG = "/wallpapers/background-test.png";

export function LaunchPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showVersion, setShowVersion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const completeLaunch = useLaunchStore((s) => s.completeLaunch);
  const characters = listCharacters();

  const handleLinkStart = () => {
    const characterId = selectedId ?? characters[0]?.id ?? "miki";
    const isFirstTime = completeLaunch(characterId);
    useSceneStore.getState().setCharacter(characterId);
    const hasFirstMeet = getStories(characterId).some((s) => s.id === FIRST_MEET_STORY_ID);
    if (isFirstTime && hasFirstMeet) {
      useStoryStore.getState().unlock(characterId, FIRST_MEET_STORY_ID);
      useStoryStore.getState().setIncomingStory({
        characterId,
        storyId: FIRST_MEET_STORY_ID,
      });
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-lofi-dark"
      style={{
        backgroundImage: `url(${getAssetUrl(LAUNCH_BG)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex flex-1 flex-col items-center justify-between p-6 pb-10 pt-12">
        <header className="flex w-full max-w-lg items-center justify-between">
          <h1 className="text-xl font-medium text-lofi-cream/90">VirtuaLink</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="rounded-lg p-2 text-lofi-cream/70 hover:bg-white/10 hover:text-lofi-cream"
              title="基础设置"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowVersion((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-lofi-cream/70 hover:bg-white/10 hover:text-lofi-cream"
              title="版本与更新说明"
            >
              <span className="text-sm">v{APP_VERSION}</span>
              <ChevronDown
                className={cn("h-4 w-4 transition", showVersion && "rotate-180")}
              />
            </button>
          </div>
        </header>

        {showVersion && (
          <div className="w-full max-w-lg rounded-xl border border-lofi-brown/30 bg-lofi-dark/90 p-4 text-sm text-lofi-cream/80 shadow-xl backdrop-blur-sm">
            <p className="mb-2 font-medium text-lofi-cream">更新说明 v{APP_VERSION}</p>
            <ul className="list-inside list-disc space-y-1 text-lofi-cream/70">
              {UPDATE_NOTES.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {showSettings && (
          <div className="w-full max-w-lg rounded-xl border border-lofi-brown/30 bg-lofi-dark/90 p-4 text-sm text-lofi-cream/80 shadow-xl backdrop-blur-sm">
            <p className="font-medium text-lofi-cream">基础设置</p>
            <p className="mt-1 text-lofi-cream/50">进入应用后可在右下角或设置中调整壁纸、场景、角色与播放等。</p>
          </div>
        )}

        <div className="flex w-full max-w-lg flex-col items-center gap-6">
          <div className="w-full">
            <p className="mb-3 text-center text-sm text-lofi-cream/70">选择连线角色</p>
            <div className="flex flex-wrap justify-center gap-3">
              {characters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "rounded-xl border-2 px-5 py-3 text-sm font-medium transition",
                    selectedId === c.id
                      ? "border-lofi-accent bg-lofi-accent/30 text-lofi-cream"
                      : "border-lofi-brown/40 bg-lofi-dark/60 text-lofi-cream/80 hover:border-lofi-brown/60"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLinkStart}
            className="flex items-center gap-2 rounded-2xl bg-lofi-accent/80 px-8 py-4 text-lg font-medium text-lofi-dark shadow-lg transition hover:bg-lofi-accent"
          >
            <Link2 className="h-5 w-5" />
            Link Start
          </button>
        </div>
      </div>
    </div>
  );
}
