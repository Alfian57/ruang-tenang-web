"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { storyService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";
import { StoryCard, StoryCategory } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

export function useStoriesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const isBlocked = useBlockStore((s) => s.isBlocked);
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [categories, setCategories] = useState<StoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [hasError, setHasError] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const storyView = searchParams.get("storyView") === "mine" ? "mine" : "public";

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const urlSearchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const sortBy = (searchParams.get("sort") || "recent") as "recent" | "hearts" | "featured";

  // Local state for input
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync state with URL when URL changes
  useEffect(() => {
    setSearchTerm(urlSearchQuery);
  }, [urlSearchQuery]);

  // Update URL when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== urlSearchQuery) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) params.set("search", debouncedSearch); else params.delete("search");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams, urlSearchQuery]);

  const updateListUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const setSelectedCategory = (value: string) => updateListUrl("category", value === "all" ? null : value);
  const setSortBy = (value: "recent" | "hearts" | "featured") => updateListUrl("sort", value === "recent" ? null : value);
  const setStoryView = (value: "public" | "mine") => updateListUrl("storyView", value === "public" ? null : value);
  const setPage = useCallback((next: number) => updateUrlParam("page", next > 1 ? String(next) : null), [updateUrlParam]);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = storyView === "mine" && token
        ? await storyService.getMyStories(token, { page, limit: 12 })
        : await storyService.getStories({
        page,
        limit: 12,
        sort_by: sortBy,
        category_id: selectedCategory !== "all" ? selectedCategory : undefined,
        search: urlSearchQuery.trim() || undefined, // Use URL value
      });
      setStories((response.data || []).map((story) => storyView === "mine" ? { ...story, is_own: true } : story));
      setTotalPages(response.meta?.total_pages || 1);
      if (response.meta && page > response.meta.total_pages && page > 1) setPage(Math.max(1, response.meta.total_pages));
    } catch (error) {
      console.error("Failed to load stories:", error);
      setStories([]);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedCategory, urlSearchQuery, token, storyView, setPage]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await storyService.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const filteredStories = stories.filter((story) => storyView === "mine" || story.is_anonymous || !isBlocked(story.author?.id));

  return {
    router,
    stories: filteredStories,
    categories,
    loading,
    page,
    setPage,
    totalPages,
    hasError,
    retry: loadStories,
    storyView,
    setStoryView,
    searchQuery: searchTerm,
    selectedCategory,
    sortBy,
    setSearchQuery: setSearchTerm,
    setSelectedCategory,
    setSortBy,
  };
}
