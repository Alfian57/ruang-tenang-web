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

  for (const m of mutations) {
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
        // Token expired — can't replay, remove to avoid infinite retries
        if (m.id !== undefined) {
          await deleteMutation(m.id);
        }
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
