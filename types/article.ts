// Article types
export interface ArticleCategory {
  id: number;
  name: string;
  description?: string;
  article_count?: number;
  created_at: string;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  status: string;
  thumbnail: string;
  content: string;
  excerpt?: string;
  category_id: number;
  category: ArticleCategory;
  created_at: string;
  updated_at: string;
  user_id?: number;
  author?: {
    id: number;
    name: string;
  };
}
