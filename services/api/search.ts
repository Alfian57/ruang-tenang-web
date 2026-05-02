import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type { Article, Song } from "@/types";

// Search-specific types
interface SearchResults {
  articles: Article[];
  songs: Song[];
  total: number;
  [key: string]: unknown;
}

export const searchService = {
  search(query: string, params?: { type?: string; page?: number; limit?: number }, token?: string) {
    return httpClient.get<ApiResponse<SearchResults>>("/search", { token, params: { q: query, ...params } });
  },
};
