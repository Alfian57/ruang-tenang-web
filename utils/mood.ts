import { MoodType } from "@/types";

/**
 * Mood-related utilities for the mental health tracking feature.
 */

/** Emoji representations for each mood type */
const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: "😊",
  neutral: "😐",
  angry: "😠",
  disappointed: "😞",
  sad: "😢",
  crying: "😭",
} as const;

/** Indonesian labels for each mood type */
const MOOD_LABELS: Record<MoodType, string> = {
  happy: "Bahagia",
  neutral: "Netral",
  angry: "Marah",
  disappointed: "Kecewa",
  sad: "Sedih",
  crying: "Menangis",
} as const;

/** Color classes for mood visualization */
const MOOD_COLORS: Record<MoodType, string> = {
  happy: "text-green-500",
  neutral: "text-gray-500",
  angry: "text-red-500",
  disappointed: "text-orange-500",
  sad: "text-blue-500",
  crying: "text-purple-500",
} as const;

/**
 * Get the emoji for a mood type.
 */
export function getMoodEmoji(mood: string): string {
  return MOOD_EMOJIS[mood as MoodType] ?? "🙂";
}

/**
 * Get the Indonesian label for a mood type.
 */
export function getMoodLabel(mood: string): string {
  return MOOD_LABELS[mood as MoodType] ?? mood;
}

/**
 * Get the color class for a mood type.
 */
export function getMoodColor(mood: string): string {
  return MOOD_COLORS[mood as MoodType] ?? "text-gray-500";
}

/**
 * Get all available mood types.
 */
export function getAllMoods(): MoodType[] {
  return Object.keys(MOOD_EMOJIS) as MoodType[];
}
