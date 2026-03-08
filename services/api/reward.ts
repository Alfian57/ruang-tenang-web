import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type { Reward, RewardClaimResult, RewardClaimListResult } from "@/types";

export const rewardService = {
  // Member endpoints
  getAvailableRewards(token: string) {
    return httpClient.get<ApiResponse<Reward[]>>("/rewards", { token });
  },

  getRewardDetail(token: string, id: number) {
    return httpClient.get<ApiResponse<Reward>>(`/rewards/${id}`, { token });
  },

  claimReward(token: string, id: number) {
    return httpClient.post<ApiResponse<RewardClaimResult>>(`/rewards/${id}/claim`, {}, { token });
  },

  getMyClaims(token: string, params?: { page?: number; page_size?: number }) {
    return httpClient.get<ApiResponse<RewardClaimListResult>>("/rewards/my-claims", {
      token,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  getCoinBalance(token: string) {
    return httpClient.get<ApiResponse<{ gold_coins: number }>>("/rewards/balance", { token });
  },

  getOwnedThemes(token: string) {
    return httpClient.get<ApiResponse<{ owned_themes: string[]; active_theme: string }>>("/rewards/themes", { token });
  },

  activateTheme(token: string, theme: string) {
    return httpClient.put<ApiResponse<{ message: string }>>("/rewards/themes/activate", { theme }, { token });
  },

  // Admin endpoints
  adminGetAllRewards(token: string) {
    return httpClient.get<ApiResponse<Reward[]>>("/admin/rewards", { token });
  },

  adminCreateReward(token: string, data: { name: string; description: string; image?: string; coin_cost: number; stock: number; is_active: boolean }) {
    return httpClient.post<ApiResponse<Reward>>("/admin/rewards", data, { token });
  },

  adminUpdateReward(token: string, id: number, data: Partial<{ name: string; description: string; image: string; coin_cost: number; stock: number; is_active: boolean }>) {
    return httpClient.put<ApiResponse<Reward>>(`/admin/rewards/${id}`, data, { token });
  },

  adminDeleteReward(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/admin/rewards/${id}`, { token });
  },

  adminGetAllClaims(token: string, params?: { page?: number; page_size?: number }) {
    return httpClient.get<ApiResponse<RewardClaimListResult>>("/admin/rewards/claims", {
      token,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },
};
