"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import type { ModeratorAction } from "@/types/moderation";

export function useModeratorActions() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const actionType = searchParams.get("action_type") || "all";
  const targetType = searchParams.get("target_type") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [actions, setActions] = useState<ModeratorAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setActionType = (value: string) => updateUrl({ action_type: value === "all" ? null : value, page: null });
  const setTargetType = (value: string) => updateUrl({ target_type: value === "all" ? null : value, page: null });
  const setPage = (value: number) => updateUrl({ page: value > 1 ? value.toString() : null });

  const loadActions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await moderationService.getActions(token, {
        action_type: actionType === "all" ? undefined : actionType,
        target_type: targetType === "all" ? undefined : targetType,
        page,
        limit,
      });
      const data = res as { data: ModeratorAction[]; meta?: { total_pages: number } };
      setActions(data.data || []);
      setTotalPages(data.meta?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load moderator actions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, actionType, targetType, page]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  return {
    actions,
    isLoading,
    totalPages,
    page,
    actionType,
    targetType,
    setActionType,
    setTargetType,
    setPage,
    loadActions,
  };
}
