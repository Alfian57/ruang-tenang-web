"use client";

import { useCallback, useEffect, useState } from "react";
import { communityService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { CommunityStats, LevelHallOfFameResponse } from "@/types";

export function useCommunityData() {
  const userLevel = useAuthStore((state) => state.user?.level ?? 1);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [hallOfFame, setHallOfFame] = useState<LevelHallOfFameResponse | null>(null);
  const [currentLevel, setCurrentLevel] = useState(Math.max(1, userLevel));
  const [maxLevel, setMaxLevel] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isLevelChanging, setIsLevelChanging] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      communityService.getStats(),
      communityService.getLevelConfigs().catch(() => null),
    ])
      .then(([statsRes, levelsRes]) => {
        if (!active) return;
        setCommunityStats(statsRes.data);
        const levels = levelsRes?.data ?? [];
        if (Array.isArray(levels) && levels.length > 0) {
          setMaxLevel(Math.max(...levels.map((level) => level.level)));
        }
      })
      .catch(() => {
        if (active) setCommunityStats(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCurrentLevel((level) => (level === 1 && userLevel > 1 ? userLevel : level));
  }, [userLevel]);

  useEffect(() => {
    let active = true;
    setIsLevelChanging(true);
    communityService.getLevelHallOfFame(currentLevel)
      .then((response) => {
        if (active) setHallOfFame(response.data);
      })
      .catch(() => {
        if (active) setHallOfFame(null);
      })
      .finally(() => {
        if (active) setIsLevelChanging(false);
      });

    return () => {
      active = false;
    };
  }, [currentLevel]);

  const handleLevelChange = useCallback((level: number) => {
    if (level >= 1 && level <= maxLevel) setCurrentLevel(level);
  }, [maxLevel]);

  return {
    communityStats,
    hallOfFame,
    currentLevel,
    maxLevel,
    loading,
    isLevelChanging,
    handleLevelChange,
  };
}
