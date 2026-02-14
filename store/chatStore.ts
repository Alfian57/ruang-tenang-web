import { create } from "zustand";
import { ChatStore } from "./chat/types";
import { createSessionSlice } from "./chat/sessionSlice";
import { createMessageSlice } from "./chat/messageSlice";
import { createFolderSlice } from "./chat/folderSlice";
import { createExportSlice } from "./chat/exportSlice";
import { createPromptSlice } from "./chat/promptSlice";

/**
 * Zustand store for chat state management.
 */
export const useChatStore = create<ChatStore>()((...a) => ({
  ...createSessionSlice(...a),
  ...createMessageSlice(...a),
  ...createFolderSlice(...a),
  ...createExportSlice(...a),
  ...createPromptSlice(...a),
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
