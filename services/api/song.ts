import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { Song, SongCategory, Playlist, PlaylistItem } from "@/types";

export const songService = {
  getCategories() {
    return httpClient.get<ApiResponse<SongCategory[]>>("/song-categories");
  },

  getSongsByCategory(categoryKey: string | number) {
    return httpClient.get<ApiResponse<Song[]>>(`/song-categories/${encodeURIComponent(String(categoryKey))}/songs`);
  },

  getSong(id: number) {
    return httpClient.get<ApiResponse<Song>>(`/songs/${id}`);
  },

  // Playlists
  getMyPlaylists(token: string) {
    return httpClient.get<ApiResponse<Playlist[]>>("/playlists", { token });
  },

  getPlaylist(token: string, identifier: string | number) {
    return httpClient.get<ApiResponse<Playlist>>(`/playlists/${encodeURIComponent(String(identifier))}`, { token });
  },

  getPublicPlaylists(params?: { page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<Playlist>>("/playlists/public", { params });
  },

  createPlaylist(token: string, data: { name: string; description?: string; thumbnail?: string; is_public?: boolean }) {
    return httpClient.post<ApiResponse<Playlist>>("/playlists", data, { token });
  },

  updatePlaylist(token: string, id: string | number, data: { name: string; description?: string; thumbnail?: string; is_public?: boolean }) {
    return httpClient.put<ApiResponse<Playlist>>(`/playlists/${encodeURIComponent(String(id))}`, data, { token });
  },

  deletePlaylist(token: string, id: string | number) {
    return httpClient.delete<ApiResponse<null>>(`/playlists/${encodeURIComponent(String(id))}`, { token });
  },

  addSongToPlaylist(token: string, playlistId: string | number, songId: number) {
    return httpClient.post<ApiResponse<PlaylistItem>>(`/playlists/${encodeURIComponent(String(playlistId))}/songs`, { song_id: songId }, { token });
  },

  addSongsToPlaylist(token: string, playlistId: string | number, songIds: number[]) {
    return httpClient.post<ApiResponse<PlaylistItem[]>>(`/playlists/${encodeURIComponent(String(playlistId))}/songs/batch`, { song_ids: songIds }, { token });
  },

  removeSongFromPlaylist(token: string, playlistId: string | number, songId: number) {
    return httpClient.delete<ApiResponse<null>>(`/playlists/${encodeURIComponent(String(playlistId))}/songs/${songId}`, { token });
  },

  removeItemFromPlaylist(token: string, playlistId: string | number, itemId: number) {
    return httpClient.delete<ApiResponse<null>>(`/playlists/${encodeURIComponent(String(playlistId))}/items/${itemId}`, { token });
  },

  reorderPlaylistItems(token: string, playlistId: string | number, itemIds: number[]) {
    return httpClient.put<ApiResponse<null>>(`/playlists/${encodeURIComponent(String(playlistId))}/reorder`, { item_ids: itemIds }, { token });
  },
};
