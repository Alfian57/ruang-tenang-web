// ========================
// Content Moderation Types
// ========================

// Article Moderation Status
export type ArticleModerationStatus =
  | "pending"
  | "approved"
  | "flagged"
  | "rejected"
  | "revision_needed";

// AI Moderation Result
export interface AIModerationResult {
  status: ArticleModerationStatus;
  confidence: number; // 0-100
  reasons: string[];
  flag_category?: string;
  severity?: string;
  suggestions?: string;
}

// Moderation Queue Item
export interface ModerationQueueItem {
  id: number;
  title: string;
  excerpt: string;
  author_id: number;
  author_name: string;
  moderation_status: ArticleModerationStatus;
  severity?: string;
  flag_reasons?: string[];
  created_at: string;
  updated_at: string;
}

// Moderate Article Request
export interface ModerateArticleRequest {
  action: "approve" | "reject" | "request_edit";
  notes?: string;
  trigger_warnings?: string[];
}

// ========================
// Content Flag Types
// ========================

export type FlagType = "ai_flagged" | "user_reported" | "moderator_flagged";

export type FlagCategory =
  | "misinformation"
  | "harmful_content"
  | "self_harm"
  | "harassment"
  | "hate_speech"
  | "spam"
  | "inappropriate"
  | "other";

export type FlagSeverity = "low" | "medium" | "high" | "critical";

export interface ContentFlag {
  id: number;
  content_type: "article" | "forum" | "forum_post" | "story" | "story_comment";
  content_id: number;
  flag_type: FlagType;
  flag_category: FlagCategory;
  severity: FlagSeverity;
  ai_confidence?: number;
  ai_reason?: string;
  flagged_by_id?: number;
  flagged_by_name?: string;
  is_resolved: boolean;
  resolved_by_id?: number;
  resolved_by_name?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

// ========================
// Report Types
// ========================

export type ReportType = "article" | "forum" | "forum_post" | "user" | "story" | "story_comment";

export type ReportReason =
  | "misinformation"
  | "harmful"
  | "harassment"
  | "spam"
  | "impersonation"
  | "other";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export type ActionTaken =
  | "none"
  | "warning_issued"
  | "content_removed"
  | "user_suspended"
  | "user_banned"
  | "dismissed";

export interface CreateReportRequest {
  report_type: ReportType;
  content_id?: number | string;
  user_id?: number;
  reason: ReportReason;
  description?: string;
}

export interface UserReport {
  id: number;
  reporter_id: number;
  reporter_name: string;
  report_type: ReportType;
  reported_content_id?: number;
  reported_user_id?: number;
  reported_user_name?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  handled_by_id?: number;
  handled_by_name?: string;
  handled_at?: string;
  action_taken?: ActionTaken;
  moderator_notes?: string;
  created_at: string;
  content_preview?: string;
  content_title?: string;
}

export interface HandleReportRequest {
  action: "dismiss" | "warn" | "remove_content" | "suspend" | "ban";
  notes?: string;
  duration?: number; // Days for suspension (1, 7, 30)
}

// ========================
// Block Types
// ========================

export interface BlockUserRequest {
  user_id: number;
  reason?: string;
}

export interface UserBlock {
  id: number;
  blocker_id: number;
  blocked_id: number;
  blocked_name: string;
  blocked_avatar?: string;
  reason?: string;
  created_at: string;
}

export interface BlockListResponse {
  blocks: UserBlock[];
  total_count: number;
}

// ========================
// Strike Types
// ========================

export type StrikeSeverity = "warning" | "minor" | "major";

export interface UserStrike {
  id: number;
  user_id: number;
  user_name: string;
  report_id?: number;
  reason: string;
  severity: StrikeSeverity;
  issued_by_id: number;
  issued_by_name: string;
  expires_at?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

// ========================
// Moderator Action Types
// ========================

export type ModeratorActionType =
  | "article_approved"
  | "article_rejected"
  | "article_request_edit"
  | "content_removed"
  | "user_warned"
  | "user_suspended"
  | "user_banned"
  | "user_unbanned"
  | "strike_issued"
  | "strike_removed"
  | "report_dismissed"
  | "report_resolved"
  | "trigger_warning_added";

export interface ModeratorAction {
  id: number;
  moderator_id: number;
  moderator_name: string;
  action_type: ModeratorActionType;
  target_type: string;
  target_id: number;
  previous_state?: string;
  new_state?: string;
  reason?: string;
  notes?: string;
  created_at: string;
}

// ========================
// Crisis Detection Types
// ========================

export type CrisisCategory = "self_harm" | "suicide" | "severe_depression" | "emergency";

export type CrisisSeverity = "medium" | "high" | "critical";

export interface CrisisKeyword {
  id: number;
  keyword: string;
  category: CrisisCategory;
  severity: CrisisSeverity;
  language: string;
  is_active: boolean;
  notes?: string;
}

export interface CreateCrisisKeywordRequest {
  keyword: string;
  category: CrisisCategory;
  severity: CrisisSeverity;
  language?: string;
  notes?: string;
}

export interface CrisisDetectionResult {
  is_crisis: boolean;
  keywords?: string[];
  category?: CrisisCategory;
  severity?: CrisisSeverity;
  helpline_number?: string;
  helpline_info?: string;
}

// ========================
// Trigger Warning Types
// ========================

export type TriggerWarningCategory =
  | "self_harm"
  | "suicide"
  | "depression"
  | "anxiety"
  | "abuse"
  | "violence"
  | "eating_disorder"
  | "substance_abuse"
  | "trauma"
  | "death"
  | "other";

export interface TriggerWarningRequest {
  content_type: "article" | "forum";
  content_id: number;
  trigger_warnings: TriggerWarningCategory[];
}

export interface ContentWithWarning {
  content_type: "article" | "forum";
  content_id: number;
  title: string;
  trigger_warnings: TriggerWarningCategory[];
  has_warning: boolean;
}

// ========================
// User Settings Types
// ========================

export type ContentWarningPreference = "show" | "hide_all" | "ask_each_time";

export interface UpdateContentWarningPreferenceRequest {
  preference: ContentWarningPreference;
}

// ========================
// Moderation Stats Types
// ========================

export interface ModerationStats {
  pending_articles: number;
  flagged_articles: number;
  pending_reports: number;
  resolved_reports_today: number;
  active_strikes: number;
  suspended_users: number;
  banned_users: number;
}

// ========================
// Query Parameters
// ========================

export interface ModerationQueueParams {
  status?: "pending" | "flagged" | "all";
  severity?: "low" | "medium" | "high";
  page?: number;
  limit?: number;
}

export interface ReportQueryParams {
  status?: ReportStatus;
  report_type?: ReportType;
  reason?: ReportReason;
  page?: number;
  limit?: number;
}

export interface ModeratorActionQueryParams {
  moderator_id?: number;
  action_type?: ModeratorActionType;
  target_type?: string;
  page?: number;
  limit?: number;
}

// ========================
// Appeal Types
// ========================

export type AppealStatus = "pending" | "approved" | "rejected";

export interface Appeal {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  reason: string;
  evidence?: string;
  status: AppealStatus;
  reviewer_notes?: string;
  reviewer_id?: number;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppealRequest {
  reason: string;
  evidence?: string;
}

export interface ReviewAppealRequest {
  status: "approved" | "rejected";
  notes?: string;
}
