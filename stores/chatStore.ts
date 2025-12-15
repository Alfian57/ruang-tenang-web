import { create } from "zustand";
import { api } from "@/lib/api";
import { ChatSession, ChatMessage } from "@/types";

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
  createSession: (token: string, title: string) => Promise<void>;
  deleteSession: (token: string, sessionId: number) => Promise<void>;

  // Message actions
  sendTextMessage: (token: string, content: string) => Promise<void>;
  sendAudioMessage: (token: string, audioBlob: Blob) => Promise<void>;
  toggleMessageLike: (token: string, messageId: number, isLike: boolean) => Promise<void>;

  // Session toggle actions
  toggleFavorite: (token: string, sessionId: number) => Promise<void>;
  toggleTrash: (token: string, sessionId: number) => Promise<void>;

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

  createSession: async (token: string, title: string) => {
    if (!token || !title.trim()) return;

    try {
      const response = (await api.createChatSession(token, title)) as {
        data: ChatSession;
      };
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
    set({ filter, activeSession: null, messages: [] });
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
