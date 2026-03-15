// ==========================================
// Progress Map Types
// ==========================================

export interface MapRegion {
  id: string;
  region_key: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  unlock_type: string;
  unlock_value: number;
  position_x: number;
  position_y: number;
  display_order: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  landmarks: MapLandmark[];
  total_landmarks: number;
  unlocked_landmarks: number;
}

export interface MapLandmark {
  id: string;
  landmark_key: string;
  name: string;
  description: string;
  icon: string;
  unlock_type: string;
  unlock_activity?: string;
  unlock_value: number;
  position_x: number;
  position_y: number;
  xp_reward: number;
  coin_reward: number;
  is_unlocked: boolean;
  current_value: number;
  progress_percent: number;
  unlocked_at?: string;
  reward_claimed: boolean;
}

export interface FullMapResponse {
  regions: MapRegion[];
  total_regions: number;
  unlocked_regions: number;
  total_landmarks: number;
  unlocked_landmarks: number;
  overall_progress: number;
}

export interface MapProgressSummary {
  unlocked_regions: number;
  total_regions: number;
  unlocked_landmarks: number;
  total_landmarks: number;
  overall_progress: number;
  latest_unlock?: string;
  latest_unlock_at?: string;
}

export interface AdminMapLandmark {
  id: string;
  region_id: string;
  region_name: string;
  region_key: string;
  landmark_key: string;
  name: string;
  description: string;
  icon: string;
  unlock_type: string;
  unlock_activity?: string;
  unlock_value: number;
  position_x: number;
  position_y: number;
  xp_reward: number;
  coin_reward: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminMapLandmarkPayload {
  region_id: string;
  landmark_key: string;
  name: string;
  description: string;
  icon: string;
  unlock_type: string;
  unlock_activity?: string;
  unlock_value: number;
  position_x: number;
  position_y: number;
  xp_reward: number;
  coin_reward: number;
  display_order: number;
  is_active?: boolean;
}

