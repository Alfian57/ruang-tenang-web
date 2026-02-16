"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { adminService, forumService } from "@/services/api";
import { Forum, ForumCategory } from "@/types/forum";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export function useAdminForums() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  const activeTab = searchParams.get("tab") || "forums";
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setSearch = (value: string) => updateUrl({ search: value || null });
  const setStatusFilter = (value: string) => updateUrl({ status: value === "all" ? null : value });
  const setActiveTab = (value: string) => updateUrl({ tab: value === "forums" ? null : value });
  
  const [forums, setForums] = useState<Forum[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [blockId, setBlockId] = useState<number | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [forumsRes, categoriesRes] = await Promise.all([
        adminService.getForums(token, {
          page,
          limit,
          search: search || undefined
        }),
        adminService.getForumCategories(token)
      ]);
      setForums(forumsRes.data || []);
      setTotalPages(forumsRes.meta?.total_pages || 1);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, limit, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteCategory = async () => {
    if (!token || !deleteId) return;
    try {
      await adminService.deleteForumCategory(token, deleteId);
      toast.success("Kategori berhasil dihapus");
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Gagal menghapus kategori");
    }
  };

  const handleSaveCategory = async () => {
    if (!token || !categoryName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await adminService.updateForumCategory(token, editingCategory.id, categoryName);
        toast.success("Kategori diperbarui");
      } else {
        await adminService.createForumCategory(token, categoryName);
        toast.success("Kategori dibuat");
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      loadData();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Gagal menyimpan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCategoryModal = (category?: ForumCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setIsCategoryModalOpen(true);
  };

  const confirmToggleFlag = async () => {
    if (!token || !blockId) return;
    try {
      await adminService.toggleForumFlag(token, blockId);
      toast.success("Status forum berhasil diperbarui");
      setBlockId(null);
      loadData();
    } catch (error) {
      console.error("Failed to toggle flag:", error);
      toast.error("Gagal mengubah status forum");
    }
  };

  const filteredForums = forums.filter(f => {
    // Only filter by status client-side as search is handled by API
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "flagged" && f.is_flagged) ||
      (statusFilter === "published" && !f.is_flagged);
    return matchesStatus;
  });

  return {
    user,
    activeTab,
    search,
    statusFilter,
    forums: filteredForums, // Returning filtered forums directly
    allForums: forums,     // Returning all forums if needed for helper lookups (e.g. block modal text)
    categories,
    isLoading,
    deleteId,
    blockId,
    isCategoryModalOpen,
    editingCategory,
    categoryName,
    isSubmitting,
    setSearch,
    setStatusFilter,
    setActiveTab,
    setDeleteId,
    setBlockId,
    setIsCategoryModalOpen,
    setCategoryName,
    handleDeleteCategory,
    handleSaveCategory,
    openCategoryModal,
    confirmToggleFlag,
    page,
    totalPages,
    setPage,
  };
}
