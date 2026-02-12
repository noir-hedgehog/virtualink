"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useModalStore } from "@/stores/modalStore";
import { cn } from "@/lib/utils";

type ModalProps = {
  id: "todo" | "habits" | "diary" | "calendar" | "settings" | "chat" | "story" | "achievements";
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ id, title, children, className }: ModalProps) {
  const { openModal, close } = useModalStore();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    },
    [close]
  );

  useEffect(() => {
    if (openModal === id) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [openModal, id, handleEscape]);

  if (openModal !== id) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${id}`}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={close}
      />
      <div
        className={cn(
          "relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-lofi-brown/20 bg-lofi-dark/60 shadow-xl backdrop-blur-sm",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-lofi-brown/20 px-5 py-3">
          <h2 id={`modal-title-${id}`} className="text-lg font-medium text-lofi-cream">
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            className="p-2 text-lofi-cream/70 hover:text-lofi-cream rounded-lg hover:bg-lofi-brown/20"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-1 min-h-0 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
