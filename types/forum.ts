export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ForumPost {
  id: number;
  forum_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
  
  // Interaction
  likes_count?: number;
  is_liked?: boolean;
  is_best_answer?: boolean;
}

export interface ForumCategory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Forum {
  id: number;
  user_id: number;
  category_id?: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  
  user?: User;
  category?: ForumCategory;
  posts?: ForumPost[];
  replies_count?: number;
  likes_count?: number;
  is_liked?: boolean;
  has_best_answer?: boolean; // Helpful to know if topic is resolved
}

export interface CreateForumRequest {
  title: string;
  content: string;
  category_id?: number;
}

export interface CreateForumPostRequest {
  content: string;
}

export interface ForumResponse {
  data: Forum[];
  total: number;
  limit: number;
  page: number;
}

export interface ForumPostResponse {
  data: ForumPost[];
  total: number;
  limit: number;
  page: number;
}

export interface TogglePostLikeResponse {
  likes_count: number;
  is_liked: boolean;
}

export interface ToggleBestAnswerResponse {
  is_best_answer: boolean;
}
