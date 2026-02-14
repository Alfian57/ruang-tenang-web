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
