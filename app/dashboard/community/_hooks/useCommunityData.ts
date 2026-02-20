"use client";

import { useEffect, useState } from "react";
import { communityService, forumService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type {
  CommunityStats,
  PersonalJourney,
  LevelHallOfFameResponse,
  UserBadges,
  UserFeatures,
  Forum,
} from "@/types";

interface CommunityData {
  communityStats: CommunityStats | null;
  personalJourney: PersonalJourney | null;
  hallOfFame: LevelHallOfFameResponse | null;
  latestForums: Forum[];
  currentLevel: number;
  userBadges: UserBadges | null;
  userFeatures: UserFeatures | null;
  loading: boolean;
  handleLevelChange: (newLevel: number) => void;
}

export function useCommunityData(): CommunityData {
  const { token } = useAuthStore();
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [personalJourney, setPersonalJourney] = useState<PersonalJourney | null>(null);
  const [hallOfFame, setHallOfFame] = useState<LevelHallOfFameResponse | null>(null);
  const [latestForums, setLatestForums] = useState<Forum[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userBadges, setUserBadges] = useState<UserBadges | null>(null);
  const [userFeatures, setUserFeatures] = useState<UserFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await communityService.getStats();
        setCommunityStats(statsRes.data);

        const forumsRes = await forumService.getAll(token || "", 4);
        setLatestForums(forumsRes.data);

        if (token) {
          const [journeyRes, badgesRes, featuresRes] = await Promise.all([
            communityService.getPersonalJourney(token).catch(() => null),
            communityService.getUserBadges(token).catch(() => null),
            communityService.getUserFeatures(token).catch(() => null),
          ]);

          if (journeyRes?.data) {
            setPersonalJourney(journeyRes.data);
            setCurrentLevel(journeyRes.data.current_level);
          }
          if (badgesRes?.data) setUserBadges(badgesRes.data);
          if (featuresRes?.data) setUserFeatures(featuresRes.data);
        }

        const hofRes = await communityService.getLevelHallOfFame(currentLevel);
        setHallOfFame(hofRes.data);
      } catch {
        // Silently handle - UI will show empty/null states
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, currentLevel]);

  const handleLevelChange = async (newLevel: number) => {
    if (newLevel < 1 || newLevel > 10) return;
    setCurrentLevel(newLevel);
    try {
      const hofRes = await communityService.getLevelHallOfFame(newLevel);
      setHallOfFame(hofRes.data);
    } catch {
      // Silently handle
    }
  };

  return {
    communityStats,
    personalJourney,
    hallOfFame,
    latestForums,
    currentLevel,
    userBadges,
    userFeatures,
    loading,
    handleLevelChange,
  };
}
