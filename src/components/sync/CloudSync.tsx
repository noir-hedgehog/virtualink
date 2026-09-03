"use client";

import { useCallback, useEffect, useRef } from "react";
import { SYNC_STORAGE_KEYS, type StateDocument } from "@/lib/sync/schema";

type SyncResponse = { document: StateDocument | null };

function createDocument(): StateDocument {
  const records: StateDocument["records"] = {};
  for (const key of SYNC_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) records[key] = value;
  }
  return { version: 1, updatedAt: new Date().toISOString(), records };
}

function fingerprint(document: StateDocument): string {
  return JSON.stringify(document.records);
}

function applyDocument(document: StateDocument): boolean {
  let changed = false;
  for (const key of SYNC_STORAGE_KEYS) {
    const remoteValue = document.records[key];
    const localValue = window.localStorage.getItem(key);
    if (typeof remoteValue === "string" && remoteValue !== localValue) {
      window.localStorage.setItem(key, remoteValue);
      changed = true;
    }
  }
  return changed;
}

export function CloudSync() {
  const submittedFingerprint = useRef<string | null>(null);
  const syncing = useRef(false);

  const push = useCallback(async (document: StateDocument) => {
    const response = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document }),
    });
    if (!response.ok) throw new Error("sync_write_failed");
    submittedFingerprint.current = fingerprint(document);
  }, []);

  const sync = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const status = await fetch("/api/auth/status", { cache: "no-store" });
      if (!status.ok) return;
      const auth = await status.json() as { authenticated?: boolean };
      if (!auth.authenticated) return;

      const local = createDocument();
      const localFingerprint = fingerprint(local);
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json() as SyncResponse;
      if (!payload.document) {
        await push(local);
        return;
      }

      const remoteFingerprint = fingerprint(payload.document);
      if (submittedFingerprint.current === null) {
        // A newly provisioned account has an empty document. Preserve any
        // existing browser-local history by making it the first server copy.
        if (
          Object.keys(payload.document.records).length === 0 &&
          Object.keys(local.records).length > 0
        ) {
          await push(local);
          return;
        }
        const changed = applyDocument(payload.document);
        submittedFingerprint.current = remoteFingerprint;
        if (changed) window.location.reload();
        return;
      }

      if (localFingerprint === submittedFingerprint.current && remoteFingerprint !== localFingerprint) {
        if (applyDocument(payload.document)) window.location.reload();
        submittedFingerprint.current = remoteFingerprint;
        return;
      }
      if (localFingerprint !== submittedFingerprint.current) await push(local);
    } catch {
      // Offline or an unavailable private server: browser-local persistence still works.
    } finally {
      syncing.current = false;
    }
  }, [push]);

  useEffect(() => {
    void sync();
    const interval = window.setInterval(() => void sync(), 10_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void sync();
    };
    const onAuthChanged = () => {
      submittedFingerprint.current = null;
      void sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("virtualink-auth-changed", onAuthChanged);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("virtualink-auth-changed", onAuthChanged);
    };
  }, [sync]);

  return null;
}
