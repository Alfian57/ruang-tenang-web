// Re-export gamification types
export * from "./gamification";
export * from "./forum";
export * from "./moderation";

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

// Article types
export interface ArticleCategory {
  id: number;
  name: string;
  description?: string;
  article_count?: number;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  thumbnail: string;
  content: string;
  excerpt?: string;
  category_id: number;
  category: ArticleCategory;
  created_at: string;
  updated_at: string;
  user_id?: number;
  author?: {
    id: number;
    name: string;
  };
}

// Chat types
export interface ChatFolder {
  id: number;
  name: string;
  color: string;
  icon: string;
  position: number;
  session_count: number;
  created_at: string;
}

export interface ChatSession {
  id: number;
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

// Song types
export interface SongCategory {
  id: number;
  name: string;
  thumbnail: string;
  song_count?: number;
  created_at: string;
}

export interface Song {
  id: number;
  title: string;
  file_path: string;
  thumbnail: string;
  category_id: number;
  category?: SongCategory;
  created_at: string;
}

// Playlist types
export interface Playlist {
  id: number;
  user_id: number;
  name: string;
  description: string;
  thumbnail: string;
  is_public: boolean;
  is_admin_playlist: boolean;
  item_count: number;
  total_songs: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
  items?: PlaylistItem[];
}

export interface PlaylistItem {
  id: number;
  playlist_id: number;
  song_id: number;
  position: number;
  added_at: string;
  song?: Song;
}

export interface PlaylistListItem {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  is_public: boolean;
  is_admin_playlist: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  thumbnail?: string;
  is_public?: boolean;
}

export interface UpdatePlaylistRequest {
  name: string;
  description?: string;
  thumbnail?: string;
  is_public?: boolean;
}

// Mood types
export type MoodType = "happy" | "neutral" | "angry" | "disappointed" | "sad" | "crying";

export interface UserMood {
  id: number;
  mood: MoodType;
  emoji: string;
  created_at: string;
}

export interface MoodHistory {
  moods: UserMood[];
  total_count: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

// ==================== JOURNAL TYPES ====================

export interface Journal {
  id: number;
  user_id: number;
  title: string;
  content: string;
  mood_id?: number;
  mood_label?: string;
  mood_emoji?: string;
  tags: string[];
  is_private: boolean;
  share_with_ai: boolean;
  ai_accessed_at?: string;
  word_count: number;
  sentiment_score?: number;
  created_at: string;
  updated_at: string;
}

export interface JournalSettings {
  id: number;
  user_id: number;
  allow_ai_access: boolean;
  ai_context_days: number;
  ai_context_max_entries: number;
  default_share_with_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalAIAccessLog {
  id: number;
  journal_id: number;
  chat_session_id: number;
  context_type: string;
  accessed_at: string;
  journal?: {
    id: number;
    title: string;
    created_at: string;
  };
}

export interface JournalAIContext {
  journals: JournalAIContextEntry[];
  total_shared: number;
  settings: JournalSettings;
  context_text: string;
}

export interface JournalAIContextEntry {
  id: number;
  title: string;
  content_preview: string;
  mood_label?: string;
  mood_emoji?: string;
  tags: string[];
  created_at: string;
}

export interface JournalAnalytics {
  total_entries: number;
  entries_this_month: number;
  total_word_count: number;
  avg_word_count: number;
  mood_distribution: Record<string, number>;
  top_tags: Array<{ tag: string; count: number }>;
  entries_by_month: Array<{ month: string; count: number }>;
  writing_streak: number;
  shared_with_ai_count: number;
}

export interface JournalWeeklySummary {
  week_start: string;
  week_end: string;
  entry_count: number;
  total_words: number;
  dominant_mood?: string;
  key_themes: string[];
  ai_summary: string;
  recommendations: string[];
}

export interface JournalPrompt {
  prompt: string;
  category: string;
  generated_at: string;
}

export interface JournalExportData {
  filename: string;
  content_type: string;
  content: string;
  entry_count: number;
}

// Journal Request/Response types
export interface CreateJournalRequest {
  title: string;
  content: string;
  mood_id?: number;
  tags?: string[];
  is_private?: boolean;
  share_with_ai?: boolean;
}

export interface UpdateJournalRequest {
  title?: string;
  content?: string;
  mood_id?: number;
  tags?: string[];
  is_private?: boolean;
  share_with_ai?: boolean;
}

export interface JournalListParams {
  page?: number;
  limit?: number;
  tags?: string[];
  start_date?: string;
  end_date?: string;
  mood_id?: number;
}

export interface UpdateJournalSettingsRequest {
  allow_ai_access?: boolean;
  ai_context_days?: number;
  ai_context_max_entries?: number;
  default_share_with_ai?: boolean;
}

export interface ExportJournalRequest {
  format: "txt" | "html";
  start_date?: string;
  end_date?: string;
}

export interface JournalListResponse {
  data: Journal[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

