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
  const { token, user } = useAuthStore();
  const isBlocked = useBlockStore((s) => s.isBlocked);
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [featuredStories, setFeaturedStories] = useState<StoryCard[]>([]);
  const [categories, setCategories] = useState<StoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchParams = useSearchParams();
  const pathname = usePathname();

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
      updateUrlParam("search", debouncedSearch || null);
    }
  }, [debouncedSearch, updateUrlParam, urlSearchQuery]);

  const setSelectedCategory = (value: string) => updateUrlParam("category", value === "all" ? null : value);
  const setSortBy = (value: "recent" | "hearts" | "featured") => updateUrlParam("sort", value === "recent" ? null : value);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await storyService.getStories({
        page,
        limit: 12,
        sort_by: sortBy,
        category_id: selectedCategory !== "all" ? selectedCategory : undefined,
        search: urlSearchQuery.trim() || undefined, // Use URL value
      });

      const publicStories = Array.isArray(response.data) ? response.data : [];
      let combinedStories = publicStories;

      if (token && user?.id) {
        const myResponse = await storyService.getMyStories(token, { page: 1, limit: 100 });
        const myStories = Array.isArray(myResponse.data) ? myResponse.data : [];

        const myStoriesMap = new Map(
          myStories.map((story) => [story.id, { ...story, is_own: true } as StoryCard])
        );

        const mergedPublic = publicStories.map((story) => {
          const mine = myStoriesMap.get(story.id);
          if (!mine) {
            return story;
          }
          return {
            ...story,
            status: mine.status,
            is_own: true,
          };
        });

        // Show non-public own stories at top of first page so user can always see them.
        const nonPublicOwnStories =
          page === 1
            ? myStories
                .filter((story) => story.status && story.status !== "approved")
                .filter((story) => {
                  const text = `${story.title} ${story.excerpt}`.toLowerCase();
                  const matchesSearch = !urlSearchQuery.trim() || text.includes(urlSearchQuery.trim().toLowerCase());
                  const matchesCategory =
                    selectedCategory === "all" ||
                    !!story.categories?.some((cat) => cat.slug === selectedCategory);
                  return matchesSearch && matchesCategory;
                })
                .map((story) => ({ ...story, is_own: true as const }))
            : [];

        const seen = new Set<string>();
        combinedStories = [...nonPublicOwnStories, ...mergedPublic].filter((story) => {
          if (seen.has(story.id)) return false;
          seen.add(story.id);
          return true;
        });
      }

      setStories(combinedStories);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load stories:", error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedCategory, urlSearchQuery, token, user?.id]);

  const loadFeaturedStories = useCallback(async () => {
    try {
      const response = await storyService.getFeatured();
      if (response.data && Array.isArray(response.data)) {
        setFeaturedStories(response.data.slice(0, 3));
      } else {
        setFeaturedStories([]);
      }
    } catch (error) {
      console.error("Failed to load featured stories:", error);
    }
  }, []);

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
    loadFeaturedStories();
  }, [loadCategories, loadFeaturedStories]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const filteredStories = stories.filter((story) => story.is_own || story.is_anonymous || !isBlocked(story.author?.id));
  const filteredFeaturedStories = featuredStories.filter((story) => story.is_anonymous || !isBlocked(story.author?.id));

  return {
    router,
    stories: filteredStories,
    featuredStories: filteredFeaturedStories,
    categories,
    loading,
    page,
    setPage,
    totalPages,
    searchQuery: searchTerm,
    selectedCategory,
    sortBy,
    setSearchQuery: setSearchTerm,
    setSelectedCategory,
    setSortBy,
  };
}
