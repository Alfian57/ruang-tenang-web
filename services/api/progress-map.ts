import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type { FullMapResponse, MapProgressSummary, MapRegion } from "@/types/progress-map";

export const progressMapService = {
  getFullMap(token: string) {
    return httpClient.get<ApiResponse<FullMapResponse>>("/map", { token });
  },

  getProgressSummary(token: string) {
    return httpClient.get<ApiResponse<MapProgressSummary>>("/map/summary", { token });
  },

  getRegionDetail(token: string, regionKey: string) {
    return httpClient.get<ApiResponse<MapRegion>>(`/map/regions/${regionKey}`, { token });
  },

  claimLandmarkReward(token: string, landmarkId: string) {
    return httpClient.post<ApiResponse<null>>(`/map/landmarks/${landmarkId}/claim`, {}, { token });
  },
};
