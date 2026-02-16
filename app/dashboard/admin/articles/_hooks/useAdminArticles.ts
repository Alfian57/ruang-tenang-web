"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminService, moderationService, articleService } from "@/services/api";
import { httpClient } from "@/services/http/client";
import { ArticleCategory } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

export interface AdminArticle {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  category_id: number;
  category: { id: number; name: string };
  status: string;
  moderation_status?: string;
  user_id?: number;
  author?: { id: number; name: string };
  created_at: string;
}

export function useAdminArticles() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  // URL state
  const activeTab = searchParams.get("tab") || "articles";
  const urlSearch = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const urlCategorySearch = searchParams.get("categorySearch") || "";

  // Local state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [categorySearchTerm, setCategorySearchTerm] = useState(urlCategorySearch);

  // Debounced values
  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedCategorySearch = useDebounce(categorySearchTerm, 500);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state from URL
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setCategorySearchTerm(urlCategorySearch);
  }, [urlCategorySearch]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, debouncedCategorySearch]);

  // Update URL from debounced state
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, updateUrl, urlSearch]);

  useEffect(() => {
    if (debouncedCategorySearch !== urlCategorySearch) {
      updateUrl({ categorySearch: debouncedCategorySearch || null });
    }
  }, [debouncedCategorySearch, updateUrl, urlCategorySearch]);

  const setSearch = (value: string) => setSearchTerm(value);
  const setStatusFilter = (value: string) => updateUrl({ status: value || null });
  const setCategorySearch = (value: string) => setCategorySearchTerm(value);
  const setActiveTab = (value: string) => updateUrl({ tab: value === "articles" ? null : value });

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Articles state
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", category_id: 0, thumbnail: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [blockId, setBlockId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Categories state
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [cannotDeleteCategoryDialog, setCannotDeleteCategoryDialog] = useState(false);
  const [isCategorySaving, setIsCategorySaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        adminService.getArticles(token, {
          status: statusFilter || undefined,
          search: urlSearch || undefined, // Use URL value (debounced)
          page,
          limit,
        }),
        articleService.getCategories(),
      ]);
      
      setArticles(articlesRes.data || []);
      setTotalPages(articlesRes.meta?.total_pages || 1);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter, urlSearch, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Article Functions
  const openCreateDialog = () => {
    setEditingArticle(null);
    setFormData({ title: "", content: "", category_id: categories[0]?.id || 0, thumbnail: "" });
    setEditDialog(true);
  };

  const openEditDialog = async (article: AdminArticle) => {
    if (!token) return;
    try {
      // Fetch full article content
      const data = await httpClient.get<{ data: { title: string; content: string; category_id: number; thumbnail: string } }>(`/articles/${article.id}`, {
        token,
      });
      const fullArticle = data.data;
      
      setEditingArticle(article);
      setFormData({
        title: fullArticle.title || article.title,
        content: fullArticle.content || "",
        category_id: fullArticle.category_id || article.category_id,
        thumbnail: fullArticle.thumbnail || article.thumbnail || "",
      });
      setEditDialog(true);
    } catch (error) {
      console.error("Failed to load article for editing:", error);
    }
  };

  const saveArticle = async () => {
    if (!token || !formData.title || !formData.content) return;
    setIsSaving(true);
    try {
      if (editingArticle) {
        await httpClient.put(`/admin/articles/${editingArticle.id}`, formData, { token });
      } else {
        await httpClient.post("/admin/articles", formData, { token });
      }
      setEditDialog(false);
      loadData();
    } catch (error) {
      console.error("Failed to save article:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await adminService.deleteArticle(token, deleteId);
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const handleBlock = async () => {
    if (!token || !blockId) return;
    const article = articles.find(a => a.id === blockId);
    if (!article) return;

    try {
      if (article.status === "blocked") {
        await adminService.updateArticleStatus(token, blockId, "published");
      } else {
        await adminService.updateArticleStatus(token, blockId, "blocked");
      }
      setBlockId(null);
      loadData();
    } catch (error) {
      console.error("Failed to block/unblock article:", error);
    }
  };

  const handleApprove = async (articleId: number) => {
    if (!token) return;
    try {
      await moderationService.moderateArticle(token, articleId, { action: "approve" });
      loadData();
    } catch (error) {
      console.error("Failed to approve article:", error);
    }
  };

  const handleReject = async (articleId: number) => {
    if (!token) return;
    try {
      await moderationService.moderateArticle(token, articleId, { action: "reject", notes: "Ditolak oleh admin" });
      loadData();
    } catch (error) {
      console.error("Failed to reject article:", error);
    }
  };

  // Category Functions
  const openCategoryDialog = (category?: ArticleCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setCategoryDialog(true);
  };

  const saveCategory = async () => {
    if (!token || !categoryForm.name) return;
    setIsCategorySaving(true);
    try {
      if (editingCategory) {
        await httpClient.put(`/admin/article-categories/${editingCategory.id}`, categoryForm, { token });
      } else {
        await httpClient.post("/admin/article-categories", categoryForm, { token });
      }
      setCategoryDialog(false);
      loadData();
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setIsCategorySaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!token || !deleteCategoryId) return;
    try {
      await httpClient.delete(`/admin/article-categories/${deleteCategoryId}`, { token });
      setDeleteCategoryId(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return {
    user,
    token,
    activeTab,
    search: searchTerm,
    statusFilter,
    categorySearch: categorySearchTerm,
    articles,
    categories,
    isLoading,
    editDialog,
    editingArticle,
    formData,
    deleteId,
    blockId,
    isSaving,
    categoryDialog,
    editingCategory,
    categoryForm,
    deleteCategoryId,
    cannotDeleteCategoryDialog,
    isCategorySaving,
    setSearch,
    setStatusFilter,
    setCategorySearch,
    setActiveTab,
    setEditDialog,
    setFormData,
    setDeleteId,
    setBlockId,
    setCategoryDialog,
    setCategoryForm,
    setDeleteCategoryId,
    setCannotDeleteCategoryDialog,
    openCreateDialog,
    openEditDialog,
    saveArticle,
    handleDelete,
    handleBlock,
    handleApprove,
    handleReject,
    openCategoryDialog,
    saveCategory,
    handleDeleteCategory,
    page,
    totalPages,
    setPage
  };
}
