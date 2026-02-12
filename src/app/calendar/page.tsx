"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();

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
        <h1 className="text-lg font-medium text-lofi-cream">日程</h1>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-lofi-cream/50">日程功能后续扩展</p>
      </div>
    </div>
  );
}
