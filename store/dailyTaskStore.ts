import { create } from "zustand";
import { communityService } from "@/services/api";
import type { ClaimTaskResponse, DailyTask, DailyTaskSummary } from "@/types";

interface DailyTaskStore {
  tasks: DailyTask[];
  isLoading: boolean;
  hasError: boolean;
  claimingId: number | null;
  lastLoadedAt: number;
  loadTasks: (token: string | null | undefined, force?: boolean) => Promise<void>;
  claimTask: (token: string, taskId: number) => Promise<ClaimTaskResponse | null>;
  clear: () => void;
}

let inflightLoad: Promise<void> | null = null;

function extractTasks(payload: DailyTask[] | DailyTaskSummary | null | undefined): DailyTask[] {
  if (Array.isArray(payload)) return payload;
  return payload?.tasks ?? [];
}

export const useDailyTaskStore = create<DailyTaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  hasError: false,
  claimingId: null,
  lastLoadedAt: 0,

  loadTasks: async (token, force = false) => {
    if (!token) {
      set({ tasks: [], isLoading: false, hasError: false, lastLoadedAt: 0 });
      return;
    }

    const isFresh = Date.now() - get().lastLoadedAt < 10_000;
    if (!force && isFresh) return;
    if (inflightLoad) return inflightLoad;

    set({ isLoading: true, hasError: false });
    inflightLoad = communityService.getDailyTasks(token)
      .then((response) => {
        set({ tasks: extractTasks(response.data), lastLoadedAt: Date.now() });
      })
      .catch(() => set({ hasError: true }))
      .finally(() => {
        set({ isLoading: false });
        inflightLoad = null;
      });

    return inflightLoad;
  },

  claimTask: async (token, taskId) => {
    if (get().claimingId !== null) return null;
    set({ claimingId: taskId });
    try {
      const response = await communityService.claimTaskReward(token, taskId);
      set({
        tasks: get().tasks.map((task) =>
          task.id === taskId ? { ...task, is_completed: true, is_claimed: true } : task
        ),
      });
      await get().loadTasks(token, true).catch(() => undefined);
      return response.data ?? null;
    } finally {
      set({ claimingId: null });
    }
  },

  clear: () => set({ tasks: [], isLoading: false, hasError: false, claimingId: null, lastLoadedAt: 0 }),
}));
