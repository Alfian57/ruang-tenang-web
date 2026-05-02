import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type {
  WeeklyInsight,
  WellnessJourneyMap,
  WellnessNeedCondition,
  WellnessNeedNowResponse,
  WellnessOnboardingPayload,
  WellnessOnboardingResponse,
  WellnessPlanItem,
  WellnessTourCompleteResponse,
} from "@/types/wellness";

export const wellnessService = {
  getOnboarding(token: string) {
    return httpClient.get<ApiResponse<WellnessOnboardingResponse>>("/wellness/onboarding", { token });
  },

  completeOnboarding(token: string, payload: WellnessOnboardingPayload) {
    return httpClient.post<ApiResponse<WellnessOnboardingResponse>>("/wellness/onboarding", payload, { token });
  },

  getCurrentPlan(token: string) {
    return httpClient.get<ApiResponse<WellnessOnboardingResponse>>("/wellness/plan/current", { token });
  },

  completePlanItem(token: string, itemId: string) {
    return httpClient.request<ApiResponse<WellnessPlanItem>>(`/wellness/plan/items/${itemId}/complete`, {
      method: "PATCH",
      token,
    });
  },

  needNow(token: string, condition: WellnessNeedCondition) {
    return httpClient.post<ApiResponse<WellnessNeedNowResponse>>("/wellness/need-now", { condition }, { token });
  },

  getWeeklyInsight(token: string, weekStart?: string) {
    return httpClient.get<ApiResponse<WeeklyInsight>>("/wellness/weekly-insight", {
      token,
      params: weekStart ? { week_start: weekStart } : undefined,
    });
  },

  completeTour(token: string) {
    return httpClient.post<ApiResponse<WellnessTourCompleteResponse>>("/wellness/tour/complete", {}, { token });
  },

  getJourneyMap(token: string) {
    return httpClient.get<ApiResponse<WellnessJourneyMap>>("/wellness/journey-map", { token });
  },
};
