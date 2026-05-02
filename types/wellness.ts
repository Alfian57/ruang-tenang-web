export interface WellnessProfile {
  id: number;
  user_id: number;
  initial_mood: string;
  goals: string[];
  habits: string[];
  tour_completed_at?: string;
  onboarding_completed_at?: string;
}

export interface WellnessPlanItem {
  id: string;
  day_number: number;
  item_date: string;
  title: string;
  description: string;
  action_type: string;
  route: string;
  status: "pending" | "completed" | "skipped" | string;
  completed_at?: string;
  metadata: Record<string, unknown>;
}

export interface WellnessPlan {
  id: string;
  title: string;
  summary: string;
  status: "active" | "completed" | "archived" | string;
  starts_on: string;
  ends_on: string;
  generated_from_mood: string;
  completion_percent: number;
  items: WellnessPlanItem[];
}

export interface WellnessOnboardingResponse {
  needs_onboarding: boolean;
  profile?: WellnessProfile;
  plan?: WellnessPlan;
}

export interface WellnessOnboardingPayload {
  initial_mood: string;
  goals: string[];
  habits: string[];
}

export type WellnessNeedCondition = "cemas" | "capek" | "sedih" | "marah" | "bingung" | "fokus";

export interface WellnessRecommendation {
  type: string;
  title: string;
  description: string;
  route: string;
  prompt?: string;
  metadata?: Record<string, unknown>;
  locked: boolean;
}

export interface WellnessNeedNowResponse {
  condition: WellnessNeedCondition;
  title: string;
  description: string;
  recommendations: WellnessRecommendation[];
}

export interface WeeklyInsight {
  id: string;
  week_start: string;
  week_end: string;
  mood_summary: Record<string, unknown>;
  activity_summary: Record<string, unknown>;
  insight: Record<string, unknown>;
  narrative: string;
  recommendations: WellnessRecommendation[];
  premium_preview: Record<string, unknown>;
  is_premium: boolean;
  is_ai_enhanced: boolean;
  generated_at: string;
}

export interface WellnessTourCompleteResponse {
  tour_completed_at: string;
}

export interface WellnessJourneyNode {
  key: string;
  label: string;
  description: string;
  value: number;
  target: number;
  progress: number;
  route: string;
  tone: string;
}

export interface WellnessJourneyMap {
  title: string;
  narrative: string;
  overall_progress: number;
  streak: number;
  nodes: WellnessJourneyNode[];
  next_recommendation: WellnessRecommendation;
}
