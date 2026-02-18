"use client";

import { useEffect, useState, useCallback } from "react";
import { storyService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { StoryCard, StoryCategory, StoryStats } from "@/types";

interface StoriesData {
  stories: StoryCard[];
  featuredStories: StoryCard[];
  categories: StoryCategory[];
  myStats: StoryStats | null;
  loading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: "recent" | "hearts" | "featured";
  page: number;
  totalPages: number;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (id: string | null) => void;
  setSortBy: (sort: "recent" | "hearts" | "featured") => void;
  setPage: (fn: (p: number) => number) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export function useStoriesData(): StoriesData {
  const { token } = useAuthStore();
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [featuredStories, setFeaturedStories] = useState<StoryCard[]>([]);
  const [categories, setCategories] = useState<StoryCategory[]>([]);
  const [myStats, setMyStats] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "hearts" | "featured">("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, featuredRes] = await Promise.all([
          storyService.getCategories(),
          storyService.getFeatured().catch(() => ({ data: [] })),
        ]);

        setCategories(categoriesRes.data || []);
        setFeaturedStories(featuredRes.data || []);

        if (token) {
          const statsRes = await storyService.getMyStats(token).catch(() => null);
          if (statsRes?.data) setMyStats(statsRes.data);
        }
      } catch {
        // Silently handle — UI will show empty states
      }
    };

    fetchInitialData();
  }, [token]);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await storyService.getStories({
        category_id: selectedCategory || undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        page,
        limit: 12,
      });

      setStories(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, page]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(() => 1);
  };

  return {
    stories,
    featuredStories,
    categories,
    myStats,
    loading,
    searchQuery,
    selectedCategory,
    sortBy,
    page,
    totalPages,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setPage,
    handleSearch,
  };
}
