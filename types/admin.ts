import type { UserRole } from "./user";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  is_blocked: boolean;
  is_banned?: boolean;
  is_suspended?: boolean;
  suspension_end?: string | null;
  journal_blocked?: boolean;
  is_forum_blocked?: boolean;
  created_at: string;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    this_month: number;
    growth: number;
    chart_data: number[];
  };
  articles: {
    total: number;
    this_month: number;
    blocked: number;
    categories: number;
  };
  chat_sessions: {
    total: number;
    today: number;
    chart_data: number[];
  };
  messages: {
    total: number;
    today: number;
  };
  songs: {
    total: number;
    categories: number;
  };
  moods: {
    total: number;
    today: number;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    is_blocked: boolean;
    created_at: string;
  }>;
}
