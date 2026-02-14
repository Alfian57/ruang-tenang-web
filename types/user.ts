// User types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "moderator" | "member";
  exp: number;
  level: number;
  badge_name: string;
  badge_icon: string;
  // Moderation-related fields
  has_accepted_ai_disclaimer?: boolean;
  content_warning_preference?: "show" | "hide_all" | "ask_each_time";
  is_suspended?: boolean;
  suspension_end?: string;
  is_banned?: boolean;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
