"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AUTH_EPOCH_KEY, OWNER_KEY, authPending, canWrite, epoch, selectOwner } from "@/lib/sync/storage";

// Verify the browser namespace before showing account data on any route,
// including pages that do not mount the periodic CloudSync component.
export function AccountBoundary({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let stopped = false;
    let request: AbortController | null = null;
    let verifiedEpoch: string | null | undefined;
    const check = async () => {
      setReady(false);
      request?.abort();
      if (authPending()) return;
      const controller = new AbortController(); request = controller;
      const token = epoch();
      const timeout = window.setTimeout(() => controller.abort(), 8_000);
      try {
        const response = await fetch("/api/auth/status", { cache: "no-store", signal: controller.signal });
        if (stopped || request !== controller || token !== epoch()) return;
        if (response.ok) {
          const auth = await response.json() as { authenticated: boolean; user: { id: string } | null };
          if (stopped || request !== controller || token !== epoch()) return;
          if (selectOwner(auth.authenticated ? auth.user?.id ?? null : null)) return;
        }
        if (canWrite()) { verifiedEpoch = token; setReady(true); }
      } catch {
        // Existing account-owned offline data remains available when the
        // server cannot be reached. It is never assigned to another account.
        if (!stopped && request === controller && token === epoch() && canWrite()) { verifiedEpoch = token; setReady(true); }
      } finally { window.clearTimeout(timeout); }
    };
    const changing = () => { request?.abort(); setReady(false); };
    const storage = (event: StorageEvent) => {
      if (event.key === OWNER_KEY && !canWrite()) { changing(); window.location.reload(); }
      if (event.key === AUTH_EPOCH_KEY) void check();
    };
    void check();
    // Recover an abandoned auth transition without clearing another tab's
    // live epoch. A subsequent successful status request selects its owner.
    const recovery = window.setInterval(() => {
      if (authPending()) return;
      if (!canWrite()) { window.location.reload(); return; }
      const token = epoch();
      if (token?.startsWith("pending:") && token !== verifiedEpoch) void check();
    }, 10_000);
    window.addEventListener("storage", storage);
    window.addEventListener("virtualink-auth-changing", changing);
    window.addEventListener("virtualink-auth-changed", check);
    return () => {
      stopped = true; request?.abort(); window.clearInterval(recovery);
      window.removeEventListener("storage", storage);
      window.removeEventListener("virtualink-auth-changing", changing);
      window.removeEventListener("virtualink-auth-changed", check);
    };
  }, []);
  return ready ? children : <div role="status" className="p-6 text-lofi-cream">正在确认账号…</div>;
}
