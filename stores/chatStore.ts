import { create } from "zustand";
import { api } from "@/lib/api";
import { ChatSession, ChatMessage, ChatFolder, ChatSessionSummary, SuggestedPrompt, ChatExportResponse } from "@/types";
import { useAuthStore } from "./authStore";

/**
 * Filter type for chat sessions.
 */
export type FilterType = "all" | "favorites" | "trash";

/**
 * Chat store state interface.
 */
interface ChatState {
  // Session state
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  messages: ChatMessage[];
  filter: FilterType;

  // Folder state
  folders: ChatFolder[];
  activeFolderId: number | null;

  // Summary state
  currentSummary: ChatSessionSummary | null;
  isGeneratingSummary: boolean;

  // Suggested prompts state
  suggestedPrompts: SuggestedPrompt[];

  // UI state
  isSending: boolean;
  isRecording: boolean;
  isLoading: boolean;
}

/**
 * Chat store actions interface.
 */
interface ChatActions {
  // Session actions
  loadSessions: (token: string) => Promise<void>;
  loadSession: (token: string, sessionId: number) => Promise<void>;
  createSession: (token: string, title: string, folderId?: number) => Promise<void>;
  deleteSession: (token: string, sessionId: number) => Promise<void>;

  // Message actions
  sendTextMessage: (token: string, content: string) => Promise<void>;
  sendAudioMessage: (token: string, audioBlob: Blob) => Promise<void>;
  toggleMessageLike: (token: string, messageId: number, isLike: boolean) => Promise<void>;
  toggleMessagePin: (token: string, messageId: number) => Promise<void>;

  // Session toggle actions
  toggleFavorite: (token: string, sessionId: number) => Promise<void>;
  toggleTrash: (token: string, sessionId: number) => Promise<void>;

  // Folder actions
  loadFolders: (token: string) => Promise<void>;
  createFolder: (token: string, name: string, color?: string, icon?: string) => Promise<void>;
  updateFolder: (token: string, folderId: number, data: { name?: string; color?: string; icon?: string }) => Promise<void>;
  deleteFolder: (token: string, folderId: number) => Promise<void>;
  reorderFolders: (token: string, folderIds: number[]) => Promise<void>;
  moveSessionToFolder: (token: string, sessionId: number, folderId: number | null) => Promise<void>;
  setActiveFolderId: (folderId: number | null) => void;

  // Export actions
  exportChat: (token: string, sessionId: number, format: "pdf" | "txt", includePinned?: boolean) => Promise<ChatExportResponse | null>;

  // Summary actions
  loadSummary: (token: string, sessionId: number) => Promise<void>;
  generateSummary: (token: string, sessionId: number) => Promise<void>;

  // Suggested prompts actions
  loadSuggestedPrompts: (token: string, mood?: string, hasMessages?: boolean) => Promise<void>;

  // Filter actions
  setFilter: (filter: FilterType) => void;

  // State reset
  reset: () => void;
}

/**
 * Combined chat store type.
 */
type ChatStore = ChatState & ChatActions;

/**
 * Initial state for the chat store.
 */
const initialState: ChatState = {
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
};

/**
 * Zustand store for chat state management.
 */
export const useChatStore = create<ChatStore>()((set, get) => ({
  ...initialState,

  loadSessions: async (token: string) => {
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const { filter } = get();
      const response = (await api.getChatSessions(token, { filter, limit: 50 })) as {
        data: ChatSession[];
      };
      set({ sessions: response.data || [], isLoading: false });
    } catch (error) {
      console.error("ChatStore.loadSessions: failed", error);
      set({ isLoading: false });
    }
  },

  loadSession: async (token: string, sessionId: number) => {
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = (await api.getChatSession(token, sessionId)) as {
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
      const response = (await api.createChatSession(token, title)) as {
        data: ChatSession;
      };
      
      // Move to folder if specified
      if (folderId) {
        await api.moveSessionToFolder(token, response.data.id, folderId);
      }
      
      // Reload sessions and select the new one
      await get().loadSessions(token);
      await get().loadSession(token, response.data.id);
    } catch (error) {
      console.error("ChatStore.createSession: failed", error);
    }
  },

  deleteSession: async (token: string, sessionId: number) => {
    if (!token) return;

    try {
      await api.deleteChatSession(token, sessionId);
      
      const { activeSession } = get();
      if (activeSession?.id === sessionId) {
        set({ activeSession: null, messages: [] });
      }
      
      await get().loadSessions(token);
    } catch (error) {
      console.error("ChatStore.deleteSession: failed", error);
    }
  },

  sendTextMessage: async (token: string, content: string) => {
    const { activeSession } = get();
    if (!token || !activeSession) return;

    set({ isSending: true });

    // Optimistic update
    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content,
      type: "text",
      is_liked: false,
      is_disliked: false,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    try {
      const response = (await api.sendMessage(token, activeSession.id, content)) as {
        data: { user_message: ChatMessage; ai_message: ChatMessage };
      };

      set((state) => ({
        messages: [
          ...state.messages.slice(0, -1),
          response.data.user_message,
          response.data.ai_message,
        ],
        sessions: state.sessions.map((s) =>
          s.id === activeSession.id ? { ...s, last_message: content } : s
        ),
        isSending: false,
      }));
      // Refresh user to update EXP
      await useAuthStore.getState().refreshUser();
    } catch (error) {
      console.error("ChatStore.sendTextMessage: failed", error);
      set((state) => ({
        messages: state.messages.slice(0, -1),
        isSending: false,
      }));
    }
  },

  sendAudioMessage: async (token: string, audioBlob: Blob) => {
    const { activeSession } = get();
    if (!token || !activeSession) return;

    set({ isSending: true, isRecording: true });

    try {
      // Upload audio file
      const audioFile = new File([audioBlob], "voice-note.mp3", { type: "audio/mp3" });
      const uploadRes = await api.uploadAudio(token, audioFile);
      const audioUrl = uploadRes.data.url;

      // Send message with audio type
      const response = (await api.sendMessage(token, activeSession.id, audioUrl, "audio")) as {
        data: { user_message: ChatMessage; ai_message: ChatMessage };
      };

      set((state) => ({
        messages: [
          ...state.messages,
          response.data.user_message,
          response.data.ai_message,
        ],
        sessions: state.sessions.map((s) =>
          s.id === activeSession.id ? { ...s, last_message: "🎤 Pesan Suara" } : s
        ),
        isSending: false,
        isRecording: false,
      }));
    } catch (error) {
      console.error("ChatStore.sendAudioMessage: failed", error);
      alert("Gagal mengirim pesan suara");
      set({ isSending: false, isRecording: false });
    }
  },

  toggleMessageLike: async (token: string, messageId: number, isLike: boolean) => {
    if (!token) return;

    // Optimistic update
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              is_liked: isLike ? !msg.is_liked : false,
              is_disliked: !isLike ? !msg.is_disliked : false,
            }
          : msg
      ),
    }));

    try {
      if (isLike) {
        await api.toggleMessageLike(token, messageId);
      } else {
        await api.toggleMessageDislike(token, messageId);
      }
    } catch (error) {
      console.error("ChatStore.toggleMessageLike: failed", error);
    }
  },

  toggleMessagePin: async (token: string, messageId: number) => {
    if (!token) return;

    // Optimistic update
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, is_pinned: !msg.is_pinned }
          : msg
      ),
    }));

    try {
      await api.toggleMessagePin(token, messageId);
    } catch (error) {
      console.error("ChatStore.toggleMessagePin: failed", error);
      // Revert on error
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_pinned: !msg.is_pinned }
            : msg
        ),
      }));
    }
  },

  toggleFavorite: async (token: string, sessionId: number) => {
    if (!token) return;

    try {
      await api.toggleFavorite(token, sessionId);
      await get().loadSessions(token);

      const { activeSession } = get();
      if (activeSession?.id === sessionId) {
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

  toggleTrash: async (token: string, sessionId: number) => {
    if (!token) return;

    try {
      await api.toggleTrash(token, sessionId);
      await get().loadSessions(token);

      const { activeSession, filter } = get();
      if (activeSession?.id === sessionId) {
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

  setFilter: (filter: FilterType) => {
    set({ filter, activeSession: null, messages: [], currentSummary: null });
  },

  // Folder actions
  loadFolders: async (token: string) => {
    if (!token) return;

    try {
      const response = (await api.getChatFolders(token)) as {
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
      await api.createChatFolder(token, name, color, icon);
      await get().loadFolders(token);
    } catch (error) {
      console.error("ChatStore.createFolder: failed", error);
    }
  },

  updateFolder: async (token: string, folderId: number, data: { name?: string; color?: string; icon?: string }) => {
    if (!token) return;

    try {
      await api.updateChatFolder(token, folderId, data);
      await get().loadFolders(token);
    } catch (error) {
      console.error("ChatStore.updateFolder: failed", error);
    }
  },

  deleteFolder: async (token: string, folderId: number) => {
    if (!token) return;

    try {
      await api.deleteChatFolder(token, folderId);
      
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
      await api.reorderChatFolders(token, folderIds);
      await get().loadFolders(token);
    } catch (error) {
      console.error("ChatStore.reorderFolders: failed", error);
    }
  },

  moveSessionToFolder: async (token: string, sessionId: number, folderId: number | null) => {
    if (!token) return;

    try {
      await api.moveSessionToFolder(token, sessionId, folderId);
      await get().loadSessions(token);
      await get().loadFolders(token);
      
      const { activeSession } = get();
      if (activeSession?.id === sessionId) {
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

  // Export actions
  exportChat: async (token: string, sessionId: number, format: "pdf" | "txt", includePinned?: boolean) => {
    if (!token) return null;

    try {
      const response = (await api.exportChat(token, sessionId, format, includePinned, true)) as {
        data: ChatExportResponse;
      };
      return response.data;
    } catch (error) {
      console.error("ChatStore.exportChat: failed", error);
      return null;
    }
  },

  // Summary actions
  loadSummary: async (token: string, sessionId: number) => {
    if (!token) return;

    try {
      const response = (await api.getChatSummary(token, sessionId)) as {
        data: ChatSessionSummary;
      };
      set({ currentSummary: response.data });
    } catch (error) {
      console.error("ChatStore.loadSummary: failed", error);
      set({ currentSummary: null });
    }
  },

  generateSummary: async (token: string, sessionId: number) => {
    if (!token) return;

    set({ isGeneratingSummary: true });
    try {
      const response = (await api.generateChatSummary(token, sessionId)) as {
        data: ChatSessionSummary;
      };
      set({ currentSummary: response.data, isGeneratingSummary: false });
    } catch (error) {
      console.error("ChatStore.generateSummary: failed", error);
      set({ isGeneratingSummary: false });
      throw error;
    }
  },

  // Suggested prompts actions
  loadSuggestedPrompts: async (token: string, mood?: string, hasMessages?: boolean) => {
    if (!token) return;

    try {
      const response = (await api.getSuggestedPrompts(token, { mood, has_messages: hasMessages })) as {
        data: SuggestedPrompt[];
      };
      set({ suggestedPrompts: response.data || [] });
    } catch (error) {
      console.error("ChatStore.loadSuggestedPrompts: failed", error);
    }
  },

  reset: () => {
    set(initialState);
  },
}));

/**
 * Selector hooks for granular state access.
 */
export const useChatSessions = () => useChatStore((state) => state.sessions);
export const useActiveSession = () => useChatStore((state) => state.activeSession);
export const useChatMessages = () => useChatStore((state) => state.messages);
export const useChatFilter = () => useChatStore((state) => state.filter);
export const useIsSending = () => useChatStore((state) => state.isSending);
export const useIsRecording = () => useChatStore((state) => state.isRecording);
export const useIsChatLoading = () => useChatStore((state) => state.isLoading);
export const useChatFolders = () => useChatStore((state) => state.folders);
export const useActiveFolderId = () => useChatStore((state) => state.activeFolderId);
export const useChatSummary = () => useChatStore((state) => state.currentSummary);
export const useIsGeneratingSummary = () => useChatStore((state) => state.isGeneratingSummary);
export const useSuggestedPrompts = () => useChatStore((state) => state.suggestedPrompts);
