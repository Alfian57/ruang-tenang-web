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
}

// Chat types
export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  is_favorite: boolean;
  is_trash: boolean;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
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
  created_at: string;
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
  item_count: number;
  created_at: string;
  updated_at: string;
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

