"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import type { UserReport } from "@/types/moderation";
import { useDebounce } from "@/hooks/use-debounce";

export function useModerationReports() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  // URL state
  const statusFilter = searchParams.get("status") || "pending";
  const typeFilter = searchParams.get("type") || "all";
  const urlSearchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state from URL
  useEffect(() => {
    setSearchTerm(urlSearchQuery);
  }, [urlSearchQuery]);

  // Update URL from debounced state
  useEffect(() => {
    if (debouncedSearch !== urlSearchQuery) {
      updateUrl({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, updateUrl, urlSearchQuery]);

  const setStatusFilter = (value: string) => updateUrl({ status: value === "pending" ? null : value, page: null });
  const setTypeFilter = (value: string) => updateUrl({ type: value === "all" ? null : value, page: null });
  const setSearchQuery = (value: string) => setSearchTerm(value);
  const setPage = (value: number) => updateUrl({ page: value > 1 ? value.toString() : null });

  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const loadReports = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await moderationService.getReports(token, {
        status: statusFilter === "all" ? undefined : statusFilter,
        report_type: typeFilter === "all" ? undefined : typeFilter,
        page,
        limit,
      });

      const data = res as { data: UserReport[]; meta?: { total_pages: number } };
      setReports(data.data || []);
      setTotalPages(data.meta?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter, typeFilter, page]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredReports = reports.filter((report) =>
    (report.content_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reported_user_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    statusFilter,
    typeFilter,
    searchQuery: searchTerm,
    page,
    reports: filteredReports,
    isLoading,
    totalPages,
    setStatusFilter,
    setTypeFilter,
    setSearchQuery,
    setPage,
    loadReports,
  };
}
