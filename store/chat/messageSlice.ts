import { StateCreator } from "zustand";
import { toast } from "sonner";
import { ChatStore, ChatMessageState, ChatMessageActions } from "./types";
import { chatService, uploadService } from "@/services/api";
import { ChatMessage } from "@/types";
import { useAuthStore } from "../authStore";

export const createMessageSlice: StateCreator<ChatStore, [], [], ChatMessageState & ChatMessageActions> = (set, get) => ({
  messages: [],
  isSending: false,
  isRecording: false,

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
      is_pinned: false,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    try {
      const response = (await chatService.sendMessage(token, activeSession.uuid, content)) as {
        data: { user_message: ChatMessage; ai_message: ChatMessage };
      };

      set((state) => ({
        messages: [
          ...state.messages.slice(0, -1),
          response.data.user_message,
          response.data.ai_message,
        ],
        // Update last message in session list
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
      const uploadRes = await uploadService.uploadAudio(token, audioFile);
      const audioUrl = uploadRes.data.url;

      // Send message with audio type
      const response = (await chatService.sendMessage(token, activeSession.uuid, audioUrl, "audio")) as {
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
      toast.error("Gagal mengirim pesan suara", {
        description: "Silakan coba lagi."
      });
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
        await chatService.toggleLike(token, messageId);
      } else {
        await chatService.toggleDislike(token, messageId);
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
      await chatService.togglePin(token, messageId);
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
});
