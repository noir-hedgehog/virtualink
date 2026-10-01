"use client";

import { useEffect } from "react";
import { fingerprint, isStateDocument, type StateDocument } from "@/lib/sync/schema";
import { AUTH_EPOCH_KEY, OWNER_KEY, applyDocument, authPending, canWrite, createDocument, currentOwner, epoch, selectOwner, storageKey } from "@/lib/sync/storage";

type SyncResponse = { ownerId: string; document: StateDocument | null };

export function CloudSync() {
  useEffect(() => {
    let running = false;
    let stopped = false;
    let controller = new AbortController();
    const invalidate = () => { controller.abort(); controller = new AbortController(); };
    const sync = async () => {
      if (running || stopped || authPending()) return;
      running = true;
      const token = epoch();
      const signal = controller.signal;
      const valid = () => !stopped && !signal.aborted && epoch() === token && canWrite();
      try {
        const status = await fetch("/api/auth/status", { cache: "no-store", signal });
        if (!status.ok || !valid()) return;
        const auth = await status.json() as { authenticated: boolean; user: { id: string } | null };
        if (!valid()) return;
        const id = auth.authenticated ? auth.user?.id ?? null : null;
        if (selectOwner(id) || !id) return;
        const headers = { "X-Virtualink-Owner": id };
        const response = await fetch("/api/state", { cache: "no-store", headers, signal });
        if (!response.ok || !valid()) return;
        const payload = await response.json() as SyncResponse;
        if (!valid() || payload.ownerId !== currentOwner()) return;
        if (payload.document !== null && !isStateDocument(payload.document)) return;
        const local = createDocument();
        const localFingerprint = fingerprint(local);
        const baselineKey = storageKey("sync-baseline");
        const baseline = window.localStorage.getItem(baselineKey);
        // Only this stable account's namespace may bootstrap a missing server
        // document. Unclaimed guest/legacy records stay untouched until import.
        if ((baseline !== null && localFingerprint !== baseline) || payload.document === null) {
          const put = await fetch("/api/state", {
            method: "PUT", headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ document: local }), signal,
          });
          if (put.ok && valid()) {
            const result = await put.json() as SyncResponse;
            if (valid() && result.ownerId === id) window.localStorage.setItem(baselineKey, localFingerprint);
          }
          return;
        }
        const remoteFingerprint = fingerprint(payload.document);
        if (baseline === null && Object.keys(payload.document.records).length === 0 && Object.keys(local.records).length > 0) {
          // Record a baseline, then the next pass uploads account-owned data.
          window.localStorage.setItem(baselineKey, remoteFingerprint);
          return;
        }
        const changed = applyDocument(payload.document);
        window.localStorage.setItem(baselineKey, remoteFingerprint);
        if (changed) window.location.reload();
      } catch {
        // Offline persistence remains scoped to the account; retry next pass.
      } finally { running = false; }
    };
    const changed = () => { invalidate(); void sync(); };
    const storageChanged = (event: StorageEvent) => {
      if (event.key === AUTH_EPOCH_KEY) changed();
      if (event.key === OWNER_KEY && !canWrite()) { invalidate(); window.location.reload(); }
    };
    const visibility = () => { if (document.visibilityState === "visible") void sync(); };
    void sync();
    const interval = window.setInterval(() => void sync(), 10_000);
    window.addEventListener("virtualink-auth-changing", invalidate);
    window.addEventListener("virtualink-auth-changed", changed);
    window.addEventListener("storage", storageChanged);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopped = true; invalidate(); window.clearInterval(interval);
      window.removeEventListener("virtualink-auth-changing", invalidate);
      window.removeEventListener("virtualink-auth-changed", changed);
      window.removeEventListener("storage", storageChanged);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
