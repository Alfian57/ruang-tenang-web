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
      updateUrlParam("search", debouncedSearch || null);
    }
  }, [debouncedSearch, updateUrlParam, urlSearch]);

  const setActiveTab = (tab: string) => updateUrlParam("tab", tab === "browse" ? null : tab);
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
      toast.error("Gagal memuat playlist Anda");
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
      toast.error("Gagal memuat playlist publik");
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

  // Search effect
  useEffect(() => {
    if (debouncedSearch) {
      const doSearch = async () => {
        setIsLoading(true);
        try {
          const response = await searchService.search(debouncedSearch);
          setSongs(response.data?.songs || []);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      };
      doSearch();
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

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
