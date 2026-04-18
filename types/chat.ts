import type { User } from "./user";

// Chat types
export interface ChatFolder {
  id: number;
  uuid: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  session_count: number;
  created_at: string;
}

export interface ChatSession {
  id: number;
  uuid: string;
  user_id: number;
  title: string;
  folder_id?: number;
  folder_name?: string;
  summary?: string;
  summary_generated_at?: string;
  is_favorite: boolean;
  is_trash: boolean;
  has_summary?: boolean;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
  pinned_messages?: ChatMessage[];
  last_message?: string;
  user?: User;
}

export interface ChatMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  type?: "text" | "audio";
  is_liked: boolean;
  is_disliked: boolean;
  is_pinned: boolean;
  created_at: string;
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  ai_message: ChatMessage;
}

export type ChatSessionIntent = "general" | "grounding" | "planning" | "reflection" | "coping";

export interface ChatMessageContextHints {
  current_mood?: string;
  session_intent?: ChatSessionIntent;
  enable_mood_context?: boolean;
  enable_journal_context?: boolean;
  enable_daily_task_context?: boolean;
  enable_xp_level_context?: boolean;
  enable_breathing_context?: boolean;
  enable_playlist_context?: boolean;
  enable_rewards_context?: boolean;
  enable_progress_map_context?: boolean;
  enable_social_context?: boolean;
}

export interface SendMessageMetadata {
  source?: string;
  prompt_id?: string;
}

export interface SendMessageOptions {
  context?: ChatMessageContextHints;
  metadata?: SendMessageMetadata;
}

export interface ChatContextPreferences {
  enable_mood_context: boolean;
  enable_journal_context: boolean;
  enable_daily_task_context: boolean;
  enable_xp_level_context: boolean;
  enable_breathing_context: boolean;
  enable_playlist_context: boolean;
  enable_rewards_context: boolean;
  enable_progress_map_context: boolean;
  enable_social_context: boolean;
  session_intent: ChatSessionIntent;
}

export interface ChatContextPreferencesUpdate {
  enable_mood_context?: boolean;
  enable_journal_context?: boolean;
  enable_daily_task_context?: boolean;
  enable_xp_level_context?: boolean;
  enable_breathing_context?: boolean;
  enable_playlist_context?: boolean;
  enable_rewards_context?: boolean;
  enable_progress_map_context?: boolean;
  enable_social_context?: boolean;
  session_intent?: ChatSessionIntent;
}

export interface ChatContextMood {
  mood: string;
  emoji: string;
}

export interface ChatContextDailyTask {
  completed: number;
  pending: number;
}

export interface ChatContextXPLevel {
  exp: number;
  current_streak: number;
  current_level?: number;
  next_level?: number;
}

export interface ChatContextBreathing {
  sessions_today: number;
  sessions_last_7_days: number;
  most_used_technique?: string;
}

export interface ChatContextPlaylist {
  total_playlists: number;
  total_saved_songs: number;
  latest_playlist_title?: string;
}

export interface ChatContextRewards {
  gold_coins: number;
  claim_count: number;
  latest_reward_name?: string;
}

export interface ChatContextProgressMap {
  unlocked_regions: number;
  unlocked_landmarks: number;
  latest_unlock_name?: string;
}

export interface ChatContextSocial {
  badge_count: number;
  guild_name?: string;
  guild_role?: string;
  guild_member_count?: number;
}

export interface ChatContextRuntime {
  mood?: ChatContextMood;
  journal_shared_count: number;
  daily_task?: ChatContextDailyTask;
  xp_level?: ChatContextXPLevel;
  breathing?: ChatContextBreathing;
  playlist?: ChatContextPlaylist;
  rewards?: ChatContextRewards;
  progress_map?: ChatContextProgressMap;
  social?: ChatContextSocial;
  effective_sources: string[];
}

export interface ChatContextState {
  session_uuid: string;
  preferences: ChatContextPreferences;
  runtime: ChatContextRuntime;
}

export interface ChatSessionSummary {
  session_id: number;
  summary: string;
  main_topics?: string[];
  key_insights?: string[];
  action_items?: string[];
  sentiment?: "positive" | "neutral" | "negative" | "mixed";
  generated_at: string;
}

export interface ChatExportResponse {
  filename: string;
  content_type: string;
  content: string;
  size: number;
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  category: "mood" | "general" | "time_based" | "follow_up";
  icon?: string;
}
