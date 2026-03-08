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
  maxLevel: number;
  userBadges: UserBadges | null;
  userFeatures: UserFeatures | null;
  loading: boolean;
  isLevelChanging: boolean;
  handleLevelChange: (newLevel: number) => void;
}

interface UseCommunityDataOptions {
  includePersonal?: boolean;
}

export function useCommunityData(options: UseCommunityDataOptions = {}): CommunityData {
  const { includePersonal = true } = options;
  const { token } = useAuthStore();
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [personalJourney, setPersonalJourney] = useState<PersonalJourney | null>(null);
  const [hallOfFame, setHallOfFame] = useState<LevelHallOfFameResponse | null>(null);
  const [latestForums, setLatestForums] = useState<Forum[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(10);
  const [userBadges, setUserBadges] = useState<UserBadges | null>(null);
  const [userFeatures, setUserFeatures] = useState<UserFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLevelChanging, setIsLevelChanging] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBaseData = async () => {
      setLoading(true);
      try {
        const [statsRes, forumsRes, levelConfigsRes] = await Promise.all([
          communityService.getStats(),
          forumService.getAll(token || "", 4),
          communityService.getLevelConfigs().catch(() => null),
        ]);

        if (!isMounted) return;

        setCommunityStats(statsRes.data);
        setLatestForums(forumsRes.data);

        const levels = levelConfigsRes?.data ?? [];
        if (Array.isArray(levels) && levels.length > 0) {
          const highestLevel = Math.max(...levels.map((item) => item.level));
          setMaxLevel(Math.max(1, highestLevel));
        }

        if (includePersonal && token) {
          const [journeyRes, badgesRes, featuresRes] = await Promise.all([
            communityService.getPersonalJourney(token).catch(() => null),
            communityService.getUserBadges(token).catch(() => null),
            communityService.getUserFeatures(token).catch(() => null),
          ]);

          if (!isMounted) return;

          if (journeyRes?.data) {
            setPersonalJourney(journeyRes.data);
            setCurrentLevel(Math.max(1, journeyRes.data.current_level));
          }
          if (badgesRes?.data) setUserBadges(badgesRes.data);
          if (featuresRes?.data) setUserFeatures(featuresRes.data);
        } else {
          setPersonalJourney(null);
          setUserBadges(null);
          setUserFeatures(null);
        }
      } catch {
        // Silently handle - UI will show empty/null states
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBaseData();

    return () => {
      isMounted = false;
    };
  }, [token, includePersonal]);

  useEffect(() => {
    let isMounted = true;

    const fetchHallOfFame = async () => {
      setIsLevelChanging(true);
      try {
        const hofRes = await communityService.getLevelHallOfFame(currentLevel);
        if (isMounted) {
          setHallOfFame(hofRes.data);
        }
      } catch {
        // Silently handle
      } finally {
        if (isMounted) {
          setIsLevelChanging(false);
        }
      }
    };

    fetchHallOfFame();

    return () => {
      isMounted = false;
    };
  }, [currentLevel]);

  const handleLevelChange = (newLevel: number) => {
    if (isLevelChanging) return;
    if (newLevel < 1 || newLevel > maxLevel) return;
    if (newLevel === currentLevel) return;
    setCurrentLevel(newLevel);
  };

  return {
    communityStats,
    personalJourney,
    hallOfFame,
    latestForums,
    currentLevel,
    maxLevel,
    userBadges,
    userFeatures,
    loading,
    isLevelChanging,
    handleLevelChange,
  };
}
