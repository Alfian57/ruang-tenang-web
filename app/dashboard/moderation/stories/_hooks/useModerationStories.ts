"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { storyService } from "@/services/api";
import type { InspiringStory } from "@/types";

export type StoryModerationAction = "approved" | "rejected" | "revision_requested";

export function useModerationStories() {
  const { token } = useAuthStore();

  const [stories, setStories] = useState<InspiringStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const limit = 10;

  const loadStories = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await storyService.getPending(token, { page, limit });
      const data = res as { data: InspiringStory[]; meta?: { total_pages: number } };
      setStories(data.data || []);
      setTotalPages(data.meta?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load pending stories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const moderate = useCallback(
    async (id: string, status: StoryModerationAction, feedback?: string) => {
      if (!token) return;
      setProcessingId(id);
      try {
        await storyService.moderate(token, id, { status, feedback });
        await loadStories();
      } catch (error) {
        console.error("Failed to moderate story:", error);
        throw error;
      } finally {
        setProcessingId(null);
      }
    },
    [token, loadStories]
  );

  const setFeatured = useCallback(
    async (id: string, featured: boolean) => {
      if (!token) return;
      setProcessingId(id);
      try {
        await storyService.setFeatured(token, id, featured);
        await loadStories();
      } catch (error) {
        console.error("Failed to set featured:", error);
        throw error;
      } finally {
        setProcessingId(null);
      }
    },
    [token, loadStories]
  );

  return {
    stories,
    isLoading,
    page,
    totalPages,
    processingId,
    setPage,
    loadStories,
    moderate,
    setFeatured,
  };
}
