import { StateCreator } from "zustand";
import { ChatStore, ChatSessionState, ChatSessionActions } from "./types";
import { chatService } from "@/services/api";
import { ChatSession, ChatMessage } from "@/types";

export const createSessionSlice: StateCreator<ChatStore, [], [], ChatSessionState & ChatSessionActions> = (set, get) => ({
  sessions: [],
  activeSession: null,
  filter: "all",
  isLoading: false,

  loadSessions: async (token: string) => {
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const { filter } = get();
      const response = (await chatService.getSessions(token, { filter, limit: 50 })) as {
        data: ChatSession[];
      };
      set({ sessions: response.data || [], isLoading: false });
    } catch (error) {
      console.error("ChatStore.loadSessions: failed", error);
      set({ isLoading: false });
    }
  },

  loadSession: async (token: string, sessionId: string) => {
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = (await chatService.getSession(token, sessionId)) as {
        data: ChatSession & { messages: ChatMessage[] };
      };
      set({
        activeSession: response.data,
        messages: response.data.messages || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("ChatStore.loadSession: failed", error);
      set({ isLoading: false });
    }
  },

  createSession: async (token: string, title: string, folderId?: number) => {
    if (!token || !title.trim()) return;

    try {
      const response = (await chatService.createSession(token, title)) as {
        data: Partial<ChatSession> & { id?: number; uuid?: string };
      };

      const createdSessionId = response.data?.id;
      let createdSessionUUID = response.data?.uuid;

      await get().loadSessions(token);

      if (!createdSessionUUID) {
        const { sessions } = get();
        const createdSession =
          (typeof createdSessionId === "number"
            ? sessions.find((session) => session.id === createdSessionId)
            : undefined) ??
          sessions.find((session) => session.title === title.trim());

        createdSessionUUID = createdSession?.uuid;
      }

      if (!createdSessionUUID) {
        console.error("ChatStore.createSession: session UUID not found after creation");
        return;
      }

      if (folderId) {
        await chatService.moveToFolder(token, createdSessionUUID, folderId);
        await get().loadSessions(token);
      }

      await get().loadSession(token, createdSessionUUID);
    } catch (error) {
      console.error("ChatStore.createSession: failed", error);
    }
  },

  deleteSession: async (token: string, sessionId: string) => {
    if (!token) return;

    try {
      await chatService.deleteSession(token, sessionId);
      
      const { activeSession } = get();
      if (activeSession?.uuid === sessionId) {
        set({ activeSession: null, messages: [] });
      }
      
      await get().loadSessions(token);
    } catch (error) {
      console.error("ChatStore.deleteSession: failed", error);
    }
  },

  toggleFavorite: async (token: string, sessionId: string) => {
    if (!token) return;

    try {
      await chatService.toggleFavorite(token, sessionId);
      await get().loadSessions(token);

      const { activeSession } = get();
      if (activeSession?.uuid === sessionId) {
        set((state) => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, is_favorite: !state.activeSession.is_favorite }
            : null,
        }));
      }
    } catch (error) {
      console.error("ChatStore.toggleFavorite: failed", error);
    }
  },

  toggleTrash: async (token: string, sessionId: string) => {
    if (!token) return;

    try {
      await chatService.toggleTrash(token, sessionId);
      await get().loadSessions(token);

      const { activeSession, filter } = get();
      if (activeSession?.uuid === sessionId) {
        if (filter !== "trash") {
          set({ activeSession: null, messages: [] });
        } else {
          set((state) => ({
            activeSession: state.activeSession
              ? { ...state.activeSession, is_trash: !state.activeSession.is_trash }
              : null,
          }));
        }
      }
    } catch (error) {
      console.error("ChatStore.toggleTrash: failed", error);
    }
  },

  setFilter: (filter) => {
    set({ filter, activeSession: null, messages: [], currentSummary: null });
  },

  reset: () => {
    set({
        sessions: [],
        activeSession: null,
        messages: [],
        filter: "all",
        folders: [],
        activeFolderId: null,
        currentSummary: null,
        isGeneratingSummary: false,
        suggestedPrompts: [],
        isSending: false,
        isRecording: false,
        isLoading: false,
    });
  },

  clearActiveSession: () => {
    set({
      activeSession: null,
      messages: [],
      currentSummary: null,
    });
  },
});
