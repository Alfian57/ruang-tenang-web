"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { storyService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/services/http/types";
import { InspiringStory, StoryComment } from "@/types";
import { toast } from "sonner";

function loadDraftStoryFromSession(storyId: string): InspiringStory | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(`story:draft:${storyId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as InspiringStory;
    if (parsed && parsed.id === storyId) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to restore draft story from session:", error);
  }

  return null;
}

export function useStoryDetail() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const storyId = params.id as string;

  const [story, setStory] = useState<InspiringStory | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [heartLoading, setHeartLoading] = useState(false);

  const canComment = story?.status === "approved";

  const loadStory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await storyService.getStory(storyId, token || undefined);
      if (response.data) {
        setStory(response.data);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`story:draft:${storyId}`);
        }
        // Auto-show content if no trigger warning
        if (!response.data.has_trigger_warning) {
          setShowContent(true);
        }
      }
    } catch (error) {
      console.error("Failed to load story:", error);
      if (error instanceof ApiError && error.status === 404) {
        const fallbackStory = loadDraftStoryFromSession(storyId);
        if (fallbackStory) {
          setStory(fallbackStory);
          if (!fallbackStory.has_trigger_warning) {
            setShowContent(true);
          }
          return;
        }
      }

      if (!(error instanceof ApiError && error.status === 404)) {
        toast.error("Gagal memuat kisah");
      }
    } finally {
      setLoading(false);
    }
  }, [storyId, token]);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await storyService.getComments(storyId, {}, token || undefined);
      const list = response.data?.comments;
      setComments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [storyId, token]);

  useEffect(() => {
    loadStory();
    loadComments();
  }, [loadStory, loadComments]);

  const handleToggleHeart = async () => {
    if (!token) {
      toast.error("Silakan login untuk memberikan apresiasi");
      return;
    }
    setHeartLoading(true);
    try {
      if (story?.has_hearted) {
        await storyService.heart(token, storyId);
        setStory((prev) =>
          prev
            ? { ...prev, has_hearted: false, heart_count: prev.heart_count - 1 }
            : null
        );
      } else {
        await storyService.heart(token, storyId);
        setStory((prev) =>
          prev
            ? { ...prev, has_hearted: true, heart_count: prev.heart_count + 1 }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to toggle heart:", error);
      toast.error("Gagal memberikan apresiasi");
    } finally {
      setHeartLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!canComment) {
      toast.error("Komentar hanya tersedia setelah cerita disetujui");
      return;
    }

    if (!token) {
      toast.error("Silakan login untuk berkomentar");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }
    setSubmittingComment(true);
    try {
      const response = await storyService.createComment(token, storyId, {
        content: newComment.trim(),
      });
      if (response.data) {
        setComments((prev) => [response.data, ...prev]);
        setNewComment("");
        setStory((prev) =>
          prev ? { ...prev, comment_count: prev.comment_count + 1 } : null
        );
        toast.success("Komentar berhasil ditambahkan");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Gagal menambahkan komentar");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  return {
    token,
    user,
    storyId,
    story,
    comments,
    loading,
    loadingComments,
    showContent,
    newComment,
    submittingComment,
    heartLoading,
    canComment,
    router,
    setShowContent,
    setNewComment,
    handleToggleHeart,
    handleSubmitComment,
    handleShare,
  };
}
