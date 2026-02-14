// Level Config types
export interface LevelConfig {
  id: number;
  level: number;
  min_exp: number;
  badge_name: string;
  badge_icon: string;
  created_at: string;
  updated_at: string;
}

// EXP History types
export interface ExpHistory {
  id: number;
  activity_type: string;
  points: number;
  description: string;
  created_at: string;
}

export interface ExpHistoryResponse {
  data: ExpHistory[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
