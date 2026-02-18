import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type { NotificationList, NotificationUnreadCount } from "@/types";

export const notificationService = {
  getNotifications(token: string, params?: { page?: number; limit?: number; unread_only?: boolean }) {
    return httpClient.get<ApiResponse<NotificationList>>("/notifications", {
      token,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  getUnreadCount(token: string) {
    return httpClient.get<ApiResponse<NotificationUnreadCount>>("/notifications/unread-count", { token });
  },

  markAsRead(token: string, notificationId: string) {
    return httpClient.post<ApiResponse<null>>(`/notifications/${notificationId}/read`, {}, { token });
  },

  markAllAsRead(token: string) {
    return httpClient.post<ApiResponse<null>>("/notifications/read-all", {}, { token });
  },
};
