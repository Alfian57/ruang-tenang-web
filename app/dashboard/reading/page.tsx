"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Article, ArticleCategory } from "@/types";
import { formatDate } from "@/lib/utils";

export default function DashboardReadingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.getArticleCategories() as { data: ArticleCategory[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getArticles({
        category_id: selectedCategory || undefined,
        search: search || undefined,
      }) as { data: Article[] };
      setArticles(response.data || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pustaka Bacaan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Temukan artikel menarik seputar kesehatan mental dan pengembangan diri
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "gradient-primary" : "bg-white"}
          >
            Semua
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? "gradient-primary" : "bg-white"}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden bg-white">
              <div className="flex gap-4 p-4">
                <div className="w-32 h-24 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Link key={article.id} href={`/dashboard/reading/${article.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow bg-white cursor-pointer group">
                <div className="flex gap-4 p-4">
                  <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {article.thumbnail ? (
                      <Image
                        src={article.thumbnail}
                        alt={article.title}
                        width={128}
                        height={96}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        📄
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="text-primary font-medium">{article.category?.name}</span>
                      <span>•</span>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
          <span className="text-4xl mb-4 block">📚</span>
          <h3 className="font-semibold mb-2">Tidak ada artikel</h3>
          <p className="text-gray-500 text-sm">
            {search ? "Coba kata kunci lain" : "Artikel akan segera tersedia"}
          </p>
        </div>
      )}
    </div>
  );
}
