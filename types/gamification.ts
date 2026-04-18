// ==========================================
// Community Progress Types
// ==========================================

export interface CommunityStats {
  total_xp_earned: number;
  active_members: number;
  total_achievements: number;
  growth_percentage: number;
  new_members: number;
  total_stories_published: number;
  total_articles_published: number;
  month: number;
  year: number;
}

export interface HallOfFameEntry {
  rank: number;
  user_id: number;
  user_name: string;
  avatar: string;
  monthly_xp: number;
  message?: string;
  tier_name: string;
  tier_color: string;
}

export interface LevelHallOfFameResponse {
  level: number;
  month: number;
  year: number;
  featured_users: HallOfFameEntry[];
  total_members: number;
}

export interface HallOfFameCategoryInfo {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface PersonalJourney {
  user_id: number;
  current_level: number;
  current_exp: number;
  exp_to_next_level: number;
  progress_percent: number;
  tier_name: string;
  tier_color: string;
  badge_name: string;
  badge_icon: string;
  monthly_xp: number;
  monthly_activities: number;
  new_badges_count: number;
  rank_in_level: number;
  total_in_level: number;
  percentile: number;
  current_streak: number;
  longest_streak: number;
  total_activities: number;
  member_since: string;
}

export interface ActivityBreakdownItem {
  activity_type: string;
  count: number;
  label: string;
}

export interface ProgressStats {
  xp_earned: number;
  activities_count: number;
  badges_earned: number;
}

export interface WeeklyProgress {
  this_week: ProgressStats;
  last_week: ProgressStats;
  xp_change: number;
  xp_change_percent: number;
  streak_days: number;
  most_productive_day: string;
}

export interface MonthlyProgress {
  total_xp: number;
  level_progress_percent: number;
  badges_earned: number;
  top_activity: string;
  top_activity_count: number;
  days_active: number;
}

export interface AllTimeStats {
  member_since: string;
  total_xp: number;
  current_level: number;
  total_badges: number;
  longest_streak: number;
  total_activities: number;
  stories_shared: number;
  articles_written: number;
}

export interface LevelUpCelebration {
  new_level: number;
  badge_name: string;
  badge_icon: string;
  tier_name: string;
  tier_color: string;
  unlocked_features: FeatureUnlock[];
  new_badges?: Badge[];
  congrats_message: string;
}

// ==========================================
// Feature Unlock Types
// ==========================================

export interface FeatureUnlock {
  id: string;
  feature_key: string;
  feature_name: string;
  description: string;
  icon: string;
  required_level: number;
  category: string;
  is_unlocked: boolean;
  unlocked_at?: string;
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
  badge_name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  is_earned: boolean;
  is_showcased: boolean;
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
  total_badges: number;
  earned_badges: number;
  showcased_badges: Badge[];
  all_badges: Badge[];
  badges_by_category: Record<string, Badge[]>;
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
  status?: "pending" | "approved" | "rejected" | "revision_requested";
  is_own?: boolean;
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

// ==========================================
// Daily Task Types
// ==========================================

export interface DailyTask {
  id: number;
  task_type: string;
  task_name: string;
  task_description: string;
  xp_reward: number;
  coin_reward: number;
  task_icon: string;
  target_count: number;
  current_count: number;
  is_completed: boolean;
  is_claimed: boolean;
  task_date: string;
  completed_at?: string;
  claimed_at?: string;
}

export interface ClaimTaskResponse {
  success: boolean;
  message: string;
  xp_earned: number;
  coin_earned: number;
  new_total_exp: number;
  level_up: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  avatar?: string;
  level: number;
  exp: number;
  badge_name: string;
  badge_icon: string;
  role?: string;
}

export interface XPBoostStatus {
  id: string;
  multiplier: number;
  trigger_type: string;
  started_at: string;
  expires_at: string;
  remaining_seconds: number;
}

export interface XPMultiplierStatus {
  effective_multiplier: number;
}

// ==========================================
// Reward Types
// ==========================================

export interface Reward {
  id: number;
  name: string;
  description: string;
  image: string;
  coin_cost: number;
  stock: number;
  is_active: boolean;
  reward_type?: string;
  reward_value?: string;
  created_at: string;
  updated_at: string;
}

export interface RewardClaim {
  id: number;
  user_id: number;
  reward_id: number;
  coin_spent: number;
  claimed_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  };
  reward?: Reward;
}

export interface RewardClaimResult {
  claim: RewardClaim;
  remaining_coins: number;
}

export interface RewardClaimListResult {
  claims: RewardClaim[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
