"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminService, uploadService } from "@/services/api";
import { httpClient } from "@/services/http/client";
import { SongCategory, Song } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

export interface SongWithCategory extends Omit<Song, 'category'> {
  category?: { id: number; name: string };
}

export function useAdminSongs() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  // URL state
  const activeTab = searchParams.get("tab") || "songs";
  const urlSearchSong = searchParams.get("search") || "";
  const urlSearchCategory = searchParams.get("categorySearch") || "";
  const selectedCategoryIdParam = searchParams.get("category");
  const selectedCategoryId: number | "all" = selectedCategoryIdParam === null ? "all" : selectedCategoryIdParam === "all" ? "all" : parseInt(selectedCategoryIdParam, 10);

  // Local state
  const [songSearchTerm, setSongSearchTerm] = useState(urlSearchSong);
  const [categorySearchTerm, setCategorySearchTerm] = useState(urlSearchCategory);

  const debouncedSongSearch = useDebounce(songSearchTerm, 500);
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
    setSongSearchTerm(urlSearchSong);
  }, [urlSearchSong]);

  useEffect(() => {
    setCategorySearchTerm(urlSearchCategory);
  }, [urlSearchCategory]);

  // Update URL from debounced state
  useEffect(() => {
    if (debouncedSongSearch !== urlSearchSong) {
      updateUrl({ search: debouncedSongSearch || null });
    }
  }, [debouncedSongSearch, updateUrl, urlSearchSong]);

  useEffect(() => {
    if (debouncedCategorySearch !== urlSearchCategory) {
      updateUrl({ categorySearch: debouncedCategorySearch || null });
    }
  }, [debouncedCategorySearch, updateUrl, urlSearchCategory]);

  const setSearchSong = (value: string) => setSongSearchTerm(value);
  const setSearchCategory = (value: string) => setCategorySearchTerm(value);
  const setSelectedCategoryId = (value: number | "all") => updateUrl({ category: value === "all" ? null : value.toString() });
  const setActiveTab = (value: string) => updateUrl({ tab: value === "songs" ? null : value });

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [songs, setSongs] = useState<SongWithCategory[]>([]);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [songDialog, setSongDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", thumbnail: "" });
  const [songForm, setSongForm] = useState({ title: "", file_path: "", thumbnail: "", category_id: 0 });
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deleteSongId, setDeleteSongId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<SongCategory | null>(null);
  const [editingSong, setEditingSong] = useState<SongWithCategory | null>(null);
  const [cannotDeleteDialog, setCannotDeleteDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, title: "", message: "" });
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSongSearch, debouncedCategorySearch, selectedCategoryId]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await httpClient.get<{ data?: SongCategory[] }>("/song-categories");
      setCategories(data.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const loadSongs = useCallback(async () => {
    if (!token) return;
    try {
      const categoryId = selectedCategoryId === "all" ? undefined : selectedCategoryId;
      const response = await adminService.getSongs(token, {
        category_id: categoryId,
        search: urlSearchSong || undefined,
        page,
        limit,
      });
      setSongs((response.data || []) as SongWithCategory[]);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  }, [token, selectedCategoryId, urlSearchSong, page, limit]);

  useEffect(() => {
    loadCategories();
    loadSongs();
  }, [loadCategories, loadSongs]);

  const openCategoryDialog = (category?: SongCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, thumbnail: category.thumbnail || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", thumbnail: "" });
    }
    setCategoryDialog(true);
  };

  const saveCategory = async () => {
    if (!token || !categoryForm.name) return;
    try {
      if (editingCategory) {
        await httpClient.put(
          `/admin/song-categories/${editingCategory.id}`,
          categoryForm,
          { token }
        );
      } else {
        await adminService.createSongCategory(token, categoryForm);
      }
      setCategoryDialog(false);
      setCategoryForm({ name: "", thumbnail: "" });
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!token || !deleteCategoryId) return;
    try {
      await adminService.deleteSongCategory(token, deleteCategoryId);
      setDeleteCategoryId(null);
      loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploadingAudio(true);
    try {
      const response = await uploadService.uploadAudio(token, file);
      setSongForm({ ...songForm, file_path: response.data.url });
    } catch (error) {
      console.error("Failed to upload audio:", error);
      setErrorDialog({
        open: true,
        title: "Gagal Mengunggah Audio",
        message: (error as Error).message || "Terjadi kesalahan saat mengunggah file audio."
      });
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  const saveSong = async () => {
    if (!token || !songForm.title || !songForm.file_path || !songForm.category_id) return;
    try {
      if (editingSong) {
        await adminService.updateSong(token, editingSong.id, { ...songForm, category_id: songForm.category_id });
      } else {
        await adminService.createSong(token, { ...songForm, category_id: songForm.category_id });
      }
      setSongDialog(false);
      setSongForm({ title: "", file_path: "", thumbnail: "", category_id: 0 });
      setEditingSong(null);
      loadSongs();
    } catch (error) {
      console.error("Failed to save song:", error);
    }
  };

  const openSongDialog = (song?: SongWithCategory) => {
    if (song) {
      setEditingSong(song);
      setSongForm({
        title: song.title,
        file_path: song.file_path,
        thumbnail: song.thumbnail || "",
        category_id: song.category_id || (song.category?.id || 0),
      });
    } else {
      setEditingSong(null);
      setSongForm({ title: "", file_path: "", thumbnail: "", category_id: 0 });
    }
    setSongDialog(true);
  };

  const handleDeleteSong = async () => {
    if (!token || !deleteSongId) return;
    try {
      await adminService.deleteSong(token, deleteSongId);
      setDeleteSongId(null);
      loadSongs();
    } catch (error) {
      console.error("Failed to delete song:", error);
    }
  };

  return {
    user,
    token,
    activeTab,
    searchSong: songSearchTerm,
    searchCategory: categorySearchTerm,
    selectedCategoryId,
    categories,
    songs,
    categoryDialog,
    songDialog,
    categoryForm,
    songForm,
    isUploadingAudio,
    deleteCategoryId,
    deleteSongId,
    editingCategory,
    editingSong,
    cannotDeleteDialog,
    errorDialog,
    audioInputRef,
    setSearchSong,
    setSearchCategory,
    setSelectedCategoryId,
    setActiveTab,
    setCategoryDialog,
    setSongDialog,
    setCategoryForm,
    setSongForm,
    setDeleteCategoryId,
    setDeleteSongId,
    setCannotDeleteDialog,
    setErrorDialog,
    openCategoryDialog,
    saveCategory,
    handleDeleteCategory,
    handleAudioUpload,
    saveSong,
    openSongDialog,
    handleDeleteSong,
    page,
    totalPages,
    setPage
  };
}
