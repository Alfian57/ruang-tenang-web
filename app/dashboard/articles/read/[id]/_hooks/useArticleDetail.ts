"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { articleService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";
import { Article } from "@/types";
import { toast } from "sonner";

export function useArticleDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { blockUser, isBlocked } = useBlockStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";
  const isArticleAuthor = user?.id === article?.author?.id;
  const authorId = article?.author?.id || article?.user_id;

  const handleBlockUser = async () => {
    if (!token || !authorId) return;
    setIsBlocking(true);
    try {
      await blockUser(token, authorId);
      toast.success("Pengguna berhasil diblokir");
      setShowBlockConfirm(false);
      router.back();
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Gagal memblokir pengguna");
    } finally {
      setIsBlocking(false);
    }
  };

  const loadArticle = useCallback(async () => {
    const id = params.id as string;
    if (!id) return;

    setIsLoading(true);
    try {
      const [articleRes, relatedRes] = await Promise.all([
        articleService.getArticle(Number(id)),
        articleService.getArticles({ limit: 6 }),
      ]);
      setArticle(articleRes.data);
      setRelatedArticles(
        (relatedRes.data || []).filter((a) => a.id !== Number(id)).slice(0, 5)
      );
    } catch (error) {
      console.error("Failed to load article:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const getBackLink = () => {
    if (isAdmin) return "/dashboard/admin/articles";
    return "/dashboard/articles";
  };

  return {
    article,
    relatedArticles,
    isLoading,
    isAdmin,
    isModerator,
    isArticleAuthor,
    authorId,
    showBlockConfirm,
    setShowBlockConfirm,
    isBlocking,
    isBlocked,
    handleBlockUser,
    getBackLink,
    router,
  };
}
