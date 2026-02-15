import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { UserMood } from "@/types";

// Mood-specific types
interface MoodStats {
  total_records: number;
  mood_distribution: Record<string, number>;
  average_mood?: number;
  [key: string]: unknown;
}

export interface TodayMoodResponse {
  has_checked: boolean;
  mood: UserMood | null;
}

export const moodService = {
  getHistory(token: string, params?: { start_date?: string; end_date?: string; page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<UserMood>>("/user-moods", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  record(token: string, mood: string) {
    return httpClient.post<ApiResponse<UserMood>>("/user-moods", { mood }, { token });
  },

  getLatest(token: string) {
    return httpClient.get<ApiResponse<UserMood>>("/user-moods/latest", { token });
  },

  checkToday(token: string) {
    return httpClient.get<ApiResponse<TodayMoodResponse>>("/user-moods/today", { token });
  },

  getStats(token: string, days?: number) {
    return httpClient.get<ApiResponse<MoodStats>>("/user-moods/stats", { token, params: days ? { days } : undefined });
  },
};

