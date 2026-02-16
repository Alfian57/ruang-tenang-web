"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminService } from "@/services/api";
import { DashboardStats } from "@/types/admin";

export function useAdminDashboard() {
  const { token, user } = useAuthStore();
  const isModerator = user?.role === "moderator";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await adminService.getStats(token) as { data: DashboardStats };
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    user,
    isModerator,
    stats,
    isLoading,
  };
}
