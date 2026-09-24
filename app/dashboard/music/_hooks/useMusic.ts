"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { searchService, songService } from "@/services/api";
import { SongCategory, Song, PlaylistListItem } from "@/types";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useAuthStore } from "@/store/authStore";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export function useMusic() {
  // URL state management
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuthStore();

  const activeTab = searchParams.get("tab") || "browse";
  const urlSearch = searchParams.get("search") || "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasError, setHasError] = useState(false);

  // Local state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state from URL
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Update URL from debounced state
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) params.set("search", debouncedSearch); else params.delete("search");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams, urlSearch]);

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "browse") params.delete("tab"); else params.set("tab", tab);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const setPage = useCallback((next: number) => updateUrlParam("page", next > 1 ? String(next) : null), [updateUrlParam]);
  const setSearch = (value: string) => setSearchTerm(value);

  // Data state
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Playlist state
  const [playlists, setPlaylists] = useState<PlaylistListItem[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<PlaylistListItem[]>([]);
  const [adminPlaylists, setAdminPlaylists] = useState<PlaylistListItem[]>([]);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistListItem | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [publicPlaylistsLoading, setPublicPlaylistsLoading] = useState(false);
  const [officialPlaylistsLoading, setOfficialPlaylistsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete playlist state
  const [deletePlaylistId, setDeletePlaylistId] = useState<number | null>(null);
  const [showDeletePlaylistDialog, setShowDeletePlaylistDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global player store
  const {
    currentSong,
    isPlaying,
    playSong,
    setIsPlaying,
  } = useMusicPlayerStore();

  // Derive selectedCategory

  // Data Loading Functions
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await songService.getCategoriesPage({ page, limit: 12 });
      setCategories(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
      if (response.meta && page > response.meta.total_pages && page > 1) setPage(Math.max(1, response.meta.total_pages));
    } catch (error) {
      console.error("Failed to load categories:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, setPage]);

  const loadPlaylists = useCallback(async () => {
    if (!token) return;
    setPlaylistsLoading(true);
    setHasError(false);
    try {
      const response = await songService.getMyPlaylistsPage(token, { page, limit: 10 });
      setPlaylists(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
      if (response.meta && page > response.meta.total_pages && page > 1) setPage(Math.max(1, response.meta.total_pages));
    } catch (error) {
      console.error("Failed to load playlists:", error);
      toast.error("Gagal memuat playlist Anda");
      setHasError(true);
    } finally {
      setPlaylistsLoading(false);
    }
  }, [token, page, setPage]);

  const loadPublicPlaylists = useCallback(async () => {
    setPublicPlaylistsLoading(true);
    setHasError(false);
    try {
      const response = await songService.getPublicPlaylists({ page, limit: 12, kind: "community" });
      setPublicPlaylists(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
      if (response.meta && page > response.meta.total_pages && page > 1) setPage(Math.max(1, response.meta.total_pages));
    } catch (error) {
      console.error("Failed to load public playlists:", error);
      toast.error("Gagal memuat playlist publik");
      setHasError(true);
    } finally {
      setPublicPlaylistsLoading(false);
    }
  }, [page, setPage]);

  const loadOfficialPlaylists = useCallback(async () => {
    setOfficialPlaylistsLoading(true);
    try {
      const response = await songService.getPublicPlaylists({ page: 1, limit: 4, kind: "official" });
      setAdminPlaylists(response.data || []);
    } catch (error) {
      console.error("Failed to load official playlists:", error);
    } finally {
      setOfficialPlaylistsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    if (activeTab === "browse" && !urlSearch) void loadCategories();
    if (activeTab === "playlists") void loadPlaylists();
    if (activeTab === "explore") void loadPublicPlaylists();
  }, [activeTab, urlSearch, loadCategories, loadPlaylists, loadPublicPlaylists]);

  useEffect(() => {
    if (activeTab === "explore") void loadOfficialPlaylists();
  }, [activeTab, loadOfficialPlaylists]);

  // Load songs by category (URL effect)

  // Search effect
  const loadSearch = useCallback(async () => {
    if (!urlSearch || !token) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await searchService.search(urlSearch, { type: "songs", page, limit: 12 }, token);
      setSongs(response.data?.songs || []);
      setTotalPages(response.data?.total_pages || 1);
      if (page > (response.data?.total_pages || 1) && page > 1) setPage(Math.max(1, response.data?.total_pages || 1));
    } catch (error) {
      console.error("Search failed:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [urlSearch, token, page, setPage]);

  useEffect(() => {
    if (activeTab === "browse" && urlSearch) void loadSearch();
  }, [activeTab, urlSearch, loadSearch]);

  // Handlers


  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      playSong(song, songs, { type: "category", name: "Musik" });
    }
  };

  const handlePlaylistEdit = (playlistItem: PlaylistListItem) => {
    setEditingPlaylist(playlistItem);
    setIsPlaylistDialogOpen(true);
  };

  const handlePlaylistDeleteClick = (playlistId: number) => {
    setDeletePlaylistId(playlistId);
    setShowDeletePlaylistDialog(true);
  };

  const handlePlaylistDelete = async () => {
    if (!token || !deletePlaylistId) return;
    setIsDeleting(true);
    try {
      await songService.deletePlaylist(token, deletePlaylistId);
      loadPlaylists();

      setShowDeletePlaylistDialog(false);
      setDeletePlaylistId(null);
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlaylistSave = async (data: { name: string; description?: string; is_public?: boolean }) => {
    if (!token) return;
    setIsSaving(true);
    try {
      if (editingPlaylist) {
        await songService.updatePlaylist(token, editingPlaylist.id, data);
      } else {
        await songService.createPlaylist(token, data);
      }
      loadPlaylists();
      setIsPlaylistDialogOpen(false);
      setEditingPlaylist(null);
    } catch (error) {
      console.error("Failed to save playlist:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // State
    activeTab,
    page,
    setPage,
    totalPages,
    hasError,
    retry: () => {
      if (activeTab === "browse") {
        if (urlSearch) void loadSearch(); else void loadCategories();
      } else if (activeTab === "explore") void loadPublicPlaylists();
      else void loadPlaylists();
    },
    search: searchTerm,
    categories,
    songs,
    isLoading,
    playlists,
    publicPlaylists,
    adminPlaylists,
    isPlaylistDialogOpen,
    editingPlaylist,
    playlistsLoading,
    publicPlaylistsLoading,
    officialPlaylistsLoading,
    isSaving,
    showDeletePlaylistDialog,
    isDeleting,
    
    // Actions - Setters
    setActiveTab,
    setSearch,
    setIsPlaylistDialogOpen,
    setEditingPlaylist,
    setShowDeletePlaylistDialog,
    setDeletePlaylistId,
    setSongs,

    // Actions - Handlers
    handlePlaySong,
    handlePlaylistEdit,
    handlePlaylistDeleteClick,
    handlePlaylistDelete,
    handlePlaylistSave,

    // Player State
    currentSong,
    isPlaying,
    debouncedSearch,
  };
}
