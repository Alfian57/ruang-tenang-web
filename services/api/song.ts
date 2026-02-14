import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { Song, SongCategory, Playlist, PlaylistItem } from "@/types";

export const songService = {
  getCategories() {
    return httpClient.get<ApiResponse<SongCategory[]>>("/song-categories");
  },

  getSongsByCategory(categoryId: number) {
    return httpClient.get<ApiResponse<Song[]>>(`/song-categories/${categoryId}/songs`);
  },

  getSong(id: number) {
    return httpClient.get<ApiResponse<Song>>(`/songs/${id}`);
  },

  // Playlists
  getMyPlaylists(token: string) {
    return httpClient.get<ApiResponse<Playlist[]>>("/playlists", { token });
  },

  getPlaylist(token: string, id: number) {
    return httpClient.get<ApiResponse<Playlist>>(`/playlists/${id}`, { token });
  },

  getPublicPlaylists(params?: { page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<Playlist>>("/playlists/public", { params: params as Record<string, string | number | boolean | undefined> });
  },

  createPlaylist(token: string, data: { name: string; description?: string; thumbnail?: string; is_public?: boolean }) {
    return httpClient.post<ApiResponse<Playlist>>("/playlists", data, { token });
  },

  updatePlaylist(token: string, id: number, data: { name: string; description?: string; thumbnail?: string; is_public?: boolean }) {
    return httpClient.put<ApiResponse<Playlist>>(`/playlists/${id}`, data, { token });
  },

  deletePlaylist(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/playlists/${id}`, { token });
  },

  addSongToPlaylist(token: string, playlistId: number, songId: number) {
    return httpClient.post<ApiResponse<PlaylistItem>>(`/playlists/${playlistId}/songs`, { song_id: songId }, { token });
  },

  addSongsToPlaylist(token: string, playlistId: number, songIds: number[]) {
    return httpClient.post<ApiResponse<PlaylistItem[]>>(`/playlists/${playlistId}/songs/batch`, { song_ids: songIds }, { token });
  },

  removeSongFromPlaylist(token: string, playlistId: number, songId: number) {
    return httpClient.delete<ApiResponse<null>>(`/playlists/${playlistId}/songs/${songId}`, { token });
  },

  removeItemFromPlaylist(token: string, playlistId: number, itemId: number) {
    return httpClient.delete<ApiResponse<null>>(`/playlists/${playlistId}/items/${itemId}`, { token });
  },

  reorderPlaylistItems(token: string, playlistId: number, itemIds: number[]) {
    return httpClient.put<ApiResponse<null>>(`/playlists/${playlistId}/reorder`, { item_ids: itemIds }, { token });
  },
};
