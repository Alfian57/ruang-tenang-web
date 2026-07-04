"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { articleService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { httpClient } from "@/services/http/client";
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
    } catch {
      console.error("Failed to block user:", error);
      toast.error("Gagal memblokir pengguna");
    } finally {
      setIsBlocking(false);
    }
  };

  const loadArticle = useCallback(async () => {
    const slug = params.slug as string;
    if (!slug) return;

    setIsLoading(true);
    try {
      let articleData;
      if (isAdmin && token) {
        try {
          // Admin needs to fetch using the full details endpoint. Since slug may not be supported by /admin/articles directly (if it uses ID), we fallback to the normal endpoints if not found. Or in this case we have modified the admin GetArticle to support string id parameter which uses First(&article, id) that might fail with slug.
          // In the repository, First(&article, id) usually matches integer PK. We'll try user endpoints if admin fails.
          const res = await httpClient.get<{ data: Article }>(`/admin/articles/${slug}`, { token });
          articleData = res.data;
        } catch {
          try {
            const res = await articleService.getArticle(slug, token || undefined);
            articleData = res.data;
          } catch (e) {
            throw e;
          }
        }
      } else {
        try {
          const res = await articleService.getArticle(slug, token || undefined);
          articleData = res.data;
        } catch (error: unknown) {
          if (token) {
            try {
              const res = await articleService.getArticleForUser(token, slug);
              articleData = res.data;
            } catch {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      const relatedRes = await articleService.getArticles({ limit: 6 });
      
      setArticle(articleData);
      setRelatedArticles(
        (relatedRes.data || []).filter((a) => a.slug !== slug).slice(0, 5)
      );
    } catch {
      console.error("Failed to load article:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug, token]);

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
