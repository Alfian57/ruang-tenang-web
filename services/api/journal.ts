import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type {
  Journal,
  JournalSettings,
  JournalAIAccessLog,
  JournalAIContext,
  JournalAnalytics,
  JournalWeeklySummary,
  JournalPrompt,
  JournalExportData,
} from "@/types";

export const journalService = {
  // CRUD
  create(token: string, data: { title: string; content: string; mood_id?: number; tags?: string[]; is_private?: boolean; share_with_ai?: boolean }) {
    return httpClient.post<ApiResponse<Journal>>("/journals", data, { token });
  },

  get(token: string, id: number) {
    return httpClient.get<ApiResponse<Journal>>(`/journals/${id}`, { token });
  },

  update(token: string, id: number, data: { title?: string; content?: string; mood_id?: number; tags?: string[]; is_private?: boolean; share_with_ai?: boolean }) {
    return httpClient.put<ApiResponse<Journal>>(`/journals/${id}`, data, { token });
  },

  delete(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/journals/${id}`, { token });
  },

  list(token: string, params?: { page?: number; limit?: number; tags?: string[]; start_date?: string; end_date?: string; mood_id?: number }) {
    // Handle array tags specially
    const flatParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.page) flatParams.page = params.page;
    if (params?.limit) flatParams.limit = params.limit;
    if (params?.start_date) flatParams.start_date = params.start_date;
    if (params?.end_date) flatParams.end_date = params.end_date;
    if (params?.mood_id) flatParams.mood_id = params.mood_id;
    if (params?.tags && params.tags.length > 0) flatParams.tags = params.tags.join(",");
    return httpClient.get<PaginatedResponse<Journal>>("/journals", { token, params: flatParams });
  },

  search(token: string, query: string, page?: number, limit?: number) {
    return httpClient.get<PaginatedResponse<Journal>>("/journals/search", { token, params: { q: query, page, limit } });
  },

  // Settings
  getSettings(token: string) {
    return httpClient.get<ApiResponse<JournalSettings>>("/journals/settings", { token });
  },

  updateSettings(token: string, data: { allow_ai_access?: boolean; ai_context_days?: number; ai_context_max_entries?: number; default_share_with_ai?: boolean }) {
    return httpClient.put<ApiResponse<JournalSettings>>("/journals/settings", data, { token });
  },

  // AI Integration
  toggleAIShare(token: string, journalId: number) {
    return httpClient.post<ApiResponse<Journal>>(`/journals/${journalId}/toggle-ai-share`, {}, { token });
  },

  getAIContext(token: string) {
    return httpClient.get<ApiResponse<JournalAIContext>>("/journals/ai-context", { token });
  },

  getAIAccessLogs(token: string, page?: number, limit?: number) {
    return httpClient.get<PaginatedResponse<JournalAIAccessLog>>("/journals/ai-access-logs", { token, params: { page, limit } });
  },

  // Analytics
  getAnalytics(token: string) {
    return httpClient.get<ApiResponse<JournalAnalytics>>("/journals/analytics", { token });
  },

  getWritingPrompt(token: string, mood?: string) {
    return httpClient.get<ApiResponse<JournalPrompt>>("/journals/prompt", { token, params: mood ? { mood } : undefined });
  },

  getWeeklySummary(token: string) {
    return httpClient.get<ApiResponse<JournalWeeklySummary>>("/journals/weekly-summary", { token });
  },

  // Export
  export(token: string, format: "txt" | "html", startDate?: string, endDate?: string) {
    return httpClient.post<ApiResponse<JournalExportData>>("/journals/export", undefined, { token, params: { format, start_date: startDate, end_date: endDate } });
  },
};
