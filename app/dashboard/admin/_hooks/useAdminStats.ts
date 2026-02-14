"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { httpClient } from "@/services/http/client";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    this_month: number;
    growth: number;
    chart_data: number[];
  };
  articles: {
    total: number;
    this_month: number;
    blocked: number;
    categories: number;
  };
  chat_sessions: {
    total: number;
    today: number;
    chart_data: number[];
  };
  messages: {
    total: number;
    today: number;
  };
  songs: {
    total: number;
    categories: number;
  };
  moods: {
    total: number;
    today: number;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    is_blocked: boolean;
    created_at: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

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
      const data = await httpClient.get<ApiResponse<DashboardStats>>("/admin/stats", {
        token,
      });
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, user };
}
