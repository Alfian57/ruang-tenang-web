"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { articleService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";
import { Article, ArticleCategory } from "@/types";

export interface MyArticle {
  id: number;
  title: string;
  thumbnail: string;
  excerpt?: string;
  status: string;
  moderation_status?: string;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export function useArticlesPage() {
  const { token, user } = useAuthStore();
  const isBlocked = useBlockStore((s) => s.isBlocked);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  const activeTab = searchParams.get("tab") || "browse";
  const search = searchParams.get("search") || "";
  const mySearch = searchParams.get("mySearch") || "";
  const selectedCategory = searchParams.get("category") ? parseInt(searchParams.get("category")!, 10) : null;

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setActiveTab = (value: string) => updateUrl({ tab: value === "browse" ? null : value });
  const setSearch = (value: string) => updateUrl({ search: value || null });
  const setMySearch = (value: string) => updateUrl({ mySearch: value || null });
  const setSelectedCategory = (id: number | null) => updateUrl({ category: id ? String(id) : null });

  // Browse tab state
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isBrowseLoading, setIsBrowseLoading] = useState(true);

  // My articles tab state
  const [myArticles, setMyArticles] = useState<MyArticle[]>([]);
  const [isMyLoading, setIsMyLoading] = useState(true);
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const response = await articleService.getCategories() as { data: ArticleCategory[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const loadPublishedArticles = useCallback(async () => {
    setIsBrowseLoading(true);
    try {
      const response = await articleService.getArticles({
        category_id: selectedCategory || undefined,
        search: search || undefined,
      }) as { data: Article[] };
      setPublishedArticles(response.data || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsBrowseLoading(false);
    }
  }, [selectedCategory, search]);

  const loadMyArticles = useCallback(async () => {
    if (!token) return;
    setIsMyLoading(true);
    try {
      const response = await articleService.getMyArticles(token) as { data: MyArticle[] };
      setMyArticles(response.data || []);
    } catch (error) {
      console.error("Failed to load my articles:", error);
    } finally {
      setIsMyLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPublishedArticles();
  }, [loadPublishedArticles]);

  useEffect(() => {
    loadMyArticles();
  }, [loadMyArticles]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await articleService.deleteArticle(token, id);
      setDeleteArticleId(null);
      loadMyArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const filteredMyArticles = myArticles.filter(a =>
    a.title.toLowerCase().includes(mySearch.toLowerCase())
  );

  const filteredPublishedArticles = publishedArticles.filter((article) => !isBlocked(article.author?.id || article.user_id));

  return {
    user,
    activeTab,
    search,
    mySearch,
    selectedCategory,
    categories,
    publishedArticles: filteredPublishedArticles,
    isBrowseLoading,
    myArticles: filteredMyArticles,
    isMyLoading,
    deleteArticleId,
    setActiveTab,
    setSearch,
    setMySearch,
    setSelectedCategory,
    setDeleteArticleId,
    handleDelete,
  };
}
