import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { User, Article, Song, SongCategory, LevelConfig } from "@/types";
import type { Forum, ForumCategory } from "@/types/forum";
import type { DashboardStats } from "@/types/admin";

export const adminService = {
  // Dashboard
  getStats(token: string) {
    return httpClient.get<ApiResponse<DashboardStats>>("/admin/stats", { token });
  },

  // Users
  getUsers(token: string, params?: { page?: number; limit?: number; search?: string; role?: string }) {
    return httpClient.get<PaginatedResponse<User>>("/admin/users", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  getUser(token: string, id: number) {
    return httpClient.get<ApiResponse<User>>(`/admin/users/${id}`, { token });
  },

  updateUserRole(token: string, id: number, role: string) {
    return httpClient.put<ApiResponse<User>>(`/admin/users/${id}/role`, { role }, { token });
  },

  suspendUser(token: string, id: number, duration: number, reason: string) {
    return httpClient.post<ApiResponse<null>>(`/admin/users/${id}/suspend`, { duration, reason }, { token });
  },

  unsuspendUser(token: string, id: number) {
    return httpClient.post<ApiResponse<null>>(`/admin/users/${id}/unsuspend`, {}, { token });
  },

  banUser(token: string, id: number, reason: string) {
    return httpClient.post<ApiResponse<null>>(`/admin/users/${id}/ban`, { reason }, { token });
  },

  unbanUser(token: string, id: number) {
    return httpClient.post<ApiResponse<null>>(`/admin/users/${id}/unban`, {}, { token });
  },

  // Articles
  getArticles(token: string, params?: { page?: number; limit?: number; search?: string; status?: string; category_id?: number }) {
    return httpClient.get<PaginatedResponse<Article>>("/admin/articles", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  updateArticleStatus(token: string, id: number, status: string) {
    return httpClient.put<ApiResponse<Article>>(`/admin/articles/${id}/status`, { status }, { token });
  },

  deleteArticle(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/admin/articles/${id}`, { token });
  },

  // Songs
  getSongs(token: string, params?: { page?: number; limit?: number; search?: string; category_id?: number }) {
    return httpClient.get<PaginatedResponse<Song>>("/admin/songs", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  createSong(token: string, data: { title: string; file_path: string; thumbnail?: string; category_id: number }) {
    return httpClient.post<ApiResponse<Song>>("/admin/songs", data, { token });
  },

  updateSong(token: string, id: number, data: { title?: string; file_path?: string; thumbnail?: string; category_id?: number }) {
    return httpClient.put<ApiResponse<Song>>(`/admin/songs/${id}`, data, { token });
  },

  deleteSong(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/admin/songs/${id}`, { token });
  },

  // Song Categories
  getSongCategories(token: string) {
    return httpClient.get<ApiResponse<SongCategory[]>>("/admin/song-categories", { token });
  },

  createSongCategory(token: string, data: { name: string; thumbnail?: string }) {
    return httpClient.post<ApiResponse<SongCategory>>("/admin/song-categories", data, { token });
  },

  updateSongCategory(token: string, id: number, data: { name?: string; thumbnail?: string }) {
    return httpClient.put<ApiResponse<SongCategory>>(`/admin/song-categories/${id}`, data, { token });
  },

  deleteSongCategory(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/admin/song-categories/${id}`, { token });
  },

  // Forums
  getForums(token: string, params?: { page?: number; limit?: number; search?: string }) {
    return httpClient.get<PaginatedResponse<Forum>>("/admin/forums", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  deleteForum(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/admin/forums/${id}`, { token });
  },

  // Levels
  getLevels(token: string) {
    return httpClient.get<ApiResponse<LevelConfig[]>>("/admin/levels", { token });
  },

  createLevel(token: string, data: { level: number; min_exp: number; badge_name: string; badge_icon: string }) {
    return httpClient.post<ApiResponse<LevelConfig>>("/admin/levels", data, { token });
  },

  updateLevel(token: string, id: number, data: { level?: number; min_exp?: number; badge_name?: string; badge_icon?: string }) {
    return httpClient.put<ApiResponse<LevelConfig>>(`/admin/levels/${id}`, data, { token });
  },

  deleteLevel(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/admin/levels/${id}`, { token });
  },

  // Forum Categories
  getForumCategories(token: string) {
    return httpClient.get<ApiResponse<ForumCategory[]>>("/admin/forum-categories", { token });
  },

  createForumCategory(token: string, name: string) {
    return httpClient.post<ApiResponse<ForumCategory>>("/admin/forum-categories", { name }, { token });
  },

  updateForumCategory(token: string, id: number, name: string) {
    return httpClient.put<ApiResponse<ForumCategory>>(`/admin/forum-categories/${id}`, { name }, { token });
  },

  deleteForumCategory(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/admin/forum-categories/${id}`, { token });
  },

  // Forum Moderation
  toggleForumFlag(token: string, id: number) {
    return httpClient.post<ApiResponse<Forum>>(`/admin/forums/${id}/toggle-flag`, {}, { token });
  },
};
