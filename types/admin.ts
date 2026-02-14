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
