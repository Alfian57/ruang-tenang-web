import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";

export interface BroadcastNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  url: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
  scheduled_at: string | null;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
  created_by: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBroadcastPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  scheduled_at?: string;
}

export interface UpdateBroadcastPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  scheduled_at?: string;
}

export const broadcastService = {
  getAll(token: string, params?: { page?: number; limit?: number; search?: string }) {
    return httpClient.get<PaginatedResponse<BroadcastNotification>>("/admin/broadcasts", {
      token,
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
      },
    });
  },

  getById(token: string, id: string) {
    return httpClient.get<ApiResponse<BroadcastNotification>>(`/admin/broadcasts/${id}`, { token });
  },

  create(token: string, data: CreateBroadcastPayload) {
    return httpClient.post<ApiResponse<BroadcastNotification>>("/admin/broadcasts", data, { token });
  },

  update(token: string, id: string, data: UpdateBroadcastPayload) {
    return httpClient.put<ApiResponse<BroadcastNotification>>(`/admin/broadcasts/${id}`, data, { token });
  },

  delete(token: string, id: string) {
    return httpClient.delete<ApiResponse<null>>(`/admin/broadcasts/${id}`, { token });
  },

  sendNow(token: string, id: string) {
    return httpClient.post<ApiResponse<BroadcastNotification>>(`/admin/broadcasts/${id}/send`, {}, { token });
  },

  cancel(token: string, id: string) {
    return httpClient.post<ApiResponse<BroadcastNotification>>(`/admin/broadcasts/${id}/cancel`, {}, { token });
  },
};
