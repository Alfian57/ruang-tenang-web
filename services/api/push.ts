import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";

interface VAPIDKeyResponse {
  public_key: string;
}

export const pushService = {
  getVAPIDKey() {
    return httpClient.get<ApiResponse<VAPIDKeyResponse>>("/push/vapid-key");
  },

  subscribe(token: string, subscription: { endpoint: string; p256dh: string; auth: string }) {
    return httpClient.post<ApiResponse<null>>("/push/subscribe", subscription, { token });
  },

  unsubscribe(token: string, endpoint: string) {
    return httpClient.post<ApiResponse<null>>("/push/unsubscribe", { endpoint }, { token });
  },
};
