"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminService, uploadService } from "@/services/api";
import { httpClient } from "@/services/http/client";
import { SongCategory, Song } from "@/types";

export interface SongWithCategory extends Omit<Song, 'category'> {
  category?: { id: number; name: string };
}

export function useAdminSongs() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  const activeTab = searchParams.get("tab") || "songs";
  const searchSong = searchParams.get("search") || "";
  const searchCategory = searchParams.get("categorySearch") || "";
  const selectedCategoryIdParam = searchParams.get("category");
  const selectedCategoryId: number | "all" = selectedCategoryIdParam === null ? "all" : selectedCategoryIdParam === "all" ? "all" : parseInt(selectedCategoryIdParam, 10);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setSearchSong = (value: string) => updateUrl({ search: value || null });
  const setSearchCategory = (value: string) => updateUrl({ categorySearch: value || null });
  const setSelectedCategoryId = (value: number | "all") => updateUrl({ category: value === "all" ? null : value.toString() });
  const setActiveTab = (value: string) => updateUrl({ tab: value === "songs" ? null : value });

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
      const response = await adminService.getSongs(token, { category_id: categoryId });
      setSongs((response.data || []) as SongWithCategory[]);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  }, [token, selectedCategoryId]);

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
    searchSong,
    searchCategory,
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
    handleDeleteSong
  };
}
