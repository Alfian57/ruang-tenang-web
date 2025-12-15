// Placeholder __NEXT_PUBLIC_API_URL__ akan diganti saat runtime oleh entrypoint.sh
// Jika menggunakan build-arg, gunakan process.env.NEXT_PUBLIC_API_URL langsung
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "__NEXT_PUBLIC_API_URL__"
  ? process.env.NEXT_PUBLIC_API_URL
  : "http://localhost:8080/api/v1";

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "An error occurred");
    }

    return data;
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(token: string) {
    return this.request("/auth/me", { token });
  }

  async updateProfile(token: string, name: string, email: string) {
    return this.request("/auth/profile", {
      method: "PUT",
      token,
      body: JSON.stringify({ name, email }),
    });
  }

  async updatePassword(token: string, currentPassword: string, newPassword: string) {
    return this.request("/auth/password", {
      method: "PUT",
      token,
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // Article endpoints (public)
  async getArticles(params?: { category_id?: number; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.set("category_id", params.category_id.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/articles${query ? `?${query}` : ""}`);
  }

  async getArticle(id: number) {
    return this.request(`/articles/${id}`);
  }

  async getArticleCategories() {
    return this.request("/article-categories");
  }

  // User article management endpoints
  async getMyArticles(token: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/my-articles${query ? `?${query}` : ""}`, { token });
  }

  async getMyArticle(token: string, id: number) {
    return this.request(`/my-articles/${id}`, { token });
  }

  async createMyArticle(token: string, data: { title: string; content: string; category_id: number; thumbnail?: string }) {
    return this.request("/my-articles", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async updateMyArticle(token: string, id: number, data: { title: string; content: string; category_id: number; thumbnail?: string }) {
    return this.request(`/my-articles/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteMyArticle(token: string, id: number) {
    return this.request(`/my-articles/${id}`, {
      method: "DELETE",
      token,
    });
  }

  // Admin article endpoints
  async adminGetArticles(token: string, params?: { category_id?: number; search?: string; status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.set("category_id", params.category_id.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/admin/articles${query ? `?${query}` : ""}`, { token });
  }

  async adminBlockArticle(token: string, id: number) {
    return this.request(`/admin/articles/${id}/block`, {
      method: "PUT",
      token,
    });
  }

  async adminUnblockArticle(token: string, id: number) {
    return this.request(`/admin/articles/${id}/unblock`, {
      method: "PUT",
      token,
    });
  }

  async adminDeleteArticle(token: string, id: number) {
    return this.request(`/admin/articles/${id}`, {
      method: "DELETE",
      token,
    });
  }

  // Chat endpoints
  async getChatSessions(token: string, params?: { filter?: string; search?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.filter) searchParams.set("filter", params.filter);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    
    const query = searchParams.toString();
    return this.request(`/chat-sessions${query ? `?${query}` : ""}`, { token });
  }

  async getChatSession(token: string, id: number) {
    return this.request(`/chat-sessions/${id}`, { token });
  }

  async createChatSession(token: string, title: string) {
    return this.request("/chat-sessions", {
      method: "POST",
      token,
      body: JSON.stringify({ title }),
    });
  }

  async sendMessage(token: string, sessionId: number, content: string) {
    return this.request(`/chat-sessions/${sessionId}/messages`, {
      method: "POST",
      token,
      body: JSON.stringify({ content }),
    });
  }

  async toggleBookmark(token: string, sessionId: number) {
    return this.request(`/chat-sessions/${sessionId}/bookmark`, {
      method: "PUT",
      token,
    });
  }

  async toggleFavorite(token: string, sessionId: number) {
    return this.request(`/chat-sessions/${sessionId}/favorite`, {
      method: "PUT",
      token,
    });
  }

  async deleteChatSession(token: string, sessionId: number) {
    return this.request(`/chat-sessions/${sessionId}`, {
      method: "DELETE",
      token,
    });
  }

  async toggleMessageLike(token: string, messageId: number) {
    return this.request(`/chat-messages/${messageId}/like`, {
      method: "PUT",
      token,
    });
  }

  async toggleMessageDislike(token: string, messageId: number) {
    return this.request(`/chat-messages/${messageId}/dislike`, {
      method: "PUT",
      token,
    });
  }

  // Song endpoints
  async getSongCategories() {
    return this.request("/song-categories");
  }

  async getSongsByCategory(categoryId: number) {
    return this.request(`/song-categories/${categoryId}/songs`);
  }

  async getSong(id: number) {
    return this.request(`/songs/${id}`);
  }

  // Mood endpoints
  async getMoodHistory(token: string, params?: { start_date?: string; end_date?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/user-moods${query ? `?${query}` : ""}`, { token });
  }

  async recordMood(token: string, mood: string) {
    return this.request("/user-moods", {
      method: "POST",
      token,
      body: JSON.stringify({ mood }),
    });
  }

  async getLatestMood(token: string) {
    return this.request("/user-moods/latest", { token });
  }

  async getMoodStats(token: string, days?: number) {
    const query = days ? `?days=${days}` : "";
    return this.request(`/user-moods/stats${query}`, { token });
  }

  // Upload endpoints
  async uploadImage(token: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload image");
    }
    return data;
  }

  async uploadAudio(token: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/upload/audio`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload audio");
    }
    return data;
  }

  // Admin song endpoints
  async adminCreateSongCategory(token: string, data: { name: string; thumbnail?: string }) {
    return this.request("/admin/song-categories", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminDeleteSongCategory(token: string, id: number) {
    return this.request(`/admin/song-categories/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async adminCreateSong(token: string, data: { title: string; file_path: string; thumbnail?: string; category_id: number }) {
    return this.request("/admin/songs", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminUpdateSong(token: string, id: number, data: { title: string; file_path: string; thumbnail?: string; category_id: number }) {
    return this.request(`/admin/songs/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminDeleteSong(token: string, id: number) {
    return this.request(`/admin/songs/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async adminGetAllSongs(token: string, categoryId?: number) {
    const params = categoryId ? `?category_id=${categoryId}` : "";
    return this.request(`/admin/songs${params}`, { token });
  }

  // Admin user endpoints
  async adminBlockUser(token: string, id: number) {
    return this.request(`/admin/users/${id}/block`, {
      method: "PUT",
      token,
    });
  }

  async adminUnblockUser(token: string, id: number) {
    return this.request(`/admin/users/${id}/unblock`, {
      method: "PUT",
      token,
    });
  }

  // Admin article category endpoints
  async adminGetArticleCategories(token: string) {
    return this.request("/admin/article-categories", { token });
  }

  async adminCreateArticleCategory(token: string, data: { name: string }) {
    return this.request("/admin/article-categories", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminUpdateArticleCategory(token: string, id: number, data: { name: string }) {
    return this.request(`/admin/article-categories/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminDeleteArticleCategory(token: string, id: number) {
    return this.request(`/admin/article-categories/${id}`, {
      method: "DELETE",
      token,
    });
  }

  // Admin dashboard stats
  async adminGetStats(token: string) {
    return this.request("/admin/stats", { token });
  }

  // Admin users endpoints
  async adminGetUsers(token: string, params?: { search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/admin/users${query ? `?${query}` : ""}`, { token });
  }

  async adminDeleteUser(token: string, id: number) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
      token,
    });
  }

  // Leaderboard endpoints
  async getLeaderboard(limit: number = 10) {
    return this.request(`/leaderboard?limit=${limit}`);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Helper to get full URL for uploaded files
export const getUploadUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || baseUrl === "__NEXT_PUBLIC_API_URL__") {
    baseUrl = "http://localhost:8080/api/v1";
  }
  
  // Remove /api/v1 from the base URL for uploads
  // Handle cases where /api/v1 might not be present or logic is fragile
  let uploadBaseUrl = baseUrl.includes("/api/v1") 
    ? baseUrl.replace("/api/v1", "") 
    : baseUrl;

  // Remove trailing slash if present
  if (uploadBaseUrl.endsWith("/")) {
    uploadBaseUrl = uploadBaseUrl.slice(0, -1);
  }

  // Ensure absolute URL
  if (!uploadBaseUrl.startsWith("http")) {
    // If somehow we got a relative path, force localhost default
    uploadBaseUrl = "http://localhost:8080";
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${uploadBaseUrl}${cleanPath}`;
};

