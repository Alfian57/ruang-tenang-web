import { create } from "zustand";
import { moderationService } from "@/services/api";
import type { UserBlock } from "@/types/moderation";

interface BlockState {
  blockedUsers: UserBlock[];
  blockedUserIds: Set<number>;
  isLoaded: boolean;

  // Actions
  loadBlockedUsers: (token: string) => Promise<void>;
  blockUser: (token: string, userId: number, reason?: string) => Promise<void>;
  unblockUser: (token: string, userId: number) => Promise<void>;
  isBlocked: (userId: number | undefined) => boolean;
  reset: () => void;
}

export const useBlockStore = create<BlockState>()((set, get) => ({
  blockedUsers: [],
  blockedUserIds: new Set<number>(),
  isLoaded: false,

  loadBlockedUsers: async (token: string) => {
    try {
      const response = await moderationService.getBlockedUsers(token);
      // API returns { data: { blocks: [...], total_count: n } }
      const data = response.data as unknown as { blocks: UserBlock[]; total_count: number };
      const blocks = data?.blocks || [];
      const ids = new Set(blocks.map((b) => b.blocked_id));
      set({ blockedUsers: blocks, blockedUserIds: ids, isLoaded: true });
    } catch (error) {
      console.error("Failed to load blocked users:", error);
      set({ blockedUsers: [], blockedUserIds: new Set(), isLoaded: true });
    }
  },

  blockUser: async (token: string, userId: number, reason?: string) => {
    await moderationService.blockUser(token, userId, reason);
    // Refresh the full list to get correct block IDs
    await get().loadBlockedUsers(token);
  },

  unblockUser: async (token: string, userId: number) => {
    await moderationService.unblockUser(token, userId);
    // Remove from local state immediately
    set((state) => {
      const newBlocked = state.blockedUsers.filter((b) => b.blocked_id !== userId);
      const newIds = new Set(newBlocked.map((b) => b.blocked_id));
      return { blockedUsers: newBlocked, blockedUserIds: newIds };
    });
  },

  isBlocked: (userId: number | undefined) => {
    if (!userId) return false;
    return get().blockedUserIds.has(userId);
  },

  reset: () => {
    set({ blockedUsers: [], blockedUserIds: new Set(), isLoaded: false });
  },
}));
