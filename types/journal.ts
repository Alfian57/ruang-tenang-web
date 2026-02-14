// Journal types

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
