import { StateCreator } from "zustand";
import { ChatStore, ChatPromptState, ChatPromptActions } from "./types";
import { chatService } from "@/services/api";
import { SuggestedPrompt } from "@/types";

export const createPromptSlice: StateCreator<ChatStore, [], [], ChatPromptState & ChatPromptActions> = (set, get) => ({
  suggestedPrompts: [],

  loadSuggestedPrompts: async (token: string, mood?: string, hasMessages?: boolean) => {
    if (!token) return;

    try {
      const response = (await chatService.getSuggestedPrompts(token)) as {
        data: SuggestedPrompt[];
      };
      set({ suggestedPrompts: response.data || [] });
    } catch (error) {
      console.error("ChatStore.loadSuggestedPrompts: failed", error);
    }
  },
});
