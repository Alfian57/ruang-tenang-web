import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { User } from "@/types";
import type {
  CreateReportRequest,
  ModerationQueueItem,
  ModerationStats,
  ModeratorAction,
  ReportType,
  UserReport,
} from "@/types/moderation";

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

const STORY_REPORT_TYPES: ReadonlySet<ReportType> = new Set([
  "story",
  "story_comment",
]);

function parseContentId(contentId: number | string | undefined): number | undefined {
  if (typeof contentId === "number") {
    return Number.isFinite(contentId) ? contentId : undefined;
  }

  if (typeof contentId === "string") {
    const trimmed = contentId.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) return undefined;
    return Number(trimmed);
  }

  return undefined;
}

function normalizeReportPayload(data: CreateReportRequest): CreateReportRequest {
  const description = data.description?.trim() || undefined;

  if (STORY_REPORT_TYPES.has(data.report_type)) {
    if (!data.user_id) {
      throw new Error("Laporan cerita membutuhkan target pengguna yang valid.");
    }

    const contextLabel =
      data.report_type === "story"
        ? "Referensi cerita"
        : "Referensi komentar cerita";
    const contentReference =
      data.content_id !== undefined
        ? `${contextLabel}: ${String(data.content_id)}`
        : contextLabel;

    return {
      report_type: "user",
      user_id: data.user_id,
      reason: data.reason,
      description: description
        ? `${contentReference}\n${description}`
        : contentReference,
    };
  }

  if (data.report_type === "user") {
    return {
      report_type: data.report_type,
      user_id: data.user_id,
      reason: data.reason,
      description,
    };
  }

  const parsedContentId = parseContentId(data.content_id);
  if (!parsedContentId) {
    throw new Error("ID konten untuk laporan tidak valid.");
  }

  return {
    ...data,
    content_id: parsedContentId,
    description,
  };
}

export const moderationService = {
  // Dashboard
  getStats(token: string) {
    return httpClient.get<ApiResponse<ModerationStats>>("/moderation/stats", { token });
  },

  getQueue(token: string, params?: { status?: string; page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<ModerationQueueItem>>("/moderation/queue", { token, params });
  },

  moderateArticle(token: string, articleId: number, data: { action: string; notes?: string; trigger_warnings?: string[] }) {
    return httpClient.put<ApiResponse<null>>(`/moderation/articles/${articleId}`, data, { token });
  },

  // Reports
  getReports(token: string, params?: { status?: string; report_type?: string; reason?: string; page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<UserReport>>("/moderation/reports", { token, params });
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
    return httpClient.get<PaginatedResponse<ModeratorAction>>("/moderation/actions", { token, params });
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
  createReport(token: string, data: CreateReportRequest) {
    const payload = normalizeReportPayload(data);
    return httpClient.post<ApiResponse<null>>("/reports", payload, { token });
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

  // Appeals
  submitAppeal(token: string, data: { reason: string; evidence?: string }) {
    return httpClient.post<ApiResponse<null>>("/appeals", data, { token });
  },
};
