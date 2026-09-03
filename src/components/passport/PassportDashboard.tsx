"use client";

import Link from "next/link";
import { useState } from "react";
import { CloudSync } from "@/components/sync/CloudSync";
import { useIntimacyStore } from "@/stores/intimacyStore";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useSceneStore } from "@/stores/sceneStore";
import { useTodoStore } from "@/stores/todoStore";

type PairedDevice = { id: string; name: string; token: string };

function formatRemaining(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const rest = Math.max(0, seconds) % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function PassportDashboard() {
  const todos = useTodoStore((state) => state.items);
  const pomodoro = usePomodoroStore();
  const characterId = useSceneStore((state) => state.currentCharacterId ?? "miki");
  const addPoints = useIntimacyStore((state) => state.addPoints);
  const [device, setDevice] = useState<PairedDevice | null>(null);
  const [message, setMessage] = useState("");

  const pair = async () => {
    setMessage("");
    const response = await fetch("/api/passport/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "AI Passport" }),
    });
    if (!response.ok) {
      setMessage("登录状态已过期，请返回首页重新登录。");
      return;
    }
    const payload = await response.json() as { device: PairedDevice };
    setDevice(payload.device);
    setMessage("已生成一次性设备令牌。实机固件接入前，请将它安全写入设备配置，不要写入 NFC 标签。" );
  };

  const openTodos = todos.filter((todo) => !todo.done);

  return (
    <main className="min-h-screen overflow-auto bg-gradient-to-br from-[#151019] via-[#261a2d] to-[#12171e] p-5 text-lofi-cream md:p-10">
      <CloudSync />
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-pixel text-sm text-lofi-accent">AI PASSPORT</p>
            <h1 className="mt-2 text-2xl font-semibold">随身伴侣控制台</h1>
            <p className="mt-2 max-w-2xl text-sm text-lofi-cream/65">与 VirtuaLink 共用同一份私有状态：陪伴打卡、番茄钟和待办会在已登录设备间同步。</p>
          </div>
          <Link href="/" className="rounded-lg border border-lofi-brown/50 px-4 py-2 text-sm text-lofi-cream/80 hover:bg-white/10">返回 VirtuaLink</Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-lofi-brown/30 bg-black/20 p-5">
            <p className="text-sm text-lofi-cream/60">当前陪伴</p>
            <p className="mt-2 text-xl font-medium">{characterId}</p>
            <button type="button" onClick={() => addPoints(characterId, 1)} className="mt-5 rounded-lg bg-lofi-accent/80 px-3 py-2 text-sm font-medium text-lofi-dark hover:bg-lofi-accent">与 TA 打个招呼</button>
          </article>
          <article className="rounded-2xl border border-lofi-brown/30 bg-black/20 p-5">
            <p className="text-sm text-lofi-cream/60">番茄钟</p>
            <p className="mt-2 font-pixel text-3xl">{formatRemaining(pomodoro.remainingSeconds)}</p>
            <p className="mt-2 text-sm text-lofi-cream/65">{pomodoro.phase === "work" ? "专注中" : "休息中"} · 第 {pomodoro.cycle} 轮</p>
            <button type="button" onClick={() => pomodoro.isRunning ? pomodoro.pause() : pomodoro.start()} className="mt-5 rounded-lg border border-lofi-accent/70 px-3 py-2 text-sm text-lofi-accent hover:bg-lofi-accent/15">{pomodoro.isRunning ? "暂停" : "开始"}</button>
          </article>
          <article className="rounded-2xl border border-lofi-brown/30 bg-black/20 p-5">
            <p className="text-sm text-lofi-cream/60">待办</p>
            <p className="mt-2 text-3xl font-semibold">{openTodos.length}</p>
            <p className="mt-2 text-sm text-lofi-cream/65">项尚未完成</p>
            <ul className="mt-4 space-y-2 text-sm text-lofi-cream/80">{openTodos.slice(0, 3).map((todo) => <li key={todo.id} className="truncate">• {todo.title}</li>)}</ul>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-lofi-brown/30 bg-black/20 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-medium">配对 AI Passport</h2>
              <p className="mt-1 text-sm text-lofi-cream/60">服务端已提供只读状态接口，供未来的设备固件使用设备令牌读取 Todo 与番茄钟。</p>
            </div>
            <button type="button" onClick={pair} className="rounded-lg bg-lofi-accent/80 px-4 py-2 text-sm font-medium text-lofi-dark hover:bg-lofi-accent">生成设备令牌</button>
          </div>
          {message && <p className="mt-4 text-sm text-lofi-accent">{message}</p>}
          {device && (
            <div className="mt-4 rounded-lg border border-lofi-brown/30 bg-black/25 p-3 text-sm">
              <p className="text-lofi-cream/65">设备：{device.name}</p>
              <p className="mt-2 break-all font-mono text-xs text-lofi-cream">{device.token}</p>
            </div>
          )}
          <p className="mt-4 text-xs text-lofi-cream/45">硬件边界：设备的 NTAG213 是独立被动标签，不可由 ESP32 固件动态读取或写入；NFC 可存放手动写入的静态配对网址，但不能存放令牌。</p>
        </section>
      </div>
    </main>
  );
}
