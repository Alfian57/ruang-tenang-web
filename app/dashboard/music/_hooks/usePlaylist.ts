"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { songService } from "@/services/api";
import { Playlist } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export function usePlaylist(playlistId: string) {
  const router = useRouter();
  const { token } = useAuthStore();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadPlaylist = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Try to parse ID to integer, as API likely expects number
      const id = parseInt(playlistId);
      if (isNaN(id)) {
        throw new Error("Invalid playlist ID");
      }
      
      const response = await songService.getPlaylist(token, id) as { data: Playlist };
      setPlaylist(response.data);
    } catch (error) {
      console.error("Failed to load playlist:", error);
      toast.error("Gagal memuat playlist");
      router.push("/dashboard/music");
    } finally {
      setIsLoading(false);
    }
  }, [token, playlistId, router]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const handleSave = async (data: { name: string; description?: string; is_public?: boolean }) => {
    if (!token || !playlist) return;
    setIsSaving(true);
    try {
      await songService.updatePlaylist(token, playlist.id, data);
      await loadPlaylist();
      setIsPlaylistDialogOpen(false);
      toast.success("Playlist berhasil diperbarui");
    } catch (error) {
      console.error("Failed to update playlist:", error);
      toast.error("Gagal memperbarui playlist");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !playlist) return;
    setIsDeleting(true);
    try {
      await songService.deletePlaylist(token, playlist.id);
      toast.success("Playlist berhasil dihapus");
      router.push("/dashboard/music?tab=playlists");
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      toast.error("Gagal menghapus playlist");
      setIsDeleting(false);
    }
  };

  const handleAddSongs = async (songIds: number[]) => {
    if (!playlist || !token) return;
    try {
      await songService.addSongsToPlaylist(token, playlist.id, songIds);
      await loadPlaylist();
      toast.success("Lagu berhasil ditambahkan");
      setIsAddSongsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add songs:", error);
      toast.error("Gagal menambahkan lagu");
    }
  };

  const handleRemoveSong = async (itemId: number) => {
    if (!playlist || !token) return;
    try {
      await songService.removeItemFromPlaylist(token, playlist.id, itemId);
      await loadPlaylist(); // Refresh to ensure sync
    } catch (error) {
      console.error("Failed to remove song:", error);
      toast.error("Gagal menghapus lagu");
    }
  };

  const handleReorderSongs = async (itemIds: number[]) => {
    if (!playlist || !token) return;
    try {
      await songService.reorderPlaylistItems(token, playlist.id, itemIds);
      // Optimistic update handled in UI, but we refresh to be sure
      // await loadPlaylist(); 
    } catch (error) {
      console.error("Failed to reorder songs:", error);
      toast.error("Gagal mengurutkan lagu");
      await loadPlaylist(); // Revert on error
    }
  };

  return {
    playlist,
    isLoading,
    isSaving,
    isDeleting,
    isPlaylistDialogOpen,
    isAddSongsDialogOpen,
    showDeleteDialog,
    setIsPlaylistDialogOpen,
    setIsAddSongsDialogOpen,
    setShowDeleteDialog,
    handleSave,
    handleDelete,
    handleAddSongs,
    handleRemoveSong,
    handleReorderSongs,
    refreshPlaylist: loadPlaylist
  };
}
