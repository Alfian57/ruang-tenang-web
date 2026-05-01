"use client";

import { useEffect, useState, useCallback } from "react";
import { communityService, forumService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type {
  CommunityStats,
  PersonalJourney,
  LevelHallOfFameResponse,
  UserBadges,
  UserFeatures,
  Forum,
  DailyTask,
  DailyTaskSummary,
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
  dailyTasks: DailyTask[];
  loading: boolean;
  isLevelChanging: boolean;
  handleLevelChange: (newLevel: number) => void;
  refreshDailyTasks: () => Promise<void>;
}

function extractDailyTasks(payload: DailyTask[] | DailyTaskSummary | null | undefined): DailyTask[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.tasks)) return payload.tasks;
  return [];
}

export function useCommunityData(): CommunityData {
  const { token } = useAuthStore();
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [personalJourney, setPersonalJourney] = useState<PersonalJourney | null>(null);
  const [hallOfFame, setHallOfFame] = useState<LevelHallOfFameResponse | null>(null);
  const [latestForums, setLatestForums] = useState<Forum[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(10);
  const [userBadges, setUserBadges] = useState<UserBadges | null>(null);
  const [userFeatures, setUserFeatures] = useState<UserFeatures | null>(null);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLevelChanging, setIsLevelChanging] = useState(false);

  const fetchDailyTasks = useCallback(async () => {
    if (!token) {
      setDailyTasks([]);
      return;
    }

    try {
      const taskRes = await communityService.getDailyTasks(token);
      setDailyTasks(extractDailyTasks(taskRes.data));
    } catch {
      setDailyTasks([]);
    }
  }, [token]);

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

        if (token) {
          const [journeyRes, badgesRes, featuresRes] = await Promise.all([
            communityService.getPersonalJourney(token).catch(() => null),
            communityService.getUserBadges(token).catch(() => null),
            communityService.getUserFeatures(token).catch(() => null),
            fetchDailyTasks(),
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
          setDailyTasks([]);
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
  }, [token, fetchDailyTasks]);

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
    dailyTasks,
    loading,
    isLevelChanging,
    handleLevelChange,
    refreshDailyTasks: fetchDailyTasks,
  };
}
