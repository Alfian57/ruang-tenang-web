"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import { ModerationQueueItem } from "@/types/moderation";
import { useDebounce } from "@/hooks/use-debounce";

export function useModerationQueue() {
    const { token } = useAuthStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // URL state
    const statusFilter = searchParams.get("status") || "pending";
    const urlSearchQuery = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    // Local state
    const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
    const debouncedSearch = useDebounce(searchTerm, 500);

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

    const setStatusFilter = (value: string) =>
        updateUrl({ status: value === "pending" ? null : value, page: null });
    const setSearchQuery = (value: string) => setSearchTerm(value);
    const setPage = (value: number) =>
        updateUrl({ page: value > 1 ? value.toString() : null });

    const [items, setItems] = useState<ModerationQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const loadQueue = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await moderationService.getQueue(token, {
                status: statusFilter === "all" ? undefined : statusFilter,
                page,
                limit,
            });

            const data = res as {
                data: ModerationQueueItem[];
                meta?: { total_pages: number };
            };
            setItems(data.data || []);
            setTotalPages(data.meta?.total_pages || 1);
        } catch (error) {
            console.error("Failed to load moderation queue:", error);
        } finally {
            setIsLoading(false);
        }
    }, [token, statusFilter, page]);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    const filteredItems = items.filter(
        (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        items: filteredItems,
        isLoading,
        totalPages,
        page,
        statusFilter,
        searchQuery: searchTerm,
        setPage,
        setStatusFilter,
        setSearchQuery,
        loadQueue,
    };
}
