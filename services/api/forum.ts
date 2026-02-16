import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { Forum, ForumPost, ForumCategory } from "@/types/forum";

export const forumService = {
  // Forum threads
  create(token: string, data: { title: string; content: string; category_id?: number }) {
    return httpClient.post<ApiResponse<Forum>>("/forums", data, { token });
  },

  getAll(token: string, limit = 10, offset = 0, search = "", category_id?: number) {
    return httpClient.get<PaginatedResponse<Forum>>("/forums", { token, params: { limit, offset, search, category_id } as Record<string, string | number | boolean | undefined> });
  },

  getById(token: string, id: number) {
    return httpClient.get<ApiResponse<Forum>>(`/forums/${id}`, { token });
  },

  getBySlug(token: string, slug: string) {
    return httpClient.get<ApiResponse<Forum>>(`/forums/${slug}`, { token });
  },

  delete(token: string, id: string | number) {
    return httpClient.delete<ApiResponse<null>>(`/forums/${id}`, { token });
  },

  toggleLike(token: string, id: string | number) {
    return httpClient.put<ApiResponse<Forum>>(`/forums/${id}/like`, undefined, { token });
  },

  getAcceptedAnswer(token: string, id: string | number) {
    return httpClient.get<ApiResponse<ForumPost>>(`/forums/${id}/accepted-answer`, { token });
  },

  unmarkAcceptedAnswer(token: string, id: string | number) {
    return httpClient.delete<ApiResponse<null>>(`/forums/${id}/accepted-answer`, { token });
  },

  // Posts
  createPost(token: string, forumId: string | number, data: { content: string }) {
    return httpClient.post<ApiResponse<ForumPost>>(`/forums/${forumId}/posts`, data, { token });
  },

  getPosts(token: string, forumId: string | number, limit = 20, offset = 0) {
    return httpClient.get<PaginatedResponse<ForumPost>>(`/forums/${forumId}/posts`, { token, params: { limit, offset } as Record<string, string | number | boolean | undefined> });
  },

  deletePost(token: string, postId: number) {
    return httpClient.delete<ApiResponse<null>>(`/posts/${postId}`, { token });
  },

  upvotePost(token: string, postId: number) {
    return httpClient.put<ApiResponse<ForumPost>>(`/posts/${postId}/upvote`, undefined, { token });
  },

  downvotePost(token: string, postId: number) {
    return httpClient.put<ApiResponse<ForumPost>>(`/posts/${postId}/downvote`, undefined, { token });
  },

  removePostVote(token: string, postId: number) {
    return httpClient.delete<ApiResponse<null>>(`/posts/${postId}/vote`, { token });
  },

  markAcceptedAnswer(token: string, postId: number) {
    return httpClient.put<ApiResponse<ForumPost>>(`/posts/${postId}/accept`, undefined, { token });
  },

  reportPost(token: string, postId: number, data: { reason: string; description?: string }) {
    return httpClient.post<ApiResponse<null>>(`/posts/${postId}/report`, data, { token });
  },

  // Categories (public)
  getCategories() {
    return httpClient.get<ApiResponse<ForumCategory[]>>("/forum-categories");
  },

  // Helper (public)
  getReportReasons() {
    return httpClient.get<ApiResponse<string[]>>("/forums/report-reasons");
  },

  getSortOptions() {
    return httpClient.get<ApiResponse<string[]>>("/forums/sort-options");
  },

  // Post reports (moderator)
  getPendingReports(token: string) {
    return httpClient.get<ApiResponse<unknown[]>>("/moderation/post-reports", { token });
  },

  reviewReport(token: string, reportId: number, data: { action: string; notes?: string }) {
    return httpClient.put<ApiResponse<null>>(`/moderation/post-reports/${reportId}`, data, { token });
  },
};
