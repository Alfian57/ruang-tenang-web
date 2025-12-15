// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
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
  title: string;
  is_bookmarked: boolean;
  is_favorite: boolean;
  last_message?: string;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "ai";
  content: string;
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
