import { getAllMutations, deleteMutation, countPendingMutations } from "./db";
import { env } from "@/config/env";
import { useAuthStore } from "@/store/authStore";

/**
 * Replay every queued mutation against the real API, oldest-first.
 * Successfully replayed mutations are removed from the queue.
 * Failed ones stay so the user can retry later.
 *
 * Returns the number of successfully synced items.
 */
export async function syncOutbox(): Promise<number> {
  const mutations = await getAllMutations();
  if (mutations.length === 0) return 0;

  const token = useAuthStore.getState().token;
  if (!token) return 0;

  let synced = 0;

  const NEVER_QUEUE_PREFIXES = [
    "/admin", "/auth", "/b2b", "/billing", "/chat", 
    "/chat-sessions", "/chat-messages", "/moderation", 
    "/push", "/rewards"
  ];

  for (const m of mutations) {
    // Failsafe: drop never-queue items that bypassed local checks
    if (NEVER_QUEUE_PREFIXES.some(prefix => m.endpoint === prefix || m.endpoint.startsWith(`${prefix}/`))) {
      if (m.id !== undefined) await deleteMutation(m.id);
      continue;
    }

    try {
      const url = `${env.NEXT_PUBLIC_API_BASE_URL}${m.endpoint}`;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(url, {
        method: m.method,
        headers,
        body: m.body ? JSON.stringify(m.body) : undefined,
      });

      if (response.ok || response.status === 204) {
        // Success — remove from queue
        if (m.id !== undefined) {
          await deleteMutation(m.id);
        }
        synced++;
      } else if (response.status === 401) {
        // Token expired — DO NOT remove the mutation (prevent data loss).
        // Since the session is invalid, the rest of the queue will also fail.
        // We break the replay loop and wait for the user to login again.
        break;
      }
      // Other errors (500, 422, etc.) — leave in queue for manual retry
    } catch {
      // Network still down — stop trying
      break;
    }
  }

  return synced;
}

/**
 * Attach global listeners that automatically trigger sync when connectivity returns.
 * Call this once from a root client component (e.g. dashboard layout).
 */
export function initAutoSync(onSyncComplete?: (synced: number) => void): () => void {
  const handler = async () => {
    const pending = await countPendingMutations();
    if (pending === 0) return;

    const synced = await syncOutbox();
    onSyncComplete?.(synced);
  };

  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
