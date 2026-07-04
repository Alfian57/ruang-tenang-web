// Breathing Exercise Types

import React from 'react';
import { 
  CloudRain, Annoyed, BatteryLow, Frown, Activity, Meh, Wind, Smile, Zap, Target,
  VolumeX, Trees, Waves, Bird, Flame, Radio,
  Square, Moon, Heart 
} from "lucide-react";

export interface BreathingTechnique {
  id: string;
  name: string;
  slug: string;
  description: string;
  benefits: string;
  best_for: string;
  inhale_duration: number;
  inhale_hold_duration: number;
  exhale_duration: number;
  exhale_hold_duration: number;
  total_cycle_duration: number;
  icon: string;
  color: string;
  animation_type: 'circle' | 'bar' | 'wave' | 'lungs';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'relaxation' | 'focus' | 'energy' | 'sleep' | 'custom';
  origin: string;
  is_system: boolean;
  is_favorite: boolean;
  created_at: string;
}

export interface CreateTechniqueRequest {
  name: string;
  description?: string;
  inhale_duration: number;
  inhale_hold_duration?: number;
  exhale_duration: number;
  exhale_hold_duration?: number;
  icon?: string;
  color?: string;
}

export interface UpdateTechniqueRequest {
  name?: string;
  description?: string;
  inhale_duration?: number;
  inhale_hold_duration?: number;
  exhale_duration?: number;
  exhale_hold_duration?: number;
  icon?: string;
  color?: string;
}

// Session Types
export interface BreathingSession {
  id: string;
  technique_id: string;
  technique?: BreathingTechnique;
  duration_seconds: number;
  target_duration_seconds: number;
  cycles_completed: number;
  voice_guidance_enabled: boolean;
  background_sound: string;
  haptic_feedback_enabled: boolean;
  completed: boolean;
  completed_percentage: number;
  started_at: string;
  ended_at: string | null;
  xp_earned: number;
  mood_before: string;
  mood_after: string;
}

export interface StartSessionRequest {
  technique_id: string;
  target_duration_seconds: number;
  voice_guidance_enabled?: boolean;
  background_sound?: string;
  haptic_feedback_enabled?: boolean;
  mood_before?: string;
}

export interface CompleteSessionRequest {
  duration_seconds: number;
  cycles_completed: number;
  completed: boolean;
  completed_percentage: number;
  mood_after?: string;
}

export interface BreathingSessionDraft {
  durationSeconds: number;
  cyclesCompleted: number;
  completed: boolean;
  completedPercentage: number;
}

export interface SessionCompletionResult {
  session: BreathingSession;
  xp_earned: number;
  bonus_xp: number;
  bonus_reason: string;
  total_xp: number;
  new_streak: number;
  streak_milestone: boolean;
  streak_milestone_xp: number;
  daily_xp_remaining: number;
  new_badges: string[];
}

// Preferences Types
export interface BreathingPreferences {
  default_duration_seconds: number;
  default_technique_id: string | null;
  voice_guidance: 'always_on' | 'always_off' | 'ask';
  background_sound: 'always_on' | 'always_off' | 'ask';
  default_background_sound: string;
  haptic_feedback: boolean;
  animation_speed: 'slow' | 'normal' | 'fast';
  theme: string;
  reminder_enabled: boolean;
  reminder_time: string;
  reminder_days: string;
  tutorial_completed: boolean;
}

export interface UpdatePreferencesRequest {
  default_duration_seconds?: number;
  default_technique_id?: string | null;
  voice_guidance?: 'always_on' | 'always_off' | 'ask';
  background_sound?: 'always_on' | 'always_off' | 'ask';
  default_background_sound?: string;
  haptic_feedback?: boolean;
  animation_speed?: 'slow' | 'normal' | 'fast';
  theme?: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
  reminder_days?: string;
  tutorial_completed?: boolean;
}

// Stats Types
export interface BreathingDailyStats {
  date: string;
  sessions_count: number;
  total_minutes: number;
  favorite_technique: string;
}

export interface BreathingOverallStats {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  most_used_technique: string;
  most_used_technique_id: string;
  average_sessions_per_week: number;
  completion_rate: number;
}

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_practice_date: string;
  streak_freeze_available: boolean;
  days_until_streak_break: number;
}

export interface BreathingStats {
  today: BreathingDailyStats;
  overall: BreathingOverallStats;
  streak_info: StreakInfo;
}

export interface BreathingCalendarDay {
  date: string;
  sessions_count: number;
  total_minutes: number;
  techniques_used: string[];
  intensity: 0 | 1 | 2 | 3;
}

export interface BreathingCalendar {
  month: number;
  year: number;
  days: BreathingCalendarDay[];
}

export interface TechniqueUsageStats {
  technique_id: string;
  technique_name: string;
  sessions_count: number;
  total_minutes: number;
  percentage: number;
}

// Recommendations Types
export interface TechniqueRecommendation {
  technique: BreathingTechnique;
  reason: string;
  priority: number;
}

export interface RecommendationsResponse {
  based_on_mood: TechniqueRecommendation[];
  based_on_time: TechniqueRecommendation[];
  based_on_activity: TechniqueRecommendation[];
  default_pick: TechniqueRecommendation | null;
}

// Session History Types
export interface SessionHistoryParams {
  start_date?: string;
  end_date?: string;
  technique_id?: string;
  page?: number;
  limit?: number;
}

export interface SessionHistoryResponse {
  sessions: BreathingSession[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Widget Types
export interface BreathingWidgetData {
  current_streak: number;
  today_sessions: number;
  today_minutes: number;
  daily_goal_minutes: number;
  daily_goal_progress: number;
  favorite_technique: BreathingTechnique | null;
  last_session_at: string | null;
  needs_practice_today: boolean;
  streak_at_risk: boolean;
}

// Animation/Visual Types
export type BreathingPhase = 'inhale' | 'inhale_hold' | 'exhale' | 'exhale_hold' | 'ready' | 'complete';

export interface BreathingState {
  phase: BreathingPhase;
  currentCycle: number;
  totalCycles: number;
  elapsedTime: number;
  remainingTime: number;
  phaseProgress: number;
  isActive: boolean;
  isPaused: boolean;
}

// Background Sound Options
export const BACKGROUND_SOUNDS = [
  { id: 'none', name: 'Tidak Ada', icon: React.createElement(VolumeX, { className: "w-4 h-4" }) },
  { id: 'rain', name: 'Hujan', icon: React.createElement(CloudRain, { className: "w-4 h-4" }) },
  { id: 'forest', name: 'Hutan', icon: React.createElement(Trees, { className: "w-4 h-4" }) },
  { id: 'ocean', name: 'Laut', icon: React.createElement(Waves, { className: "w-4 h-4" }) },
  { id: 'birds', name: 'Burung', icon: React.createElement(Bird, { className: "w-4 h-4" }) },
  { id: 'fire', name: 'Api Unggun', icon: React.createElement(Flame, { className: "w-4 h-4" }) },
  { id: 'wind', name: 'Angin', icon: React.createElement(Wind, { className: "w-4 h-4" }) },
  { id: 'white_noise', name: 'White Noise', icon: React.createElement(Radio, { className: "w-4 h-4" }) },
] as const;

export type BackgroundSoundId = typeof BACKGROUND_SOUNDS[number]['id'];

// Duration Options
export const DURATION_OPTIONS = [
  { value: 120, label: '2 menit', shortLabel: '2m' },
  { value: 300, label: '5 menit', shortLabel: '5m' },
  { value: 600, label: '10 menit', shortLabel: '10m' },
  { value: 900, label: '15 menit', shortLabel: '15m' },
  { value: 1200, label: '20 menit', shortLabel: '20m' },
  { value: 1800, label: '30 menit', shortLabel: '30m' },
] as const;

// Mood Options for before/after
export const MOOD_OPTIONS = [
  { id: 'anxious', label: 'Cemas', icon: CloudRain },
  { id: 'stressed', label: 'Stres', icon: Annoyed },
  { id: 'tired', label: 'Lelah', icon: BatteryLow },
  { id: 'sad', label: 'Sedih', icon: Frown },
  { id: 'restless', label: 'Gelisah', icon: Activity },
  { id: 'neutral', label: 'Biasa', icon: Meh },
  { id: 'calm', label: 'Tenang', icon: Wind },
  { id: 'happy', label: 'Senang', icon: Smile },
  { id: 'energized', label: 'Berenergi', icon: Zap },
  { id: 'focused', label: 'Fokus', icon: Target },
] as const;

export type MoodId = typeof MOOD_OPTIONS[number]['id'];

export type BreathingIntentId = 'calm' | 'focus' | 'sleep' | 'energy';

export interface BreathingIntentPreset {
  id: BreathingIntentId;
  label: string;
  description: string;
  durationSeconds: number;
  moodBefore: MoodId;
  backgroundSound: BackgroundSoundId;
  preferredCategory: BreathingTechnique['category'];
  preferredSlugs: string[];
}

export const BREATHING_INTENT_PRESETS: BreathingIntentPreset[] = [
  {
    id: 'calm',
    label: 'Tenangkan cemas',
    description: 'Mulai pendek untuk menurunkan tegang tanpa terasa berat.',
    durationSeconds: 120,
    moodBefore: 'anxious',
    backgroundSound: 'rain',
    preferredCategory: 'relaxation',
    preferredSlugs: ['deep-calm', 'coherent-breathing', 'box-breathing'],
  },
  {
    id: 'focus',
    label: 'Fokus lembut',
    description: 'Ritme stabil untuk kembali ke tugas tanpa memaksa.',
    durationSeconds: 300,
    moodBefore: 'neutral',
    backgroundSound: 'white_noise',
    preferredCategory: 'focus',
    preferredSlugs: ['box-breathing', 'coherent-breathing'],
  },
  {
    id: 'sleep',
    label: 'Siap tidur',
    description: 'Pola lambat untuk memberi sinyal istirahat ke tubuh.',
    durationSeconds: 300,
    moodBefore: 'tired',
    backgroundSound: 'ocean',
    preferredCategory: 'sleep',
    preferredSlugs: ['4-7-8-breathing', '4-7-8-relaxing'],
  },
  {
    id: 'energy',
    label: 'Pulihkan energi',
    description: 'Sesi ringkas untuk bangun pelan tanpa terburu-buru.',
    durationSeconds: 120,
    moodBefore: 'tired',
    backgroundSound: 'wind',
    preferredCategory: 'energy',
    preferredSlugs: ['energizing-breath'],
  },
];

// XP Configuration (matching backend)
export const BREATHING_XP_CONFIG = {
  XP_FOR_2_MIN: 5,
  XP_FOR_5_MIN: 10,
  XP_FOR_10_MIN: 15,
  XP_FOR_15_MIN_PLUS: 20,
  DAILY_CAP: 30,
  STREAK_BONUS_WEEK: 50,
  STREAK_BONUS_MONTH: 200,
  MIN_SESSION_SECONDS: 60,
} as const;

// Technique Icons
export const TECHNIQUE_ICONS: Record<string, React.ReactNode> = {
  'box-breathing': React.createElement(Square, { className: "w-5 h-5" }),
  '4-7-8-breathing': React.createElement(Moon, { className: "w-5 h-5" }),
  'coherent-breathing': React.createElement(Heart, { className: "w-5 h-5" }),
  'energizing-breath': React.createElement(Zap, { className: "w-5 h-5" }),
  'deep-calm': React.createElement(Waves, { className: "w-5 h-5" }),
  'lungs': React.createElement(Activity, { className: "w-5 h-5" }),
  'default': React.createElement(Wind, { className: "w-5 h-5" }),
};

// Get icon for technique
export function getTechniqueIcon(technique: BreathingTechnique): React.ReactNode {
  if (technique.slug && TECHNIQUE_ICONS[technique.slug]) {
    return TECHNIQUE_ICONS[technique.slug];
  }
  return TECHNIQUE_ICONS[technique.icon] || TECHNIQUE_ICONS['default'];
}

// Format duration for display
export function formatBreathingDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} menit`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Calculate cycles for duration
export function calculateCycles(technique: BreathingTechnique, durationSeconds: number): number {
  const cycleDuration = technique.total_cycle_duration || (
    technique.inhale_duration +
    technique.inhale_hold_duration +
    technique.exhale_duration +
    technique.exhale_hold_duration
  );
  return Math.floor(durationSeconds / cycleDuration);
}

// Get phase label in Indonesian
export function getPhaseLabel(phase: BreathingPhase): string {
  const labels: Record<BreathingPhase, string> = {
    ready: 'Siap',
    inhale: 'Tarik Napas',
    inhale_hold: 'Tahan',
    exhale: 'Hembuskan',
    exhale_hold: 'Tahan',
    complete: 'Selesai',
  };
  return labels[phase];
}

// Get difficulty label in Indonesian
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
  };
  return labels[difficulty] || difficulty;
}

// Get category label in Indonesian
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    relaxation: 'Relaksasi',
    focus: 'Fokus',
    energy: 'Energi',
    sleep: 'Tidur',
    custom: 'Kustom',
  };
  return labels[category] || category;
}
