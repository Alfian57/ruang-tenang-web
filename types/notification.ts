// Notification Types

export interface Notification {
  id: string;
  type: "heart" | "story_approved" | "story_rejected" | "badge_earned" | "level_up";
  title: string;
  message: string;
  is_read: boolean;
  data?: string; // JSON string with metadata
  created_at: string;
}

export interface NotificationList {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  unread_count: number;
}

export interface NotificationUnreadCount {
  unread_count: number;
}
