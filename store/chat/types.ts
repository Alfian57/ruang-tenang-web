import { ChatSession, ChatMessage, ChatFolder, ChatSessionSummary, SuggestedPrompt, ChatExportResponse } from "@/types";

export type FilterType = "all" | "favorites" | "trash";

export interface ChatSessionState {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  filter: FilterType;
  isLoading: boolean;
}

export interface ChatSessionActions {
  loadSessions: (token: string) => Promise<void>;
  loadSession: (token: string, sessionId: number) => Promise<void>;
  createSession: (token: string, title: string, folderId?: number) => Promise<void>;
  deleteSession: (token: string, sessionId: number) => Promise<void>;
  toggleFavorite: (token: string, sessionId: number) => Promise<void>;
  toggleTrash: (token: string, sessionId: number) => Promise<void>;
  setFilter: (filter: FilterType) => void;
  reset: () => void;
  clearActiveSession: () => void;
}

export interface ChatMessageState {
  messages: ChatMessage[];
  isSending: boolean;
  isRecording: boolean;
}

export interface ChatMessageActions {
  sendTextMessage: (token: string, content: string) => Promise<void>;
  sendAudioMessage: (token: string, audioBlob: Blob) => Promise<void>;
  toggleMessageLike: (token: string, messageId: number, isLike: boolean) => Promise<void>;
  toggleMessagePin: (token: string, messageId: number) => Promise<void>;
}

export interface ChatFolderState {
  folders: ChatFolder[];
  activeFolderId: number | null;
}

export interface ChatFolderActions {
  loadFolders: (token: string) => Promise<void>;
  createFolder: (token: string, name: string, color?: string, icon?: string) => Promise<void>;
  updateFolder: (token: string, folderId: number, data: { name?: string; color?: string; icon?: string }) => Promise<void>;
  deleteFolder: (token: string, folderId: number) => Promise<void>;
  reorderFolders: (token: string, folderIds: number[]) => Promise<void>;
  moveSessionToFolder: (token: string, sessionId: number, folderId: number | null) => Promise<void>;
  setActiveFolderId: (folderId: number | null) => void;
}

export interface ChatExportState {
  currentSummary: ChatSessionSummary | null;
  isGeneratingSummary: boolean;
}

export interface ChatExportActions {
  exportChat: (token: string, sessionId: number, format: "pdf" | "txt", includePinned?: boolean) => Promise<ChatExportResponse | null>;
  loadSummary: (token: string, sessionId: number) => Promise<void>;
  generateSummary: (token: string, sessionId: number) => Promise<void>;
}

export interface ChatPromptState {
  suggestedPrompts: SuggestedPrompt[];
}

export interface ChatPromptActions {
  loadSuggestedPrompts: (token: string, mood?: string, hasMessages?: boolean) => Promise<void>;
}

// Combined State and Actions
export type ChatState = ChatSessionState & ChatMessageState & ChatFolderState & ChatExportState & ChatPromptState;
export type ChatActions = ChatSessionActions & ChatMessageActions & ChatFolderActions & ChatExportActions & ChatPromptActions;

export type ChatStore = ChatState & ChatActions;
