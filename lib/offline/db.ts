import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/**
 * IndexedDB schema for offline data.
 *
 * Object stores:
 * - `mutation_queue`: Queued POST/PUT/DELETE requests to replay when back online.
 * - `offline_data`: Cached data for offline reads (journals, moods, etc.).
 */
interface OfflineDB extends DBSchema {
  mutation_queue: {
    key: number;
    value: {
      id?: number;
      endpoint: string;
      method: "POST" | "PUT" | "DELETE";
      body?: unknown;
      /** Legacy entries may contain a token; new entries must not persist bearer tokens. */
      token?: string;
      createdAt: number;
      /** Optional tag so the UI can identify pending items, e.g. "journal" */
      tag?: string;
      /** Temp ID used for optimistic UI updates */
      tempId?: string;
    };
    indexes: { "by-tag": string };
  };
  offline_data: {
    key: string;
    value: {
      key: string;
      data: unknown;
      updatedAt: number;
    };
  };
}

const DB_NAME = "ruang-tenang-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

/**
 * Get (or create) the singleton IndexedDB connection.
 * Safe to call on the server — returns `null` when `indexedDB` is unavailable.
 */
export function getOfflineDB(): Promise<IDBPDatabase<OfflineDB>> | null {
  if (typeof indexedDB === "undefined") return null;

  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Mutation queue
        if (!db.objectStoreNames.contains("mutation_queue")) {
          const store = db.createObjectStore("mutation_queue", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("by-tag", "tag");
        }

        // Generic offline data cache
        if (!db.objectStoreNames.contains("offline_data")) {
          db.createObjectStore("offline_data", { keyPath: "key" });
        }
      },
    });
  }

  return dbPromise;
}

// ─── Mutation Queue helpers ──────────────────────────────────────────

export interface QueuedMutation {
  id?: number;
  endpoint: string;
  method: "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Legacy-only. Do not set for new queued mutations. */
  token?: string;
  createdAt: number;
  tag?: string;
  tempId?: string;
}

/** Enqueue a mutation that should be replayed when online. */
export async function enqueueMutation(mutation: Omit<QueuedMutation, "id" | "createdAt">): Promise<number | null> {
  const dbP = getOfflineDB();
  if (!dbP) return null;
  const db = await dbP;
  const id = await db.add("mutation_queue", {
    ...mutation,
    createdAt: Date.now(),
  } as QueuedMutation);
  return id as number;
}

/** Return all queued mutations, oldest first. */
export async function getAllMutations(): Promise<QueuedMutation[]> {
  const dbP = getOfflineDB();
  if (!dbP) return [];
  const db = await dbP;
  return db.getAll("mutation_queue");
}

/** Delete a single mutation from the queue (after it has been successfully replayed). */
export async function deleteMutation(id: number): Promise<void> {
  const dbP = getOfflineDB();
  if (!dbP) return;
  const db = await dbP;
  await db.delete("mutation_queue", id);
}

/** Clear the entire mutation queue. */
export async function clearMutationQueue(): Promise<void> {
  const dbP = getOfflineDB();
  if (!dbP) return;
  const db = await dbP;
  await db.clear("mutation_queue");
}

/** Count pending mutations. */
export async function countPendingMutations(): Promise<number> {
  const dbP = getOfflineDB();
  if (!dbP) return 0;
  const db = await dbP;
  return db.count("mutation_queue");
}

// ─── Offline Data helpers ────────────────────────────────────────────

/** Cache arbitrary data under a string key. */
export async function setOfflineData(key: string, data: unknown): Promise<void> {
  const dbP = getOfflineDB();
  if (!dbP) return;
  const db = await dbP;
  await db.put("offline_data", { key, data, updatedAt: Date.now() });
}

/** Retrieve cached data, or `null` if not found. */
export async function getOfflineData<T = unknown>(key: string): Promise<T | null> {
  const dbP = getOfflineDB();
  if (!dbP) return null;
  const db = await dbP;
  const entry = await db.get("offline_data", key);
  return entry ? (entry.data as T) : null;
}

/** Remove cached data for the given key. */
export async function removeOfflineData(key: string): Promise<void> {
  const dbP = getOfflineDB();
  if (!dbP) return;
  const db = await dbP;
  await db.delete("offline_data", key);
}
