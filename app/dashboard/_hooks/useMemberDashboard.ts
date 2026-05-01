"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { breathingService, moodService, songService, journalService, articleService, chatService, billingService } from "@/services/api";
import { UserMood, SongCategory, Journal, Article, ChatSession, BillingStatus } from "@/types";
import { BreathingWidgetData } from "@/types/breathing";
import { useDashboardStore } from "@/store/dashboardStore";

export function useMemberDashboard() {
  const { user, token } = useAuthStore();
  const [moodHistory, setMoodHistory] = useState<UserMood[]>([]);
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [recentJournals, setRecentJournals] = useState<Journal[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);

  // Widget States
  const [latestJournal, setLatestJournal] = useState<Journal | null>(null);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  const [isNetworkDegraded, setIsNetworkDegraded] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  // Breathing widget state
  const [breathingWidgetData, setBreathingWidgetData] = useState<BreathingWidgetData | null>(null);

  const { moodRefreshTrigger } = useDashboardStore();

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setIsLoadingWidgets(true);
    try {
      const [moodResult, categoriesResult, breathingResult, journalResult, articleResult, chatResult, billingResult] = await Promise.allSettled([
        moodService.getHistory(token, { limit: 100 }),
        songService.getCategories(),
        breathingService.getWidgetData(token),
        journalService.list(token, { limit: 20 }),
        articleService.getArticles({ limit: 3 }),
        chatService.getSessions(token, { page: 1, limit: 20 }),
        billingService.getStatus(token),
      ]);

      const failedRequests = [moodResult, categoriesResult, breathingResult, journalResult, articleResult, chatResult, billingResult].filter(
        (result) => result.status === "rejected"
      ).length;
      setIsNetworkDegraded(failedRequests > 0);

      if (moodResult.status === "fulfilled") {
        const moodPayload = moodResult.value.data as UserMood[] | { moods?: UserMood[] };
        if (Array.isArray(moodPayload)) {
          setMoodHistory(moodPayload);
        } else if (Array.isArray(moodPayload?.moods)) {
          setMoodHistory(moodPayload.moods);
        }
      }

      if (categoriesResult.status === "fulfilled") {
        const categoryPayload = categoriesResult.value.data as SongCategory[];
        if (Array.isArray(categoryPayload)) {
          setCategories(categoryPayload);
        }
      }

      if (breathingResult.status === "fulfilled" && breathingResult.value?.data) {
        setBreathingWidgetData(breathingResult.value.data as unknown as BreathingWidgetData);
      }

      if (journalResult.status === "fulfilled" && journalResult.value?.data) {
        const journalPayload = journalResult.value.data as Journal[] | { data?: Journal[] };
        const journals = Array.isArray(journalPayload)
          ? journalPayload
          : Array.isArray(journalPayload.data)
            ? journalPayload.data
            : [];

        setRecentJournals(journals);
        if (journals.length > 0) {
          setLatestJournal(journals[0]);
        } else {
          setLatestJournal(null);
        }
      }

      if (articleResult.status === "fulfilled" && articleResult.value?.data) {
        const articles = articleResult.value.data as Article[];
        if (Array.isArray(articles)) {
          setRecommendedArticles(articles);
        }
      }

      if (chatResult.status === "fulfilled" && chatResult.value?.data) {
        const chatPayload = chatResult.value.data as ChatSession[] | { data?: ChatSession[] };
        const sessions = Array.isArray(chatPayload)
          ? chatPayload
          : Array.isArray(chatPayload.data)
            ? chatPayload.data
            : [];

        setChatSessions(sessions);
      }

      if (billingResult.status === "fulfilled" && billingResult.value?.data) {
        setBillingStatus(billingResult.value.data);
      }

      setLastSyncAt(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setIsNetworkDegraded(true);
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
    recentJournals,
    chatSessions,
    billingStatus,
    latestJournal,
    recommendedArticles,
    isLoadingWidgets,
    isNetworkDegraded,
    lastSyncAt,
    refreshDashboardData: loadDashboardData,
    breathingWidgetData,
  };
}
