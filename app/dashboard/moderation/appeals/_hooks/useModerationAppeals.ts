"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import type { Appeal } from "@/types/moderation";

export function useModerationAppeals() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusFilter = searchParams.get("status") || "pending";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
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

  const setStatusFilter = (value: string) =>
    updateUrl({ status: value === "pending" ? null : value, page: null });
  const setPage = (value: number) => updateUrl({ page: value > 1 ? value.toString() : null });

  const loadAppeals = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await moderationService.getAppeals(token, {
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit,
      });
      const data = res as { data: Appeal[]; meta?: { total_pages: number } };
      setAppeals(data.data || []);
      setTotalPages(data.meta?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load appeals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter, page]);

  useEffect(() => {
    loadAppeals();
  }, [loadAppeals]);

  const review = useCallback(
    async (appealId: number, status: "approved" | "rejected", notes?: string) => {
      if (!token) return;
      setProcessingId(appealId);
      try {
        await moderationService.reviewAppeal(token, appealId, { status, notes });
        await loadAppeals();
      } catch (error) {
        console.error("Failed to review appeal:", error);
        throw error;
      } finally {
        setProcessingId(null);
      }
    },
    [token, loadAppeals]
  );

  return {
    appeals,
    isLoading,
    statusFilter,
    page,
    totalPages,
    processingId,
    setStatusFilter,
    setPage,
    loadAppeals,
    review,
  };
}
