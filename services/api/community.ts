import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type {
  LevelConfig,
  ExpHistory,
  ExpHistoryResponse,
  CommunityStats,
  LevelHallOfFameResponse,
  PersonalJourney,
  WeeklyProgress,
  UserBadges,
  DailyTask,
  DailyTaskSummary,
  LeaderboardEntry,
  ClaimTaskResponse,
} from "@/types";

export const communityService = {
  // Public
  getStats() {
    return httpClient.get<ApiResponse<CommunityStats>>("/community/stats");
  },

  getLevelHallOfFame(level: number) {
    return httpClient.get<ApiResponse<LevelHallOfFameResponse>>(`/community/hall-of-fame/level/${level}`);
  },

  // Protected
  getPersonalJourney(token: string) {
    return httpClient.get<ApiResponse<PersonalJourney>>("/community/my-journey", { token });
  },

  getWeeklyProgress(token: string) {
    return httpClient.get<ApiResponse<WeeklyProgress>>("/community/my-progress/weekly", { token });
  },

  getUserBadges(token: string) {
    return httpClient.get<ApiResponse<UserBadges>>("/badges/my-badges", { token });
  },

  // Leaderboard
  getLeaderboard(limit: number = 10) {
    return httpClient.get<ApiResponse<LeaderboardEntry[]>>("/leaderboard", { params: { limit } });
  },

  // Level configs (public)
  getLevelConfigs() {
    return httpClient.get<ApiResponse<LevelConfig[]>>("/level-configs");
  },

  // EXP History
  async getExpHistory(token: string, params?: { page?: number; limit?: number; activity_type?: string; start_date?: string; end_date?: string }) {
    const response = await httpClient.get<ApiResponse<ExpHistoryResponse>>("/exp-history", {
      token,
      params,
    });

    const payload = response.data ?? { data: [], total: 0, page: 1, limit: 10, total_pages: 1 };

    return {
      data: Array.isArray(payload.data) ? payload.data : [],
      meta: {
        page: payload.page ?? 1,
        limit: payload.limit ?? 10,
        total_items: payload.total ?? 0,
        total_pages: payload.total_pages ?? 1,
        has_next: (payload.page ?? 1) < (payload.total_pages ?? 1),
        has_prev: (payload.page ?? 1) > 1,
      },
      requestId: response.requestId,
    } as PaginatedResponse<ExpHistory>;
  },

  getActivityTypes(token: string) {
    return httpClient.get<ApiResponse<string[]>>("/exp-history/activity-types", { token });
  },

  // Daily Tasks
  getDailyTasks(token: string) {
    return httpClient.get<ApiResponse<DailyTask[] | DailyTaskSummary>>("/daily-tasks", { token });
  },

  claimTaskReward(token: string, taskId: number) {
    return httpClient.post<ApiResponse<ClaimTaskResponse>>(`/daily-tasks/${taskId}/claim`, {}, { token });
  },

};
