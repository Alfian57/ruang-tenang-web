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
