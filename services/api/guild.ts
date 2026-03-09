import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type {
  Guild,
  GuildDetail,
  GuildLeaderboardEntry,
  MyGuildInfo,
  GuildChallenge,
  GuildActivity,
  CreateGuildRequest,
  UpdateGuildRequest,
  CreateGuildChallengeRequest,
} from "@/types/guild";

export const guildService = {
  // ==========================================
  // Guild CRUD
  // ==========================================

  getPublicGuilds(token: string, params?: { page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<Guild>>("/guilds", {
      token,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  getGuild(token: string, guildId: string) {
    return httpClient.get<ApiResponse<GuildDetail>>(`/guilds/${guildId}`, { token });
  },

  createGuild(token: string, data: CreateGuildRequest) {
    return httpClient.post<ApiResponse<Guild>>("/guilds", data, { token });
  },

  updateGuild(token: string, guildId: string, data: UpdateGuildRequest) {
    return httpClient.put<ApiResponse<Guild>>(`/guilds/${guildId}`, data, { token });
  },

  deleteGuild(token: string, guildId: string) {
    return httpClient.delete<ApiResponse<null>>(`/guilds/${guildId}`, { token });
  },

  // ==========================================
  // Guild Info
  // ==========================================

  getMyGuild(token: string) {
    return httpClient.get<ApiResponse<MyGuildInfo>>("/guilds/my-guild", { token });
  },

  getLeaderboard(token: string, limit?: number) {
    return httpClient.get<ApiResponse<GuildLeaderboardEntry[]>>("/guilds/leaderboard", {
      token,
      params: { limit },
    });
  },

  // ==========================================
  // Membership
  // ==========================================

  joinGuild(token: string, guildId: string) {
    return httpClient.post<ApiResponse<null>>(`/guilds/${guildId}/join`, {}, { token });
  },

  joinByInviteCode(token: string, code: string) {
    return httpClient.post<ApiResponse<Guild>>(`/guilds/join/${code}`, {}, { token });
  },

  leaveGuild(token: string, guildId: string) {
    return httpClient.post<ApiResponse<null>>(`/guilds/${guildId}/leave`, {}, { token });
  },

  kickMember(token: string, guildId: string, userId: number) {
    return httpClient.post<ApiResponse<null>>(`/guilds/${guildId}/kick/${userId}`, {}, { token });
  },

  promoteMember(token: string, guildId: string, userId: number) {
    return httpClient.post<ApiResponse<null>>(`/guilds/${guildId}/promote/${userId}`, {}, { token });
  },

  transferLeadership(token: string, guildId: string, userId: number) {
    return httpClient.post<ApiResponse<null>>(`/guilds/${guildId}/transfer/${userId}`, {}, { token });
  },

  // ==========================================
  // Challenges
  // ==========================================

  createChallenge(token: string, guildId: string, data: CreateGuildChallengeRequest) {
    return httpClient.post<ApiResponse<GuildChallenge>>(`/guilds/${guildId}/challenges`, data, { token });
  },

  getActiveChallenges(token: string, guildId: string) {
    return httpClient.get<ApiResponse<GuildChallenge[]>>(`/guilds/${guildId}/challenges`, { token });
  },

  getChallengeHistory(token: string, guildId: string, params?: { page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<GuildChallenge>>(`/guilds/${guildId}/challenges/history`, {
      token,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  // ==========================================
  // Activities
  // ==========================================

  getRecentActivities(token: string, guildId: string, limit?: number) {
    return httpClient.get<ApiResponse<GuildActivity[]>>(`/guilds/${guildId}/activities`, {
      token,
      params: { limit },
    });
  },
};
