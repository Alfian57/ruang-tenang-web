"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import { DashboardStats } from "@/types/admin";

export function useAdminStats() {
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadStats = async () => {
    if (!token) return;
    try {
      const response = await httpClient.get<ApiResponse<DashboardStats>>("/admin/stats", {
        token,
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, user };
}
