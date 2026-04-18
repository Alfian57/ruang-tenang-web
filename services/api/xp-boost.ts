import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type { XPBoostStatus, XPMultiplierStatus } from "@/types";

export const xpBoostService = {
  getActiveBoost(token: string) {
    return httpClient.get<ApiResponse<XPBoostStatus>>("/xp-boost/active", { token });
  },

  getEffectiveMultiplier(token: string) {
    return httpClient.get<ApiResponse<XPMultiplierStatus>>("/xp-boost/multiplier", { token });
  },
};
