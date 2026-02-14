import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type {
  LevelConfig,
  ExpHistory,
  CommunityStats,
  HallOfFameEntry,
  HallOfFameCategoryInfo,
  LevelHallOfFameResponse,
  PersonalJourney,
  WeeklyProgress,
  LevelUpCelebration,
  FeatureUnlock,
  Badge,
  BadgeProgress,
  UserFeatures,
  UserBadges,
  DailyTask,
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

  getMonthlyHallOfFame() {
    return httpClient.get<ApiResponse<HallOfFameEntry[]>>("/community/hall-of-fame/monthly");
  },

  getHallOfFameCategories() {
    return httpClient.get<ApiResponse<HallOfFameCategoryInfo[]>>("/community/hall-of-fame/categories");
  },

  // Protected
  getPersonalJourney(token: string) {
    return httpClient.get<ApiResponse<PersonalJourney>>("/community/my-journey", { token });
  },

  getWeeklyProgress(token: string) {
    return httpClient.get<ApiResponse<WeeklyProgress>>("/community/my-progress/weekly", { token });
  },

  getMonthlyProgress(token: string) {
    return httpClient.get<ApiResponse<WeeklyProgress>>("/community/my-progress/monthly", { token });
  },

  getAllTimeStats(token: string) {
    return httpClient.get<ApiResponse<PersonalJourney>>("/community/my-stats", { token });
  },

  getLevelUpCelebration(token: string, level: number) {
    return httpClient.get<ApiResponse<LevelUpCelebration>>(`/community/celebrate/${level}`, { token });
  },

  // Features
  getAllFeatures() {
    return httpClient.get<ApiResponse<FeatureUnlock[]>>("/features");
  },

  getFeaturesByCategory(category: string) {
    return httpClient.get<ApiResponse<FeatureUnlock[]>>(`/features/category/${category}`);
  },

  getFeatureCategories() {
    return httpClient.get<ApiResponse<string[]>>("/features/categories");
  },

  getUserFeatures(token: string) {
    return httpClient.get<ApiResponse<UserFeatures>>("/features/my-features", { token });
  },

  checkFeatureAccess(token: string, featureKey: string) {
    return httpClient.get<ApiResponse<{ has_access: boolean; required_level: number }>>(`/features/check/${featureKey}`, { token });
  },

  getUpcomingFeatures(token: string) {
    return httpClient.get<ApiResponse<FeatureUnlock[]>>("/features/upcoming", { token });
  },

  // Badges
  getAllBadges() {
    return httpClient.get<ApiResponse<Badge[]>>("/badges");
  },

  getBadgesByCategory(category: string) {
    return httpClient.get<ApiResponse<Badge[]>>(`/badges/category/${category}`);
  },

  getBadgeCategories() {
    return httpClient.get<ApiResponse<string[]>>("/badges/categories");
  },

  getUserBadges(token: string) {
    return httpClient.get<ApiResponse<UserBadges>>("/badges/my-badges", { token });
  },

  getBadgeProgress(token: string) {
    return httpClient.get<ApiResponse<BadgeProgress[]>>("/badges/progress", { token });
  },

  getRecentlyEarnedBadges(token: string) {
    return httpClient.get<ApiResponse<Badge[]>>("/badges/recent", { token });
  },

  getDisplayBadges(token: string) {
    return httpClient.get<ApiResponse<Badge[]>>("/badges/display", { token });
  },

  checkNewBadges(token: string) {
    return httpClient.post<ApiResponse<Badge[]>>("/badges/check", {}, { token });
  },

  // Leaderboard
  getLeaderboard(limit: number = 10) {
    return httpClient.get<ApiResponse<LeaderboardEntry[]>>("/leaderboard", { params: { limit } as Record<string, string | number | boolean | undefined> });
  },

  // Level configs (public)
  getLevelConfigs() {
    return httpClient.get<ApiResponse<LevelConfig[]>>("/level-configs");
  },

  // EXP History
  getExpHistory(token: string, params?: { page?: number; limit?: number; activity_type?: string; start_date?: string; end_date?: string }) {
    return httpClient.get<PaginatedResponse<ExpHistory>>("/exp-history", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  getActivityTypes(token: string) {
    return httpClient.get<ApiResponse<string[]>>("/exp-history/activity-types", { token });
  },

  // Daily Tasks
  getDailyTasks(token: string) {
    return httpClient.get<ApiResponse<DailyTask[]>>("/daily-tasks", { token });
  },

  claimDailyLogin(token: string) {
    return httpClient.post<ApiResponse<{ exp_earned: number }>>("/daily-tasks/login", {}, { token });
  },

  claimTaskReward(token: string, taskId: number) {
    return httpClient.post<ApiResponse<ClaimTaskResponse>>(`/daily-tasks/${taskId}/claim`, {}, { token });
  },

  claimAllRewards(token: string) {
    return httpClient.post<ApiResponse<{ total_exp_earned: number }>>("/daily-tasks/claim-all", {}, { token });
  },

  getTaskHistory(token: string, params?: { page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<DailyTask>>("/daily-tasks/history", { token, params: params as Record<string, string | number | boolean | undefined> });
  },
};
