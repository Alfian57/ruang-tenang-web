import { Article, Song, ApiResponse, CommunityStats, PersonalJourney, LevelHallOfFameResponse, WeeklyProgress, MonthlyProgress, AllTimeStats, LevelUpCelebration, UserFeatures, FeatureAccess, FeaturesByLevel, UserBadges, BadgeProgress, InspiringStory, StoriesListResponse, StoryCategory, StoryComment, StoryCommentsListResponse, StoryStats, CreateStoryRequest, UpdateStoryRequest, StoryFilterParams, CreateStoryCommentRequest, DailyTask, ClaimTaskResponse } from "@/types";
import { CreateForumRequest, CreateForumPostRequest, Forum } from "@/types/forum";
import {
  BreathingTechnique,
  BreathingSession,
  BreathingPreferences,
  BreathingStats,
  BreathingCalendar,
  TechniqueUsageStats,
  BreathingWidgetData,
  RecommendationsResponse,
  SessionHistoryResponse,
  SessionCompletionResult,
  CreateTechniqueRequest,
  UpdateTechniqueRequest,
  StartSessionRequest,
  CompleteSessionRequest,
  UpdatePreferencesRequest,
  SessionHistoryParams,
} from "@/types/breathing";
import { toast } from "sonner";

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
      if (response.status === 429) {
        toast.error("Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.");
        throw new Error("Rate limit exceeded");
      }
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

  async login(email: string, password: string, rememberMe?: boolean) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
  }

  async getProfile(token: string) {
    return this.request("/auth/me", { token });
  }

  async updateProfile(token: string, name: string, email: string, avatar?: string) {
    return this.request("/auth/profile", {
      method: "PUT",
      token,
      body: JSON.stringify({ name, email, avatar }),
    });
  }

  async updatePassword(token: string, data: { current_password?: string; new_password?: string }) {
    return this.request("/auth/password", {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
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
  async getChatSessions(token: string, params?: { filter?: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.filter) searchParams.set("filter", params.filter);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
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

  async sendMessage(token: string, sessionId: number, content: string, type: "text" | "audio" = "text") {
    return this.request(`/chat-sessions/${sessionId}/messages`, {
      method: "POST",
      token,
      body: JSON.stringify({ content, type }),
    });
  }

  async toggleTrash(token: string, sessionId: number) {
    return this.request(`/chat-sessions/${sessionId}/trash`, {
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

  async toggleMessagePin(token: string, messageId: number) {
    return this.request(`/chat-messages/${messageId}/pin`, {
      method: "PUT",
      token,
    });
  }

  // Chat folder endpoints
  async getChatFolders(token: string) {
    return this.request("/chat-folders", { token });
  }

  async createChatFolder(token: string, name: string, color?: string, icon?: string) {
    return this.request("/chat-folders", {
      method: "POST",
      token,
      body: JSON.stringify({ name, color, icon }),
    });
  }

  async updateChatFolder(token: string, folderId: number, data: { name?: string; color?: string; icon?: string; position?: number }) {
    return this.request(`/chat-folders/${folderId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteChatFolder(token: string, folderId: number) {
    return this.request(`/chat-folders/${folderId}`, {
      method: "DELETE",
      token,
    });
  }

  async reorderChatFolders(token: string, folderIds: number[]) {
    return this.request("/chat-folders/reorder", {
      method: "PUT",
      token,
      body: JSON.stringify({ folder_ids: folderIds }),
    });
  }

  async moveSessionToFolder(token: string, sessionId: number, folderId: number | null) {
    return this.request(`/chat-sessions/${sessionId}/folder`, {
      method: "PUT",
      token,
      body: JSON.stringify({ folder_id: folderId }),
    });
  }

  // Chat export endpoints
  async exportChat(token: string, sessionId: number, format: "pdf" | "txt", includePinned?: boolean, includeMetadata?: boolean) {
    return this.request(`/chat-sessions/${sessionId}/export`, {
      method: "POST",
      token,
      body: JSON.stringify({ 
        format, 
        include_pinned: includePinned || false,
        include_metadata: includeMetadata !== false 
      }),
    });
  }

  // Chat summary endpoints
  async getChatSummary(token: string, sessionId: number) {
    return this.request(`/chat-sessions/${sessionId}/summary`, { token });
  }

  async generateChatSummary(token: string, sessionId: number) {
    return this.request(`/chat-sessions/${sessionId}/summary`, {
      method: "POST",
      token,
    });
  }

  // Pinned messages
  async getPinnedMessages(token: string, sessionId: number) {
    return this.request(`/chat-sessions/${sessionId}/pinned`, { token });
  }

  // Suggested prompts
  async getSuggestedPrompts(token: string, params?: { mood?: string; time_of_day?: string; has_messages?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.mood) searchParams.set("mood", params.mood);
    if (params?.time_of_day) searchParams.set("time_of_day", params.time_of_day);
    if (params?.has_messages !== undefined) searchParams.set("has_messages", params.has_messages.toString());
    
    const query = searchParams.toString();
    return this.request(`/chat-prompts${query ? `?${query}` : ""}`, { token });
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

  // Playlist endpoints
  async getMyPlaylists(token: string) {
    return this.request("/playlists", { token });
  }

  async getPlaylist(token: string, id: number) {
    return this.request(`/playlists/${id}`, { token });
  }

  async getPublicPlaylists(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request(`/playlists/public${query ? `?${query}` : ""}`);
  }

  async createPlaylist(token: string, data: { name: string; description?: string; thumbnail?: string; is_public?: boolean }) {
    return this.request("/playlists", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async updatePlaylist(token: string, id: number, data: { name: string; description?: string; thumbnail?: string; is_public?: boolean }) {
    return this.request(`/playlists/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async deletePlaylist(token: string, id: number) {
    return this.request(`/playlists/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async addSongToPlaylist(token: string, playlistId: number, songId: number) {
    return this.request(`/playlists/${playlistId}/songs`, {
      method: "POST",
      token,
      body: JSON.stringify({ song_id: songId }),
    });
  }

  async addSongsToPlaylist(token: string, playlistId: number, songIds: number[]) {
    return this.request(`/playlists/${playlistId}/songs/batch`, {
      method: "POST",
      token,
      body: JSON.stringify({ song_ids: songIds }),
    });
  }

  async removeSongFromPlaylist(token: string, playlistId: number, songId: number) {
    return this.request(`/playlists/${playlistId}/songs/${songId}`, {
      method: "DELETE",
      token,
    });
  }

  async removeItemFromPlaylist(token: string, playlistId: number, itemId: number) {
    return this.request(`/playlists/${playlistId}/items/${itemId}`, {
      method: "DELETE",
      token,
    });
  }

  async reorderPlaylistItems(token: string, playlistId: number, itemIds: number[]) {
    return this.request(`/playlists/${playlistId}/reorder`, {
      method: "PUT",
      token,
      body: JSON.stringify({ item_ids: itemIds }),
    });
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

  // Forum endpoints

  // Forum endpoints

  async createForum(token: string, data: CreateForumRequest) {
    return this.request("/forums", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async getForums(token: string, limit = 10, offset = 0, search = "", category_id?: number) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) params.set("search", search);
    if (category_id) params.set("category_id", category_id.toString());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request<any>(`/forums?${params}`, {
      token,
    });
  }

  async getForumByID(token: string, id: number) {
    return this.request<Forum>(`/forums/${id}`, { token });
  }

  async deleteForum(token: string, id: number) {
    return this.request(`/forums/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async toggleForumLike(token: string, id: number) {
    return this.request(`/forums/${id}/like`, {
      method: "PUT",
      token,
    });
  }

  async createForumPost(token: string, forumID: number, data: CreateForumPostRequest) {
    return this.request(`/forums/${forumID}/posts`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async getForumPosts(token: string, forumID: number, limit = 20, offset = 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request<any>(`/forums/${forumID}/posts?limit=${limit}&offset=${offset}`, {
      token,
    });
  }

  async deleteForumPost(token: string, id: number) {
    return this.request(`/posts/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async toggleForumPostLike(token: string, id: number) {
    return this.request(`/posts/${id}/upvote`, {
      method: "PUT",
      token,
    });
  }

  async toggleBestAnswer(token: string, id: number) {
    return this.request(`/posts/${id}/accept`, {
      method: "PUT",
      token,
    });
  }

  // Forum Category endpoints (Public)
  async getForumCategories() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request<any>("/forum-categories");
  }

  // Admin Forum Category endpoints
  async adminGetForumCategories(token: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request<any>("/admin/forum-categories", { token });
  }

  async createForumCategory(token: string, name: string) {
    return this.request("/admin/forum-categories", {
      method: "POST",
      token,
      body: JSON.stringify({ name }),
    });
  }

  async updateForumCategory(token: string, id: number, name: string) {
    return this.request(`/admin/forum-categories/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify({ name }),
  });
  }

  async deleteForumCategory(token: string, id: number) {
    return this.request(`/admin/forum-categories/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async toggleForumFlag(token: string, forumId: number) {
    return this.request(`/admin/forums/${forumId}/toggle-flag`, {
      method: "POST",
      token,
    });
  }

  // Search endpoints
  async search(query: string) {
    return this.request<ApiResponse<{ articles: Article[]; songs: Song[] }>>(`/search?q=${encodeURIComponent(query)}`);
  }

  // Level Config endpoints (public)
  async getLevelConfigs() {
    return this.request("/level-configs");
  }

  // EXP History endpoints (protected)
  async getExpHistory(token: string, params?: { 
    activity_type?: string; 
    start_date?: string; 
    end_date?: string; 
    page?: number; 
    limit?: number 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.activity_type) searchParams.set("activity_type", params.activity_type);
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/exp-history${query ? `?${query}` : ""}`, { token });
  }

  async getExpHistoryActivityTypes(token: string) {
    return this.request("/exp-history/activity-types", { token });
  }

  // Admin Level Config endpoints
  async adminGetLevelConfigs(token: string) {
    return this.request("/admin/level-configs", { token });
  }

  async adminCreateLevelConfig(token: string, data: { level: number; min_exp: number; badge_name: string; badge_icon: string }) {
    return this.request("/admin/level-configs", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminUpdateLevelConfig(token: string, id: number, data: { level: number; min_exp: number; badge_name: string; badge_icon: string }) {
    return this.request(`/admin/level-configs/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminDeleteLevelConfig(token: string, id: number) {
    return this.request(`/admin/level-configs/${id}`, {
      method: "DELETE",
      token,
    });
  }

  // Daily Tasks endpoints
  async getDailyTasks(token: string) {
    return this.request<{ data: DailyTask[] }>("/daily-tasks", { token });
  }

  async claimDailyTask(token: string, taskId: number) {
    return this.request<ClaimTaskResponse>(`/daily-tasks/${taskId}/claim`, {
      method: "POST",
      token,
    });
  }

  // ========================
  // Moderation Endpoints
  // ========================

  // Moderation Dashboard (Moderator/Admin)
  async getModerationStats(token: string) {
    return this.request("/moderation/stats", { token });
  }

  async getModerationQueue(token: string, params?: { status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request(`/moderation/queue${query ? `?${query}` : ""}`, { token });
  }

  async moderateArticle(token: string, articleId: number, data: { action: string; notes?: string; trigger_warnings?: string[] }) {
    return this.request(`/moderation/articles/${articleId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  // Reports (Moderator/Admin)
  async getModerationReports(token: string, params?: { status?: string; report_type?: string; reason?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.report_type) searchParams.set("report_type", params.report_type);
    if (params?.reason) searchParams.set("reason", params.reason);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request(`/moderation/reports${query ? `?${query}` : ""}`, { token });
  }

  async handleReport(token: string, reportId: number, data: { action: string; notes?: string; duration?: number }) {
    return this.request(`/moderation/reports/${reportId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  // User Strikes (Moderator/Admin)
  async getUserStrikes(token: string, userId: number, activeOnly?: boolean) {
    const query = activeOnly ? "?active_only=true" : "";
    return this.request(`/moderation/users/${userId}/strikes${query}`, { token });
  }

  // Trigger Warnings (Moderator/Admin)
  async addTriggerWarnings(token: string, data: { content_type: string; content_id: number; trigger_warnings: string[] }) {
    return this.request("/moderation/trigger-warnings", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  // Moderator Actions Log (Moderator/Admin)
  async getModeratorActions(token: string, params?: { moderator_id?: number; action_type?: string; target_type?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.moderator_id) searchParams.set("moderator_id", params.moderator_id.toString());
    if (params?.action_type) searchParams.set("action_type", params.action_type);
    if (params?.target_type) searchParams.set("target_type", params.target_type);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request(`/moderation/actions${query ? `?${query}` : ""}`, { token });
  }

  // Crisis Keywords (Moderator/Admin)
  async getCrisisKeywords(token: string) {
    return this.request("/moderation/crisis-keywords", { token });
  }

  async createCrisisKeyword(token: string, data: { keyword: string; category: string; severity: string; language?: string; notes?: string }) {
    return this.request("/moderation/crisis-keywords", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteCrisisKeyword(token: string, keywordId: number) {
    return this.request(`/moderation/crisis-keywords/${keywordId}`, {
      method: "DELETE",
      token,
    });
  }

  // ========================
  // User Report Endpoints (Any authenticated user)
  // ========================

  async createReport(token: string, data: { report_type: string; content_id?: number | string; user_id?: number; reason: string; description?: string }) {
    return this.request("/reports", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  // ========================
  // User Blocking Endpoints (Any authenticated user)
  // ========================

  async getBlockedUsers(token: string) {
    return this.request("/blocks", { token });
  }

  async blockUser(token: string, userId: number, reason?: string) {
    return this.request("/blocks", {
      method: "POST",
      token,
      body: JSON.stringify({ user_id: userId, reason }),
    });
  }

  async unblockUser(token: string, userId: number) {
    return this.request(`/blocks/${userId}`, {
      method: "DELETE",
      token,
    });
  }

  // ========================
  // User Settings Endpoints (Any authenticated user)
  // ========================

  async acceptAIDisclaimer(token: string) {
    return this.request("/user/accept-ai-disclaimer", {
      method: "POST",
      token,
    });
  }

  async updateContentWarningPreference(token: string, preference: string) {
    return this.request("/user/content-warning-preference", {
      method: "PUT",
      token,
      body: JSON.stringify({ preference }),
    });
  }

  // ========================
  // Community Progress Endpoints
  // ========================

  async getCommunityStats() {
    return this.request<{ data: CommunityStats }>("/community/stats");
  }

  async getLevelHallOfFame(level: number) {
    return this.request<{ data: LevelHallOfFameResponse }>(`/community/hall-of-fame/level/${level}`);
  }

  async getMonthlyHallOfFame() {
    return this.request<{ data: LevelHallOfFameResponse[] }>("/community/hall-of-fame/monthly");
  }

  async getPersonalJourney(token: string) {
    return this.request<{ data: PersonalJourney }>("/community/my-journey", { token });
  }

  async getWeeklyProgress(token: string) {
    return this.request<{ data: WeeklyProgress }>("/community/progress/weekly", { token });
  }

  async getMonthlyProgress(token: string) {
    return this.request<{ data: MonthlyProgress }>("/community/progress/monthly", { token });
  }

  async getAllTimeStats(token: string) {
    return this.request<{ data: AllTimeStats }>("/community/progress/all-time", { token });
  }

  async getLevelUpCelebration(token: string, level: number) {
    return this.request<{ data: LevelUpCelebration }>(`/community/celebration/${level}`, { token });
  }

  // ========================
  // Feature Unlock Endpoints
  // ========================

  async getAllFeatures() {
    return this.request<{ data: FeaturesByLevel[] }>("/features");
  }

  async getFeaturesByCategory(category: string) {
    return this.request<{ data: FeaturesByLevel[] }>(`/features/category/${category}`);
  }

  async getUserFeatures(token: string) {
    return this.request<{ data: UserFeatures }>("/features/my-features", { token });
  }

  async checkFeatureAccess(token: string, featureKey: string) {
    return this.request<{ data: FeatureAccess }>(`/features/check/${featureKey}`, { token });
  }

  async getUpcomingFeatures(token: string) {
    return this.request<{ data: UserFeatures }>("/features/upcoming", { token });
  }

  // ========================
  // Badge Endpoints
  // ========================

  async getAllBadges() {
    return this.request<{ data: BadgeProgress[] }>("/badges");
  }

  async getBadgesByCategory(category: string) {
    return this.request<{ data: BadgeProgress[] }>(`/badges/category/${category}`);
  }

  async getUserBadges(token: string) {
    return this.request<{ data: UserBadges }>("/badges/my-badges", { token });
  }

  async getBadgeProgress(token: string) {
    return this.request<{ data: BadgeProgress[] }>("/badges/progress", { token });
  }

  async checkNewBadges(token: string) {
    return this.request<{ data: BadgeProgress[] }>("/badges/check-new", { token });
  }

  // ========================
  // Inspiring Stories Endpoints
  // ========================

  async getStoryCategories() {
    return this.request<{ data: StoryCategory[] }>("/stories/categories");
  }

  async getStories(params?: StoryFilterParams) {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.set("category_id", params.category_id);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.author_id) searchParams.set("author_id", params.author_id.toString());
    if (params?.is_featured !== undefined) searchParams.set("is_featured", params.is_featured.toString());
    const query = searchParams.toString();
    return this.request<StoriesListResponse>(`/stories${query ? `?${query}` : ""}`);
  }

  async getFeaturedStories() {
    return this.request<{ data: InspiringStory[] }>("/stories/featured");
  }

  async getMostAppreciatedStories() {
    return this.request<{ data: InspiringStory[] }>("/stories/most-appreciated");
  }

  async getStory(id: string, token?: string) {
    return this.request<{ data: InspiringStory }>(`/stories/${id}`, token ? { token } : undefined);
  }

  async createStory(token: string, data: CreateStoryRequest) {
    return this.request<{ data: InspiringStory }>("/stories", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async updateStory(token: string, id: string, data: UpdateStoryRequest) {
    return this.request<{ data: InspiringStory }>(`/stories/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteStory(token: string, id: string) {
    return this.request(`/stories/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async heartStory(token: string, id: string) {
    return this.request(`/stories/${id}/heart`, {
      method: "POST",
      token,
    });
  }

  async unheartStory(token: string, id: string) {
    return this.request(`/stories/${id}/heart`, {
      method: "DELETE",
      token,
    });
  }

  async getStoryComments(id: string, params?: { page?: number; limit?: number }, token?: string) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request<StoryCommentsListResponse>(`/stories/${id}/comments${query ? `?${query}` : ""}`, token ? { token } : undefined);
  }

  async createStoryComment(token: string, storyId: string, data: CreateStoryCommentRequest) {
    return this.request<{ data: StoryComment }>(`/stories/${storyId}/comments`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async heartStoryComment(token: string, storyId: string, commentId: string) {
    return this.request(`/stories/${storyId}/comments/${commentId}/heart`, {
      method: "POST",
      token,
    });
  }

  async unheartStoryComment(token: string, storyId: string, commentId: string) {
    return this.request(`/stories/${storyId}/comments/${commentId}/heart`, {
      method: "DELETE",
      token,
    });
  }

  async getMyStories(token: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request<StoriesListResponse>(`/stories/my-stories${query ? `?${query}` : ""}`, { token });
  }

  async getMyStoryStats(token: string) {
    return this.request<{ data: StoryStats }>("/stories/my-stats", { token });
  }

  // Admin Story Moderation Endpoints
  async adminGetPendingStories(token: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request<StoriesListResponse>(`/admin/stories/pending${query ? `?${query}` : ""}`, { token });
  }

  async adminModerateStory(token: string, id: string, data: { status: string; feedback?: string }) {
    return this.request(`/admin/stories/${id}/moderate`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async adminSetFeaturedStory(token: string, id: string, featured: boolean) {
    return this.request(`/admin/stories/${id}/featured`, {
      method: "PUT",
      token,
      body: JSON.stringify({ is_featured: featured }),
    });
  }

  async adminHideStoryComment(token: string, storyId: string, commentId: string, reason: string) {
    return this.request(`/admin/stories/${storyId}/comments/${commentId}/hide`, {
      method: "PUT",
      token,
      body: JSON.stringify({ reason }),
    });
  }

  // ========================
  // Breathing Exercise Endpoints
  // ========================

  // Techniques
  async getBreathingTechniques(token: string) {
    return this.request<{ data: BreathingTechnique[] }>("/breathing/techniques", { token });
  }

  async getBreathingTechniqueById(token: string, id: string) {
    return this.request<{ data: BreathingTechnique }>(`/breathing/techniques/${id}`, { token });
  }

  async getBreathingTechniqueBySlug(token: string, slug: string) {
    return this.request<{ data: BreathingTechnique }>(`/breathing/techniques/slug/${slug}`, { token });
  }

  async createBreathingTechnique(token: string, data: CreateTechniqueRequest) {
    return this.request<{ data: BreathingTechnique }>("/breathing/techniques", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async updateBreathingTechnique(token: string, id: string, data: UpdateTechniqueRequest) {
    return this.request<{ data: BreathingTechnique }>(`/breathing/techniques/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteBreathingTechnique(token: string, id: string) {
    return this.request(`/breathing/techniques/${id}`, {
      method: "DELETE",
      token,
    });
  }

  // Sessions
  async getBreathingSessions(token: string, params?: SessionHistoryParams) {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    if (params?.technique_id) searchParams.set("technique_id", params.technique_id);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return this.request<{ data: SessionHistoryResponse }>(`/breathing/sessions${query ? `?${query}` : ""}`, { token });
  }

  async getBreathingSession(token: string, id: string) {
    return this.request<{ data: BreathingSession }>(`/breathing/sessions/${id}`, { token });
  }

  async startBreathingSession(token: string, data: StartSessionRequest) {
    return this.request<{ data: BreathingSession }>("/breathing/sessions", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async completeBreathingSession(token: string, id: string, data: CompleteSessionRequest) {
    return this.request<{ data: SessionCompletionResult }>(`/breathing/sessions/${id}/complete`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  // Preferences
  async getBreathingPreferences(token: string) {
    return this.request<{ data: BreathingPreferences }>("/breathing/preferences", { token });
  }

  async updateBreathingPreferences(token: string, data: UpdatePreferencesRequest) {
    return this.request<{ data: BreathingPreferences }>("/breathing/preferences", {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  // Favorites
  async getBreathingFavorites(token: string) {
    return this.request<{ data: BreathingTechnique[] }>("/breathing/favorites", { token });
  }

  async addBreathingFavorite(token: string, techniqueId: string) {
    return this.request(`/breathing/favorites/${techniqueId}`, {
      method: "POST",
      token,
    });
  }

  async removeBreathingFavorite(token: string, techniqueId: string) {
    return this.request(`/breathing/favorites/${techniqueId}`, {
      method: "DELETE",
      token,
    });
  }

  async reorderBreathingFavorites(token: string, techniqueIds: string[]) {
    return this.request("/breathing/favorites/reorder", {
      method: "PUT",
      token,
      body: JSON.stringify(techniqueIds),
    });
  }

  // Stats
  async getBreathingStats(token: string) {
    return this.request<{ data: BreathingStats }>("/breathing/stats", { token });
  }

  async getBreathingTechniqueUsage(token: string) {
    return this.request<{ data: TechniqueUsageStats[] }>("/breathing/stats/usage", { token });
  }

  async getBreathingCalendar(token: string, year: number, month: number) {
    return this.request<{ data: BreathingCalendar }>(`/breathing/calendar?year=${year}&month=${month}`, { token });
  }

  // Widget & Recommendations
  async getBreathingWidgetData(token: string) {
    return this.request<{ data: BreathingWidgetData }>("/breathing/widget", { token });
  }

  async getBreathingRecommendations(token: string, mood?: string, timeOfDay?: string) {
    const searchParams = new URLSearchParams();
    if (mood) searchParams.set("mood", mood);
    if (timeOfDay) searchParams.set("time_of_day", timeOfDay);
    const query = searchParams.toString();
    return this.request<{ data: RecommendationsResponse }>(`/breathing/recommendations${query ? `?${query}` : ""}`, { token });
  }

  // ==================== JOURNAL API ====================

  // CRUD Operations
  async createJournal(token: string, data: {
    title: string;
    content: string;
    mood_id?: number;
    tags?: string[];
    is_private?: boolean;
    share_with_ai?: boolean;
  }) {
    return this.request<{ data: import("@/types").Journal }>("/journals", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async getJournal(token: string, id: number) {
    return this.request<{ data: import("@/types").Journal }>(`/journals/${id}`, { token });
  }

  async updateJournal(token: string, id: number, data: {
    title?: string;
    content?: string;
    mood_id?: number;
    tags?: string[];
    is_private?: boolean;
    share_with_ai?: boolean;
  }) {
    return this.request<{ data: import("@/types").Journal }>(`/journals/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteJournal(token: string, id: number) {
    return this.request<{ message: string }>(`/journals/${id}`, {
      method: "DELETE",
      token,
    });
  }

  async listJournals(token: string, params?: {
    page?: number;
    limit?: number;
    tags?: string[];
    start_date?: string;
    end_date?: string;
    mood_id?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.tags && params.tags.length > 0) {
      params.tags.forEach(tag => searchParams.append("tags", tag));
    }
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    if (params?.mood_id) searchParams.set("mood_id", params.mood_id.toString());
    const query = searchParams.toString();
    return this.request<import("@/types").JournalListResponse>(`/journals${query ? `?${query}` : ""}`, { token });
  }

  async searchJournals(token: string, query: string, page?: number, limit?: number) {
    const searchParams = new URLSearchParams();
    searchParams.set("q", query);
    if (page) searchParams.set("page", page.toString());
    if (limit) searchParams.set("limit", limit.toString());
    return this.request<import("@/types").JournalListResponse>(`/journals/search?${searchParams.toString()}`, { token });
  }

  // Settings
  async getJournalSettings(token: string) {
    return this.request<{ data: import("@/types").JournalSettings }>("/journals/settings", { token });
  }

  async updateJournalSettings(token: string, data: {
    allow_ai_access?: boolean;
    ai_context_days?: number;
    ai_context_max_entries?: number;
    default_share_with_ai?: boolean;
  }) {
    return this.request<{ data: import("@/types").JournalSettings }>("/journals/settings", {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }

  // AI Integration
  async toggleJournalAIShare(token: string, journalId: number) {
    return this.request<{ data: import("@/types").Journal }>(`/journals/${journalId}/toggle-ai-share`, {
      method: "PUT",
      token,
    });
  }

  async getJournalAIContext(token: string) {
    return this.request<{ data: import("@/types").JournalAIContext }>("/journals/ai-context", { token });
  }

  async getJournalAIAccessLogs(token: string, page?: number, limit?: number) {
    const searchParams = new URLSearchParams();
    if (page) searchParams.set("page", page.toString());
    if (limit) searchParams.set("limit", limit.toString());
    const query = searchParams.toString();
    return this.request<{
      data: import("@/types").JournalAIAccessLog[];
      total: number;
      page: number;
      limit: number;
    }>(`/journals/ai-access-logs${query ? `?${query}` : ""}`, { token });
  }

  // Analytics & AI Features
  async getJournalAnalytics(token: string) {
    return this.request<{ data: import("@/types").JournalAnalytics }>("/journals/analytics", { token });
  }

  async getJournalWritingPrompt(token: string, mood?: string) {
    const query = mood ? `?mood=${mood}` : "";
    return this.request<{ data: import("@/types").JournalPrompt }>(`/journals/prompt${query}`, { token });
  }

  async getJournalWeeklySummary(token: string) {
    return this.request<{ data: import("@/types").JournalWeeklySummary }>("/journals/weekly-summary", { token });
  }

  // Export
  async exportJournals(token: string, format: "txt" | "html", startDate?: string, endDate?: string) {
    const searchParams = new URLSearchParams();
    searchParams.set("format", format);
    if (startDate) searchParams.set("start_date", startDate);
    if (endDate) searchParams.set("end_date", endDate);
    return this.request<{ data: import("@/types").JournalExportData }>(`/journals/export?${searchParams.toString()}`, { token });
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

