import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { Article, User } from "@/types";
import type { UserReport, ModeratorAction, ModerationStats, ModerationQueueItem } from "@/types/moderation";

interface UserStrike {
  id: number;
  user_id: number;
  reason: string;
  issued_by: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

interface CrisisKeyword {
  id: number;
  keyword: string;
  category: string;
  severity: string;
  language?: string;
  notes?: string;
  created_at: string;
}

interface BlockedUser {
  id: number;
  user_id: number;
  blocked_user_id: number;
  reason?: string;
  created_at: string;
  blocked_user?: User;
}

export const moderationService = {
  // Dashboard
  getStats(token: string) {
    return httpClient.get<ApiResponse<ModerationStats>>("/moderation/stats", { token });
  },

  getQueue(token: string, params?: { status?: string; page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<ModerationQueueItem>>("/moderation/queue", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  moderateArticle(token: string, articleId: number, data: { action: string; notes?: string; trigger_warnings?: string[] }) {
    return httpClient.put<ApiResponse<null>>(`/moderation/articles/${articleId}`, data, { token });
  },

  // Reports
  getReports(token: string, params?: { status?: string; report_type?: string; reason?: string; page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<UserReport>>("/moderation/reports", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  handleReport(token: string, reportId: number, data: { action: string; notes?: string; duration?: number }) {
    return httpClient.put<ApiResponse<null>>(`/moderation/reports/${reportId}`, data, { token });
  },

  // User strikes
  getUserStrikes(token: string, userId: number, activeOnly?: boolean) {
    return httpClient.get<ApiResponse<UserStrike[]>>(`/moderation/users/${userId}/strikes`, { token, params: activeOnly ? { active_only: true } : undefined });
  },

  // Trigger warnings
  addTriggerWarnings(token: string, data: { content_type: string; content_id: number; trigger_warnings: string[] }) {
    return httpClient.post<ApiResponse<null>>("/moderation/trigger-warnings", data, { token });
  },

  // Action logs
  getActions(token: string, params?: { moderator_id?: number; action_type?: string; target_type?: string; page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<ModeratorAction>>("/moderation/actions", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  // Crisis keywords
  getCrisisKeywords(token: string) {
    return httpClient.get<ApiResponse<CrisisKeyword[]>>("/moderation/crisis-keywords", { token });
  },

  createCrisisKeyword(token: string, data: { keyword: string; category: string; severity: string; language?: string; notes?: string }) {
    return httpClient.post<ApiResponse<CrisisKeyword>>("/moderation/crisis-keywords", data, { token });
  },

  deleteCrisisKeyword(token: string, keywordId: number) {
    return httpClient.delete<ApiResponse<null>>(`/moderation/crisis-keywords/${keywordId}`, { token });
  },

  // User reports (any user)
  createReport(token: string, data: { report_type: string; content_id?: number | string; user_id?: number; reason: string; description?: string }) {
    return httpClient.post<ApiResponse<null>>("/reports", data, { token });
  },

  // User blocking
  getBlockedUsers(token: string) {
    return httpClient.get<ApiResponse<BlockedUser[]>>("/blocks", { token });
  },

  blockUser(token: string, userId: number, reason?: string) {
    return httpClient.post<ApiResponse<null>>("/blocks", { user_id: userId, reason }, { token });
  },

  unblockUser(token: string, userId: number) {
    return httpClient.delete<ApiResponse<null>>(`/blocks/${userId}`, { token });
  },

  // User settings
  acceptAIDisclaimer(token: string) {
    return httpClient.post<ApiResponse<null>>("/user/accept-ai-disclaimer", {}, { token });
  },

  updateContentWarningPreference(token: string, preference: string) {
    return httpClient.put<ApiResponse<null>>("/user/content-warning-preference", { preference }, { token });
  },
};
