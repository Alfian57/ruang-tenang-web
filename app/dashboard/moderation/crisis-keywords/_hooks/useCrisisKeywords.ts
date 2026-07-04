"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import type { CrisisKeyword, CreateCrisisKeywordRequest } from "@/types/moderation";

export function useCrisisKeywords() {
  const { token } = useAuthStore();

  const [keywords, setKeywords] = useState<CrisisKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadKeywords = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await moderationService.getCrisisKeywords(token);
      setKeywords((res as { data: CrisisKeyword[] }).data || []);
    } catch (error) {
      console.error("Failed to load crisis keywords:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  const createKeyword = useCallback(
    async (payload: CreateCrisisKeywordRequest) => {
      if (!token) return;
      setIsSaving(true);
      try {
        await moderationService.createCrisisKeyword(token, payload);
        await loadKeywords();
      } catch (error) {
        console.error("Failed to create crisis keyword:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [token, loadKeywords]
  );

  const deleteKeyword = useCallback(
    async (id: number) => {
      if (!token) return;
      setDeletingId(id);
      try {
        await moderationService.deleteCrisisKeyword(token, id);
        await loadKeywords();
      } catch (error) {
        console.error("Failed to delete crisis keyword:", error);
        throw error;
      } finally {
        setDeletingId(null);
      }
    },
    [token, loadKeywords]
  );

  return {
    keywords,
    isLoading,
    isSaving,
    deletingId,
    loadKeywords,
    createKeyword,
    deleteKeyword,
  };
}
