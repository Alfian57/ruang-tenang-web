import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { ChatSession, ChatMessage, ChatSessionSummary, ChatExportResponse, SuggestedPrompt, ChatFolder, SendMessageResponse } from "@/types";

export const chatService = {
  getSessions(token: string, params?: { filter?: string; search?: string; page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<ChatSession>>("/chat-sessions", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  getSession(token: string, id: number) {
    return httpClient.get<ApiResponse<ChatSession>>(`/chat-sessions/${id}`, { token });
  },

  createSession(token: string, title?: string) {
    return httpClient.post<ApiResponse<ChatSession>>("/chat-sessions", { title }, { token });
  },

  updateSession(token: string, id: number, data: { title?: string }) {
    return httpClient.put<ApiResponse<ChatSession>>(`/chat-sessions/${id}`, data, { token });
  },

  deleteSession(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/chat-sessions/${id}`, { token });
  },

  sendMessage(token: string, sessionId: number, content: string, type: "text" | "audio" = "text") {
    return httpClient.post<ApiResponse<SendMessageResponse>>(`/chat-sessions/${sessionId}/messages`, { content, type }, { token, timeout: 60000 });
  },

  toggleFavorite(token: string, id: number) {
    return httpClient.put<ApiResponse<ChatSession>>(`/chat-sessions/${id}/favorite`, undefined, { token });
  },

  moveToTrash(token: string, id: number) {
    return httpClient.put<ApiResponse<null>>(`/chat-sessions/${id}/trash`, undefined, { token });
  },

  restoreFromTrash(token: string, id: number) {
    return httpClient.put<ApiResponse<null>>(`/chat-sessions/${id}/restore`, undefined, { token });
  },

  permanentDelete(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/chat-sessions/${id}/permanent`, { token });
  },

  emptyTrash(token: string) {
    return httpClient.delete<ApiResponse<null>>("/chat-sessions/trash/empty", { token });
  },

  toggleTrash(token: string, id: number) {
    return this.moveToTrash(token, id);
  },

  // Message actions
  toggleLike(token: string, messageId: number) {
    return httpClient.put<ApiResponse<ChatMessage>>(`/chat-messages/${messageId}/like`, undefined, { token });
  },

  toggleDislike(token: string, messageId: number) {
    return httpClient.put<ApiResponse<ChatMessage>>(`/chat-messages/${messageId}/dislike`, undefined, { token });
  },

  togglePin(token: string, messageId: number) {
    return httpClient.put<ApiResponse<ChatMessage>>(`/chat-messages/${messageId}/pin`, undefined, { token });
  },

  regenerateMessage(token: string, messageId: number) {
    return httpClient.post<ApiResponse<ChatMessage>>(`/chat-messages/${messageId}/regenerate`, {}, { token, timeout: 60000 });
  },

  // Summary
  getSummary(token: string, sessionId: number) {
    return httpClient.get<ApiResponse<ChatSessionSummary>>(`/chat-sessions/${sessionId}/summary`, { token });
  },

  generateSummary(token: string, sessionId: number) {
    return httpClient.post<ApiResponse<ChatSessionSummary>>(`/chat-sessions/${sessionId}/summary`, {}, { token, timeout: 60000 });
  },

  // Export
  exportSession(token: string, sessionId: number, format: "txt" | "json" | "pdf") {
    return httpClient.get<ApiResponse<ChatExportResponse>>(`/chat-sessions/${sessionId}/export`, { token, params: { format } });
  },

  // Suggested prompts
  getSuggestedPrompts(token: string) {
    return httpClient.get<ApiResponse<SuggestedPrompt[]>>("/chat-sessions/suggested-prompts", { token });
  },

  // Folders
  getFolders(token: string) {
    return httpClient.get<ApiResponse<ChatFolder[]>>("/chat-folders", { token });
  },

  createFolder(token: string, data: { name: string; color?: string; icon?: string }) {
    return httpClient.post<ApiResponse<ChatFolder>>("/chat-folders", data, { token });
  },

  updateFolder(token: string, id: number, data: { name?: string; color?: string; icon?: string }) {
    return httpClient.put<ApiResponse<ChatFolder>>(`/chat-folders/${id}`, data, { token });
  },

  deleteFolder(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/chat-folders/${id}`, { token });
  },

  moveToFolder(token: string, sessionId: number, folderId: number | null) {
    return httpClient.put<ApiResponse<null>>(`/chat-sessions/${sessionId}/folder`, { folder_id: folderId }, { token });
  },

  reorderFolders(token: string, folderIds: number[]) {
    return httpClient.put<ApiResponse<null>>("/chat-folders/reorder", { folder_ids: folderIds }, { token });
  },
};
