import { StateCreator } from "zustand";
import { ChatStore, ChatFolderState, ChatFolderActions } from "./types";
import { chatService } from "@/services/api";
import { ChatFolder } from "@/types";

export const createFolderSlice: StateCreator<ChatStore, [], [], ChatFolderState & ChatFolderActions> = (set, get) => ({
  folders: [],
  activeFolderId: null,

  loadFolders: async (token: string) => {
    if (!token) return;

    try {
      const response = (await chatService.getFolders(token)) as {
        data: ChatFolder[];
      };
      set({ folders: response.data || [] });
    } catch (error) {
      console.error("ChatStore.loadFolders: failed", error);
    }
  },

  createFolder: async (token: string, name: string, color?: string, icon?: string) => {
    if (!token || !name.trim()) return;

    try {
      await chatService.createFolder(token, { name, color, icon });
      await get().loadFolders(token);
    } catch (error) {
      console.error("ChatStore.createFolder: failed", error);
    }
  },

  updateFolder: async (token: string, folderId: number, data: { name?: string; color?: string; icon?: string }) => {
    if (!token) return;

    const folder = get().folders.find(f => f.id === folderId);
    if (!folder) return;

    try {
      await chatService.updateFolder(token, folder.uuid, data);
      await get().loadFolders(token);
    } catch (error) {
      console.error("ChatStore.updateFolder: failed", error);
    }
  },

  deleteFolder: async (token: string, folderId: number) => {
    if (!token) return;

    const folder = get().folders.find(f => f.id === folderId);
    if (!folder) return;

    try {
      await chatService.deleteFolder(token, folder.uuid);
      
      const { activeFolderId } = get();
      if (activeFolderId === folderId) {
        set({ activeFolderId: null });
      }
      
      await get().loadFolders(token);
      await get().loadSessions(token);
    } catch (error) {
      console.error("ChatStore.deleteFolder: failed", error);
    }
  },

  reorderFolders: async (token: string, folderIds: number[]) => {
    if (!token) return;

    try {
      await chatService.reorderFolders(token, folderIds);
      await get().loadFolders(token);
    } catch (error) {
      console.error("ChatStore.reorderFolders: failed", error);
    }
  },

  moveSessionToFolder: async (token: string, sessionId: string, folderId: number | null) => {
    if (!token) return;

    try {
      await chatService.moveToFolder(token, sessionId, folderId);
      await get().loadSessions(token);
      await get().loadFolders(token);
      
      const { activeSession } = get();
      if (activeSession?.uuid === sessionId) {
        set((state) => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, folder_id: folderId ?? undefined }
            : null,
        }));
      }
    } catch (error) {
      console.error("ChatStore.moveSessionToFolder: failed", error);
    }
  },

  setActiveFolderId: (folderId: number | null) => {
    set({ activeFolderId: folderId, activeSession: null, messages: [], currentSummary: null });
  },
});
