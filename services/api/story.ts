import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";

import type { 
  InspiringStory, 
  StoryCategory, 
  StoryComment, 
  StoryStats,
  StoryCard
} from "@/types";

export const storyService = {
  // Categories (public)
  getCategories() {
    return httpClient.get<ApiResponse<StoryCategory[]>>("/stories/categories");
  },

  // List & Search
  getStories(params?: { category_id?: string; search?: string; sort_by?: string; page?: number; limit?: number; author_id?: number; is_featured?: boolean }) {
    return httpClient.get<PaginatedResponse<StoryCard>>("/stories", { params: params as Record<string, string | number | boolean | undefined> });
  },

  getFeatured() {
    return httpClient.get<ApiResponse<StoryCard[]>>("/stories/featured");
  },

  getMostAppreciated() {
    return httpClient.get<ApiResponse<StoryCard[]>>("/stories/most-appreciated");
  },

  getStory(id: string, token?: string) {
    return httpClient.get<ApiResponse<InspiringStory>>(`/stories/${id}`, token ? { token } : undefined);
  },

  // CRUD (protected)
  create(token: string, data: unknown) {
    return httpClient.post<ApiResponse<InspiringStory>>("/stories", data, { token });
  },

  update(token: string, id: string, data: unknown) {
    return httpClient.put<ApiResponse<InspiringStory>>(`/stories/${id}`, data, { token });
  },

  delete(token: string, id: string) {
    return httpClient.delete<ApiResponse<null>>(`/stories/${id}`, { token });
  },

  getMyStories(token: string, params?: { page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<StoryCard>>("/stories/my-stories", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  getMyStats(token: string) {
    return httpClient.get<ApiResponse<StoryStats>>("/stories/my-stats", { token });
  },

  // Hearts
  heart(token: string, id: string) {
    return httpClient.post<ApiResponse<{ hearts_count: number; is_hearted: boolean }>>(`/stories/${id}/heart`, {}, { token });
  },

  // Comments
  getComments(id: string, params?: { page?: number; limit?: number }, token?: string) {
    return httpClient.get<PaginatedResponse<StoryComment>>(`/stories/${id}/comments`, { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  createComment(token: string, storyId: string, data: { content: string }) {
    return httpClient.post<ApiResponse<StoryComment>>(`/stories/${storyId}/comments`, data, { token });
  },

  deleteComment(token: string, storyId: string, commentId: string) {
    return httpClient.delete<ApiResponse<null>>(`/stories/${storyId}/comments/${commentId}`, { token });
  },

  heartComment(token: string, storyId: string, commentId: string) {
    return httpClient.post<ApiResponse<{ hearts_count: number; is_hearted: boolean }>>(`/stories/${storyId}/comments/${commentId}/heart`, {}, { token });
  },

  // Admin moderation
  getPending(token: string, params?: { page?: number; limit?: number }) {
    return httpClient.get<PaginatedResponse<InspiringStory>>("/admin/stories/pending", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  moderate(token: string, id: string, data: { status: string; feedback?: string }) {
    return httpClient.post<ApiResponse<null>>(`/admin/stories/${id}/moderate`, data, { token });
  },

  setFeatured(token: string, id: string, featured: boolean) {
    return httpClient.post<ApiResponse<null>>(`/admin/stories/${id}/featured`, { is_featured: featured }, { token });
  },

  hideComment(token: string, storyId: string, commentId: string, reason: string) {
    return httpClient.post<ApiResponse<null>>(`/admin/stories/${storyId}/comments/${commentId}/hide`, { reason }, { token });
  },
};
