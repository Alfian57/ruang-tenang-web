// ==========================================
// Guild / Party System Types
// ==========================================

export interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  banner: string;
  leader_id: number;
  leader_name: string;
  max_members: number;
  member_count: number;
  total_xp: number;
  level: number;
  is_public: boolean;
  invite_code?: string;
  created_at: string;
}

export interface GuildMember {
  id: string;
  user_id: number;
  username: string;
  name: string;
  avatar: string;
  role: "leader" | "admin" | "member";
  xp_contributed: number;
  user_level: number;
  joined_at: string;
}

export interface GuildChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: GuildChallengeType;
  target_value: number;
  current_value: number;
  progress_percent: number;
  xp_reward: number;
  coin_reward: number;
  starts_at: string;
  ends_at: string;
  is_completed: boolean;
  is_expired: boolean;
  is_active: boolean;
  is_claimed?: boolean;
  can_claim?: boolean;
  top_contributors?: GuildChallengeContributor[];
  created_at: string;
}

export type GuildChallengeType =
  | "total_xp"
  | "total_tasks"
  | "total_breathing"
  | "total_journals"
  | "total_chats"
  | "total_streak_days";

export interface GuildChallengeContributor {
  user_id: number;
  username: string;
  name: string;
  avatar: string;
  value: number;
}

export interface GuildActivity {
  id: string;
  activity_type: string;
  description: string;
  username?: string;
  avatar?: string;
  created_at: string;
}

export interface GuildDetail extends Guild {
  members: GuildMember[];
  active_challenges: GuildChallenge[];
  recent_activities: GuildActivity[];
  is_current_user_guild: boolean;
  current_user_role?: string;
}

export interface GuildLeaderboardEntry {
  id: string;
  name: string;
  icon: string;
  total_xp: number;
  level: number;
  member_count: number;
  rank: number;
}

export interface MyGuildInfo {
  guild?: Guild;
  member_role?: string;
  xp_contributed: number;
  is_member: boolean;
}

// Request types
export interface CreateGuildRequest {
  name: string;
  description: string;
  icon?: string;
  is_public: boolean;
}

export interface UpdateGuildRequest {
  name?: string;
  description?: string;
  icon?: string;
  banner?: string;
  is_public?: boolean;
}

