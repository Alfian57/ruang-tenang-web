import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type {
  BreathingTechnique,
  BreathingSession,
  BreathingPreferences,
  BreathingStats,
  BreathingCalendar,
  BreathingCalendarDay,
  RecommendationsResponse,
  TechniqueUsageStats,
  SessionCompletionResult,
  SessionHistoryResponse,
} from "@/types/breathing";

interface BreathingWidgetData {
  recent_session?: BreathingSession;
  streak: number;
  recommended_technique?: BreathingTechnique;
}

export const breathingService = {
  // Techniques
  getTechniques(token: string) {
    return httpClient.get<ApiResponse<BreathingTechnique[]>>("/breathing/techniques", { token });
  },

  getTechniqueById(token: string, id: string) {
    return httpClient.get<ApiResponse<BreathingTechnique>>(`/breathing/techniques/${id}`, { token });
  },

  getTechniqueBySlug(token: string, slug: string) {
    return httpClient.get<ApiResponse<BreathingTechnique>>(`/breathing/techniques/slug/${slug}`, { token });
  },

  createTechnique(token: string, data: unknown) {
    return httpClient.post<ApiResponse<BreathingTechnique>>("/breathing/techniques", data, { token });
  },

  updateTechnique(token: string, id: string, data: unknown) {
    return httpClient.put<ApiResponse<BreathingTechnique>>(`/breathing/techniques/${id}`, data, { token });
  },

  deleteTechnique(token: string, id: string) {
    return httpClient.delete<ApiResponse<null>>(`/breathing/techniques/${id}`, { token });
  },

  // Sessions
  getSessions(token: string, params?: { start_date?: string; end_date?: string; technique_id?: string; page?: number; limit?: number }) {
    return httpClient.get<ApiResponse<SessionHistoryResponse>>("/breathing/sessions", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  getSession(token: string, id: string) {
    return httpClient.get<ApiResponse<BreathingSession>>(`/breathing/sessions/${id}`, { token });
  },

  startSession(token: string, data: unknown) {
    return httpClient.post<ApiResponse<BreathingSession>>("/breathing/sessions", data, { token });
  },

  completeSession(token: string, id: string, data: unknown) {
    return httpClient.post<ApiResponse<SessionCompletionResult>>(`/breathing/sessions/${id}/complete`, data, { token });
  },

  // Preferences
  getPreferences(token: string) {
    return httpClient.get<ApiResponse<BreathingPreferences>>("/breathing/preferences", { token });
  },

  updatePreferences(token: string, data: unknown) {
    return httpClient.put<ApiResponse<BreathingPreferences>>("/breathing/preferences", data, { token });
  },

  // Favorites
  getFavorites(token: string) {
    return httpClient.get<ApiResponse<BreathingTechnique[]>>("/breathing/favorites", { token });
  },

  addFavorite(token: string, techniqueId: string) {
    return httpClient.post<ApiResponse<null>>(`/breathing/favorites/${techniqueId}`, {}, { token });
  },

  removeFavorite(token: string, techniqueId: string) {
    return httpClient.delete<ApiResponse<null>>(`/breathing/favorites/${techniqueId}`, { token });
  },

  reorderFavorites(token: string, techniqueIds: string[]) {
    return httpClient.put<ApiResponse<null>>("/breathing/favorites/reorder", techniqueIds, { token });
  },

  // Stats
  getStats(token: string) {
    return httpClient.get<ApiResponse<BreathingStats>>("/breathing/stats", { token });
  },

  getTechniqueUsage(token: string) {
    return httpClient.get<ApiResponse<TechniqueUsageStats[]>>("/breathing/stats/usage", { token });
  },

  getCalendar(token: string, year: number, month: number) {
    return httpClient.get<ApiResponse<BreathingCalendar>>("/breathing/calendar", { token, params: { year, month } });
  },

  // Widget & Recommendations
  getWidgetData(token: string) {
    return httpClient.get<ApiResponse<BreathingWidgetData>>("/breathing/widget", { token });
  },

  getRecommendations(token: string, mood?: string, timeOfDay?: string) {
    return httpClient.get<ApiResponse<RecommendationsResponse>>("/breathing/recommendations", {
      token,
      params: { mood, time_of_day: timeOfDay } as Record<string, string | number | boolean | undefined>,
    });
  },
};
