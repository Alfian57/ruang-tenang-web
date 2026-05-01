// User types
export type UserRole = "admin" | "user" | "mitra";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  exp: number;
  gold_coins: number;
  level: number;
  badge_name: string;
  badge_icon: string;
  is_premium?: boolean;
  premium_until?: string;
  // Moderation-related fields
  has_accepted_ai_disclaimer?: boolean;
  content_warning_preference?: "show" | "hide_all" | "ask_each_time";
  is_suspended?: boolean;
  suspension_end?: string;
  is_banned?: boolean;
  is_forum_blocked?: boolean;
  profile_theme?: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
