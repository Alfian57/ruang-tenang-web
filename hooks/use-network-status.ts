"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { countPendingMutations } from "@/lib/offline";

// ─── useNetworkStatus ────────────────────────────────────────────────
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // SSR always assumes online
}

/**
 * Reactive hook that returns `true` when online, `false` when offline.
 */
export function useNetworkStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ─── usePendingMutations ─────────────────────────────────────────────

/**
 * Returns the count of queued offline mutations.
 * Polls every `intervalMs` (default 3 s) and also re-checks on `online` events.
 */
export function usePendingMutations(intervalMs = 3000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const n = await countPendingMutations();
      if (active) setCount(n);
    };

    refresh();
    const timer = setInterval(refresh, intervalMs);
    window.addEventListener("online", refresh);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("online", refresh);
    };
  }, [intervalMs]);

  return count;
}
