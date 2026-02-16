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
      updateUrl({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, updateUrl, urlSearch]);

  useEffect(() => {
    if (debouncedMySearch !== urlMySearch) {
      updateUrl({ mySearch: debouncedMySearch || null });
    }
  }, [debouncedMySearch, updateUrl, urlMySearch]);

  const setActiveTab = (value: string) => updateUrl({ tab: value === "browse" ? null : value });
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
        search: urlSearch || undefined, // Use URL value (which matches debounced)
      }) as { data: Article[] };
      setPublishedArticles(response.data || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsBrowseLoading(false);
    }
  }, [selectedCategory, urlSearch]);

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
    a.title.toLowerCase().includes(urlMySearch.toLowerCase())
  );

  const filteredPublishedArticles = publishedArticles.filter((article) => !isBlocked(article.author?.id || article.user_id));

  return {
    user,
    activeTab,
    search: searchTerm,
    mySearch: mySearchTerm,
    selectedCategory,
    categories,
    publishedArticles: filteredPublishedArticles,
    isBrowseLoading,
    myArticles: filteredMyArticles,
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
