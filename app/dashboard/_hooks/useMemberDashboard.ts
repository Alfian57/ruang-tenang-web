"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { breathingService, moodService, songService, journalService, articleService } from "@/services/api";
import { UserMood, SongCategory, Journal, Article } from "@/types";
import { BreathingWidgetData } from "@/types/breathing";
import { useDashboardStore } from "@/store/dashboardStore";

export function useMemberDashboard() {
  const { user, token } = useAuthStore();
  const [moodHistory, setMoodHistory] = useState<UserMood[]>([]);
  const [categories, setCategories] = useState<SongCategory[]>([]);

  // Widget States
  const [latestJournal, setLatestJournal] = useState<Journal | null>(null);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);

  // Breathing widget state
  const [breathingWidgetData, setBreathingWidgetData] = useState<BreathingWidgetData | null>(null);

  const { moodRefreshTrigger } = useDashboardStore();

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setIsLoadingWidgets(true);
    try {
      const [moodRes, categoriesRes, breathingWidgetRes, journalRes, articlesRes] = await Promise.all([
        moodService.getHistory(token, { limit: 100 }).catch(() => null) as Promise<{ data: { moods: UserMood[] } } | null>,
        songService.getCategories().catch(() => null) as Promise<{ data: SongCategory[] } | null>,
        breathingService.getWidgetData(token).catch(() => null) as Promise<{ data: BreathingWidgetData } | null>,
        journalService.list(token, { limit: 1 }).catch(() => null) as Promise<{ data: Journal[] | { data: Journal[] } } | null>,
        articleService.getArticles({ limit: 3 }).catch(() => null) as Promise<{ data: Article[] | { data: Article[] } } | null>,
      ]);

      if (moodRes?.data?.moods) {
        setMoodHistory(moodRes.data.moods);
      }

      if (categoriesRes?.data) {
        setCategories(categoriesRes.data);
      }
      if (breathingWidgetRes?.data) {
        setBreathingWidgetData(breathingWidgetRes.data);
      }

      if (journalRes?.data) {
        const journals = Array.isArray(journalRes.data) ? journalRes.data : (journalRes.data as { data: Journal[] }).data;
        if (Array.isArray(journals) && journals.length > 0) {
          setLatestJournal(journals[0]);
        }
      }

      if (articlesRes?.data) {
        const articles = Array.isArray(articlesRes.data) ? articlesRes.data : (articlesRes.data as { data: Article[] }).data;
        if (Array.isArray(articles)) {
          setRecommendedArticles(articles);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoadingWidgets(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, moodRefreshTrigger]);

  return {
    user,
    moodHistory,
    categories,
    latestJournal,
    recommendedArticles,
    isLoadingWidgets,
    breathingWidgetData,
  };
}
