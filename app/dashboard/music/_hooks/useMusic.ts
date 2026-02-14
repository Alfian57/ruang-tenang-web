"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { searchService, songService } from "@/services/api";
import { SongCategory, Song, Playlist, PlaylistListItem } from "@/types";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useAuthStore } from "@/store/authStore";

export function useMusic() {
  // URL state management
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuthStore();

  const activeTab = searchParams.get("tab") || "browse";
  const search = searchParams.get("search") || "";
  const categoryIdParam = searchParams.get("categoryId");
  const viewMode = (searchParams.get("view") || "browse") as "browse" | "category";

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setActiveTab = (tab: string) => updateUrlParam("tab", tab === "browse" ? null : tab);
  const setSearch = (value: string) => updateUrlParam("search", value || null);
  const setViewMode = (mode: "browse" | "category") => updateUrlParam("view", mode === "browse" ? null : mode);
  const setSelectedCategoryId = (id: number | null) => updateUrlParam("categoryId", id ? String(id) : null);

  // Data state
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Playlist state
  const [playlists, setPlaylists] = useState<PlaylistListItem[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<PlaylistListItem[]>([]);
  const [adminPlaylists, setAdminPlaylists] = useState<PlaylistListItem[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistListItem | null>(null);
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [publicPlaylistsLoading, setPublicPlaylistsLoading] = useState(false);
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
  const selectedCategory = categoryIdParam ? categories.find(c => c.id === parseInt(categoryIdParam, 10)) || null : null;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Data Loading Functions
  const loadCategories = useCallback(async () => {
    try {
      const response = await songService.getCategories() as { data: SongCategory[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPlaylists = useCallback(async () => {
    if (!token) return;
    setPlaylistsLoading(true);
    try {
      const response = await songService.getMyPlaylists(token) as { data: PlaylistListItem[] };
      setPlaylists(response.data || []);
    } catch (error) {
      console.error("Failed to load playlists:", error);
    } finally {
      setPlaylistsLoading(false);
    }
  }, [token]);

  const loadPublicPlaylists = useCallback(async () => {
    setPublicPlaylistsLoading(true);
    try {
      const response = await songService.getPublicPlaylists({ limit: 20 }) as { data: PlaylistListItem[] };
      const allPublic = response.data || [];
      setAdminPlaylists(allPublic.filter(p => p.is_admin_playlist));
      setPublicPlaylists(allPublic.filter(p => !p.is_admin_playlist));
    } catch (error) {
      console.error("Failed to load public playlists:", error);
    } finally {
      setPublicPlaylistsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadCategories();
    loadPlaylists();
    loadPublicPlaylists();
  }, [loadCategories, loadPlaylists, loadPublicPlaylists]);

  // Load songs by category (URL effect)
  useEffect(() => {
    if (selectedCategory && viewMode === "category" && songs.length === 0) {
      const doLoadSongs = async () => {
        try {
          const response = await songService.getSongsByCategory(selectedCategory.id) as { data: Song[] };
          setSongs(response.data || []);
        } catch (error) {
          console.error("Failed to load songs:", error);
        }
      };
      doLoadSongs();
    }
  }, [selectedCategory, viewMode, songs.length]);

  // Search effect
  useEffect(() => {
    if (debouncedSearch) {
      const doSearch = async () => {
        setIsLoading(true);
        try {
          const response = await searchService.search(debouncedSearch);
          setSongs(response.data?.songs || []);
          setSelectedCategoryId(null);
          setViewMode("category");
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      };
      doSearch();
    } else if (viewMode === "category" && !selectedCategory) {
      setViewMode("browse");
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const loadSongs = async (category: SongCategory) => {
    setSelectedCategoryId(category.id);
    setViewMode("category");
    try {
      const response = await songService.getSongsByCategory(category.id) as { data: Song[] };
      setSongs(response.data || []);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  };

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      playSong(song, songs, { type: "category", name: selectedCategory?.name || "Musik" });
    }
  };

  const handlePlaylistClick = async (playlistItem: PlaylistListItem) => {
    if (!token) return;
    try {
      const response = await songService.getPlaylist(token, playlistItem.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error("Failed to load playlist:", error);
    }
  };

  const handlePublicPlaylistClick = async (playlistItem: PlaylistListItem) => {
    if (!token) return;
    try {
      const response = await songService.getPlaylist(token, playlistItem.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error("Failed to load playlist:", error);
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
      if (selectedPlaylist?.id === deletePlaylistId) {
        setSelectedPlaylist(null);
      }
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

  const handleAddSongs = async (songIds: number[]) => {
    if (!selectedPlaylist || !token) return;
    try {
      await songService.addSongsToPlaylist(token, selectedPlaylist.id, songIds);
      const response = await songService.getPlaylist(token, selectedPlaylist.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
      loadPlaylists();
    } catch (error) {
      console.error("Failed to add songs:", error);
    }
  };

  const handleRemoveSong = async (itemId: number) => {
    if (!selectedPlaylist || !token) return;
    try {
      await songService.removeItemFromPlaylist(token, selectedPlaylist.id, itemId);
      const response = await songService.getPlaylist(token, selectedPlaylist.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
      loadPlaylists();
    } catch (error) {
      console.error("Failed to remove song:", error);
    }
  };

  const handleReorderSongs = async (itemIds: number[]) => {
    if (!selectedPlaylist || !token) return;
    try {
      await songService.reorderPlaylistItems(token, selectedPlaylist.id, itemIds);
      const response = await songService.getPlaylist(token, selectedPlaylist.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error("Failed to reorder songs:", error);
    }
  };

  return {
    // State
    activeTab,
    search,
    viewMode,
    categories,
    songs,
    isLoading,
    playlists,
    publicPlaylists,
    adminPlaylists,
    selectedPlaylist,
    selectedCategory,
    isPlaylistDialogOpen,
    isAddSongsDialogOpen,
    editingPlaylist,
    playlistsLoading,
    publicPlaylistsLoading,
    isSaving,
    showDeletePlaylistDialog,
    isDeleting,
    
    // Actions - Setters
    setActiveTab,
    setSearch,
    setViewMode,
    setSelectedCategoryId,
    setIsPlaylistDialogOpen,
    setIsAddSongsDialogOpen,
    setEditingPlaylist,
    setShowDeletePlaylistDialog,
    setDeletePlaylistId,
    setSelectedPlaylist,
    setSongs,

    // Actions - Handlers
    loadSongs,
    handlePlaySong,
    handlePlaylistClick,
    handlePublicPlaylistClick,
    handlePlaylistEdit,
    handlePlaylistDeleteClick,
    handlePlaylistDelete,
    handlePlaylistSave,
    handleAddSongs,
    handleRemoveSong,
    handleReorderSongs,

    // Player State
    currentSong,
    isPlaying,
    debouncedSearch,
  };
}
