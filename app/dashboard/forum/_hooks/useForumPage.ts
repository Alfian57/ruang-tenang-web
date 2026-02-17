"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { forumService } from "@/services/api";
import { Forum, ForumCategory } from "@/types/forum";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";
import { toast } from "sonner";

export function useForumPage() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();
  const isBlocked = useBlockStore((s) => s.isBlocked);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL state management
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Read from URL
  const urlSearch = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") ? parseInt(searchParams.get("category")!, 10) : undefined;

  // Local state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync state from URL
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Update URL from debounced state
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrlParam("search", debouncedSearch || null);
    }
  }, [debouncedSearch, updateUrlParam, urlSearch]);

  const setSearch = (value: string) => setSearchTerm(value);
  const setSelectedCategory = (id: number | undefined) => updateUrlParam("category", id ? String(id) : null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [forumsRes, categoriesRes] = await Promise.all([
        forumService.getAll(token, 20, 0, debouncedSearch, selectedCategory),
        forumService.getCategories()
      ]);
      setForums(forumsRes.data);
      const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes;
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Gagal memuat data forum");
    } finally {
      setIsLoading(false);
    }
  }, [token, debouncedSearch, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateForum = async () => {
    if (!newTitle.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const response = await forumService.create(token, {
        title: newTitle,
        content: newContent,
        category_id: newCategoryId,
      });

      setIsCreateOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategoryId(undefined);

      toast.success("Topik berhasil dibuat, mengalihkan...");

      if (response.data && response.data.slug) {
        router.push(`/dashboard/forum/${response.data.slug}`);
      } else {
        loadData();
      }
    } catch (error) {
      console.error("Failed to create forum:", error);
      toast.error("Gagal membuat topik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleForums = forums.filter((forum) => !isBlocked(forum.user_id));

  return {
    forums: visibleForums,
    categories,
    isLoading,
    search: searchTerm,
    selectedCategory,
    isCreateOpen,
    newTitle,
    newContent,
    newCategoryId,
    isSubmitting,
    setSearch,
    setSelectedCategory,
    setIsCreateOpen,
    setNewTitle,
    setNewContent,
    setNewCategoryId,
    handleCreateForum,
  };
}
