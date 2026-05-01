"use client";

import { useEffect, useState, useCallback } from "react";
import { WifiOff, RefreshCw, CloudOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNetworkStatus, usePendingMutations } from "@/hooks/use-network-status";
import { syncOutbox } from "@/lib/offline/syncOutbox";

type SyncState = "idle" | "syncing" | "done";

export function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const pendingCount = usePendingMutations();
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [visible, setVisible] = useState(false);

  // Show the banner whenever offline OR there are pending mutations
  useEffect(() => {
    if (!isOnline || pendingCount > 0) {
      setVisible(true);
    }
  }, [isOnline, pendingCount]);

  // Auto-sync when back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && syncState === "idle") {
      handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Hide after sync complete
  useEffect(() => {
    if (syncState === "done") {
      const t = setTimeout(() => {
        setVisible(false);
        setSyncState("idle");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [syncState]);

  // Hide when online + no pending
  useEffect(() => {
    if (isOnline && pendingCount === 0 && syncState === "idle") {
      const t = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(t);
    }
  }, [isOnline, pendingCount, syncState]);

  const handleSync = useCallback(async () => {
    if (syncState === "syncing") return;
    setSyncState("syncing");
    try {
      await syncOutbox();
    } catch {
      // ignore
    } finally {
      setSyncState("done");
    }
  }, [syncState]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-0 inset-x-0 z-[9999]"
        >
          {/* Offline banner */}
          {!isOnline && (
            <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-md">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>Anda sedang offline — data akan disinkronkan saat koneksi kembali</span>
              {pendingCount > 0 && (
                <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                  {pendingCount} tertunda
                </span>
              )}
            </div>
          )}

          {/* Syncing / Pending banner when online */}
          {isOnline && syncState === "syncing" && (
            <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-md">
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
              <span>Menyinkronkan data offline…</span>
            </div>
          )}

          {isOnline && syncState === "idle" && pendingCount > 0 && (
            <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-md">
              <CloudOff className="w-4 h-4 shrink-0" />
              <span>{pendingCount} perubahan belum tersinkronkan</span>
              <button
                onClick={handleSync}
                className="ml-2 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-0.5 text-xs font-semibold transition-colors"
              >
                Sinkronkan
              </button>
            </div>
          )}

          {isOnline && syncState === "done" && (
            <div className="bg-emerald-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Sinkronisasi selesai!</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
