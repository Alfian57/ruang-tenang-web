import { httpClient } from "@/services/http/client";
import type { ApiResponse, PaginatedResponse } from "@/services/http/types";
import type { Article, ArticleCategory } from "@/types";

export const articleService = {
  getArticles(params?: { page?: number; limit?: number; search?: string; category_id?: number }) {
    return httpClient.get<PaginatedResponse<Article>>("/articles", { params: params as Record<string, string | number | boolean | undefined> });
  },

  getArticle(id: string, token?: string) {
    const config = token ? { token } : {};
    return httpClient.get<ApiResponse<Article>>(`/articles/${id}`, config);
  },

  getCategories() {
    return httpClient.get<ApiResponse<ArticleCategory[]>>("/article-categories");
  },

  // User articles
  getMyArticles(token: string, params?: { page?: number; limit?: number; status?: string }) {
    return httpClient.get<PaginatedResponse<Article>>("/my-articles", { token, params: params as Record<string, string | number | boolean | undefined> });
  },

  createArticle(token: string, data: { title: string; content: string; thumbnail?: string; category_id: number }) {
    return httpClient.post<ApiResponse<Article>>("/my-articles", data, { token });
  },

  getArticleForUser(token: string, id: string) {
    return httpClient.get<ApiResponse<Article>>(`/my-articles/${id}`, { token });
  },

  updateArticle(token: string, id: string, data: { title?: string; content?: string; thumbnail?: string; category_id?: number }) {
    return httpClient.put<ApiResponse<Article>>(`/my-articles/${id}`, data, { token });
  },

  deleteArticle(token: string, id: number) {
    return httpClient.delete<ApiResponse<null>>(`/my-articles/${id}`, { token });
  },
};
