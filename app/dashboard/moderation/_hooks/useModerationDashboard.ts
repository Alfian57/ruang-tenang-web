"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import type { ModerationStats, ModerationQueueItem, UserReport } from "@/types/moderation";
import { toast } from "sonner";

export function useModerationDashboard() {
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [pendingArticles, setPendingArticles] = useState<ModerationQueueItem[]>([]);
  const [recentReports, setRecentReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isModerator = user?.role === "moderator" || user?.role === "admin";

  const loadData = useCallback(async () => {
    if (!token || !isModerator) return;
    
    setIsLoading(true);
    try {
      const [statsRes, queueRes, reportsRes] = await Promise.all([
        moderationService.getStats(token),
        moderationService.getQueue(token, { status: "pending", limit: 5 }),
        moderationService.getReports(token, { status: "pending", limit: 5 }),
      ]);

      setStats(statsRes.data || null); 
      setPendingArticles(queueRes.data || []);
      setRecentReports(reportsRes.data || []);
    } catch (error) {
      console.error("Failed to load moderation data:", error);
      toast.error("Gagal memuat data moderasi");
    } finally {
      setIsLoading(false);
    }
  }, [token, isModerator]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    user,
    isModerator,
    stats,
    pendingArticles,
    recentReports,
    isLoading,
    refreshData: loadData
  };
}
