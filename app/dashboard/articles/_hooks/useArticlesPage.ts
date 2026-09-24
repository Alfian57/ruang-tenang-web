"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { articleService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";
import { Article, ArticleCategory } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

export interface MyArticle {
  id: number;
  slug: string;
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
  const urlSearch = searchParams.get("search") || "";
  const urlMySearch = searchParams.get("mySearch") || "";
  const selectedCategory = searchParams.get("category") ? parseInt(searchParams.get("category")!, 10) : null;
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);

  // Local state for inputs
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [mySearchTerm, setMySearchTerm] = useState(urlMySearch);

  // Debounced values
  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedMySearch = useDebounce(mySearchTerm, 500);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state with URL when URL changes (e.g. navigation)
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setMySearchTerm(urlMySearch);
  }, [urlMySearch]);

  // Update URL when debounced values change
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl({ search: debouncedSearch || null, page: null });
    }
  }, [debouncedSearch, updateUrl, urlSearch]);

  useEffect(() => {
    if (debouncedMySearch !== urlMySearch) {
      updateUrl({ mySearch: debouncedMySearch || null, page: null });
    }
  }, [debouncedMySearch, updateUrl, urlMySearch]);

  const setActiveTab = (value: string) => updateUrl({ tab: value === "browse" ? null : value, page: null });
  const setSelectedCategory = (id: number | null) => updateUrl({ category: id ? String(id) : null, page: null });
  const setPage = useCallback((next: number) => updateUrl({ page: next > 1 ? String(next) : null }), [updateUrl]);

  // Browse tab state
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isBrowseLoading, setIsBrowseLoading] = useState(true);
  const [browseTotalPages, setBrowseTotalPages] = useState(1);
  const [browseError, setBrowseError] = useState(false);

  // My articles tab state
  const [myArticles, setMyArticles] = useState<MyArticle[]>([]);
  const [isMyLoading, setIsMyLoading] = useState(true);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [myError, setMyError] = useState(false);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);

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
    setBrowseError(false);
    try {
      const response = await articleService.getArticles({
        page,
        limit: 12,
        category_id: selectedCategory || undefined,
        search: urlSearch || undefined, // Use URL value (which matches debounced)
      });
      setPublishedArticles(response.data || []);
      setBrowseTotalPages(response.meta?.total_pages || 1);
      if (response.meta && page > response.meta.total_pages && page > 1) setPage(Math.max(1, response.meta.total_pages));
    } catch (error) {
      console.error("Failed to load articles:", error);
      setBrowseError(true);
    } finally {
      setIsBrowseLoading(false);
    }
  }, [selectedCategory, urlSearch, page, setPage]);

  const loadMyArticles = useCallback(async () => {
    if (!token) return;
    setIsMyLoading(true);
    setMyError(false);
    try {
      const response = await articleService.getMyArticles(token, { page, limit: 10, search: urlMySearch || undefined });
      setMyArticles(response.data || []);
      setMyTotalPages(response.meta?.total_pages || 1);
      if (response.meta && page > response.meta.total_pages && page > 1) setPage(Math.max(1, response.meta.total_pages));
    } catch (error) {
      console.error("Failed to load my articles:", error);
      setMyError(true);
    } finally {
      setIsMyLoading(false);
    }
  }, [token, page, urlMySearch, setPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (activeTab === "browse") void loadPublishedArticles();
  }, [activeTab, loadPublishedArticles]);

  useEffect(() => {
    if (activeTab === "mine") void loadMyArticles();
  }, [activeTab, loadMyArticles]);

  const handleDelete = async (identifier: string) => {
    if (!token) return;
    try {
      await articleService.deleteArticle(token, identifier);
      setDeleteArticleId(null);
      loadMyArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const filteredPublishedArticles = publishedArticles.filter((article) => !isBlocked(article.author?.id || article.user_id));

  return {
    user,
    activeTab,
    search: searchTerm,
    mySearch: mySearchTerm,
    selectedCategory,
    page,
    setPage,
    browseTotalPages,
    myTotalPages,
    browseError,
    myError,
    retryBrowse: loadPublishedArticles,
    retryMine: loadMyArticles,
    categories,
    publishedArticles: filteredPublishedArticles,
    isBrowseLoading,
    myArticles,
    isMyLoading,
    deleteArticleId,
    setActiveTab,
    setSearch: setSearchTerm,
    setMySearch: setMySearchTerm,
    setSelectedCategory,
    setDeleteArticleId,
    handleDelete,
  };
}
