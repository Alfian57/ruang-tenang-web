// ==========================================
// Community Progress Types
// ==========================================

export interface CommunityStats {
  total_users: number;
  active_users_weekly: number;
  active_users_monthly: number;
  total_exp_earned: number;
  exp_earned_this_week: number;
  total_activities: number;
  milestones_reached: number;
  badges_earned: number;
  stories_shared: number;
  supportive_hearts_given: number;
  calculated_at: string;
}

export interface HallOfFameEntry {
  user_id: number;
  name: string;
  avatar: string;
  exp: number;
  current_streak: number;
  longest_streak: number;
  total_activities: number;
  badges_earned: string[];
  joined_at: string;
}

export interface LevelHallOfFameResponse {
  level: number;
  tier_name: string;
  tier_color: string;
  entries: HallOfFameEntry[];
}

export interface HallOfFameCategoryInfo {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface PersonalJourney {
  user_id: number;
  name: string;
  avatar: string;
  current_exp: number;
  current_level: number;
  tier_name: string;
  tier_color: string;
  exp_to_next_level: number;
  exp_progress: number;
  rank_in_level: number;
  total_in_level: number;
  current_streak: number;
  longest_streak: number;
  total_activities: number;
  unlocked_features: number;
  total_features: number;
  badges_earned: number;
  weekly_exp: number;
  weekly_activities: number;
  monthly_exp: number;
  monthly_activities: number;
  joined_at: string;
}

export interface ActivityBreakdownItem {
  activity_type: string;
  count: number;
  label: string;
}

export interface WeeklyProgress {
  week_start: string;
  exp_earned: number;
  activities_count: number;
  breakdown: ActivityBreakdownItem[];
}

export interface MonthlyProgress {
  month: number;
  year: number;
  exp_earned: number;
  activities_count: number;
  breakdown: ActivityBreakdownItem[];
}

export interface AllTimeStats {
  total_exp: number;
  total_activities: number;
  longest_streak: number;
  current_streak: number;
  badges_earned: number;
  features_unlocked: number;
  days_since_joined: number;
  breakdown: ActivityBreakdownItem[];
}

export interface LevelUpCelebration {
  new_level: number;
  tier_name: string;
  tier_color: string;
  level_description: string;
  celebration_message: string;
  newly_unlocked_features: FeatureUnlock[];
}

// ==========================================
// Feature Unlock Types
// ==========================================

export interface FeatureUnlock {
  id: string;
  feature_key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface LockedFeature extends FeatureUnlock {
  required_level: number;
  levels_away: number;
}

export interface FeaturesByLevel {
  level: number;
  tier_name: string;
  tier_color: string;
  features: FeatureUnlock[];
}

export interface UserFeatures {
  current_level: number;
  total_unlocked: number;
  total_features: number;
  unlocked_features: FeatureUnlock[];
  locked_features: LockedFeature[];
}

export interface FeatureAccess {
  has_access: boolean;
  feature_key: string;
  feature_name: string;
  required_level?: number;
  current_level?: number;
  levels_away?: number;
  reason?: string;
}

export interface FeatureCategoryInfo {
  key: string;
  name: string;
  description: string;
  icon: string;
}

// ==========================================
// Badge Types
// ==========================================

export interface Badge {
  id: string;
  badge_key: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  category: "streak" | "activity" | "contribution" | "special" | "level";
  earned_at?: string;
}

export interface BadgeDefinition extends Badge {
  requirement_type: string;
  requirement_value: number;
}

export interface BadgeProgress {
  badge_id: string;
  badge_key: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
  earned: boolean;
  current_value: number;
  target_value: number;
  progress_percent: number;
}

export interface BadgeCategoryStats {
  category: string;
  earned: number;
  total: number;
}

export interface UserBadges {
  total_earned: number;
  total_available: number;
  earned_badges: Badge[];
  category_stats: BadgeCategoryStats[];
}

export interface BadgeCategoryInfo {
  key: string;
  name: string;
  description: string;
  icon: string;
}

// ==========================================
// Inspiring Stories Types
// ==========================================

export interface StoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  story_count?: number;
}

export interface StoryAuthor {
  id?: number;
  name: string;
  avatar?: string;
  tier_name?: string;
  tier_color?: string;
}

export interface InspiringStory {
  id: string;
  title: string;
  content: string;
  cover_image: string;
  is_anonymous: boolean;
  has_trigger_warning: boolean;
  trigger_warning_text?: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  view_count: number;
  heart_count: number;
  comment_count: number;
  is_featured: boolean;
  author?: StoryAuthor;
  categories: StoryCategory[];
  tags: string[];
  has_hearted: boolean;
  created_at: string;
  published_at?: string;
}

export interface StoryCard {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  is_anonymous: boolean;
  has_trigger_warning: boolean;
  heart_count: number;
  comment_count: number;
  is_featured: boolean;
  author?: StoryAuthor;
  categories: StoryCategory[];
  published_at?: string;
}

export interface StoriesListResponse {
  stories: StoryCard[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface StoryComment {
  id: string;
  content: string;
  heart_count: number;
  author?: StoryAuthor;
  has_hearted: boolean;
  is_hidden?: boolean;
  created_at: string;
}

export interface StoryCommentsListResponse {
  comments: StoryComment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface StoryStats {
  total_stories: number;
  approved_stories: number;
  pending_stories: number;
  total_hearts: number;
  total_views: number;
  total_comments: number;
  stories_this_month: number;
  max_stories_per_month: number;
  can_submit_more: boolean;
}

export interface MostAppreciatedStories {
  month: number;
  year: number;
  stories: StoryCard[];
}

// ==========================================
// Request Types
// ==========================================

export interface CreateStoryRequest {
  title: string;
  content: string;
  cover_image?: string;
  category_ids: string[];
  tags?: string[];
  is_anonymous: boolean;
  has_trigger_warning: boolean;
  trigger_warning_text?: string;
}

export interface UpdateStoryRequest {
  title?: string;
  content?: string;
  cover_image?: string;
  category_ids?: string[];
  tags?: string[];
  is_anonymous?: boolean;
  has_trigger_warning?: boolean;
  trigger_warning_text?: string;
}

export interface ModerateStoryRequest {
  status: "approved" | "rejected" | "revision_requested";
  feedback?: string;
}

export interface CreateStoryCommentRequest {
  content: string;
}

export interface HideStoryCommentRequest {
  reason: string;
}

export interface StoryFilterParams {
  category_id?: string;
  search?: string;
  sort_by?: "recent" | "hearts" | "featured";
  page?: number;
  limit?: number;
  author_id?: number;
  is_featured?: boolean;
}

// ==========================================
// Profile Customization Types
// ==========================================

export interface ProfileCustomization {
  profile_theme: string;
  profile_banner: string;
  avatar_border_color: string;
  tagline: string;
  bio: string;
}

export interface UpdateProfileCustomizationRequest {
  profile_theme?: string;
  profile_banner?: string;
  avatar_border_color?: string;
  tagline?: string;
  bio?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  avatar: string;
  profile_theme: string;
  profile_banner: string;
  avatar_border_color: string;
  tagline: string;
  bio: string;
  level: number;
  tier_name: string;
  tier_color: string;
  exp: number;
  current_streak: number;
  longest_streak: number;
  total_activities: number;
  badges: Badge[];
  joined_at: string;
}
