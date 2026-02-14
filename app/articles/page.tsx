"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articleService } from "@/services/api";
import { Article, ArticleCategory } from "@/types";
import { formatDate } from "@/lib/utils";

import { Suspense } from "react";

function ArticlesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state management
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category") || "";

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setSearch = (value: string) => updateUrl({ search: value || null });
  const setSelectedCategory = (id: number | null) => updateUrl({ category: id ? String(id) : null });

  const selectedCategory = categoryId ? Number(categoryId) : null;

  const loadCategories = useCallback(async () => {
    try {
      const response = await articleService.getCategories() as { data: ArticleCategory[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await articleService.getArticles({
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Kembali</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-xl font-bold text-gray-900">Artikel Kesehatan Mental</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari artikel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full bg-white border-gray-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? "gradient-primary" : ""}
              >
                Semua
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? "gradient-primary" : ""}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Articles List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden bg-white">
                    <div className="flex gap-4 p-4">
                      <div className="w-32 h-24 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow bg-white">
                      <div className="flex gap-4 p-4">
                        <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {article.thumbnail ? (
                            <Image
                              src={article.thumbnail}
                              alt={article.title}
                              width={128}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              📄
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="text-primary">{article.category?.name}</span>
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
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📚</span>
                <h3 className="font-semibold mb-2">Tidak ada artikel</h3>
                <p className="text-gray-500 text-sm">
                  {search ? "Coba kata kunci lain" : "Artikel akan segera tersedia"}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Featured Articles */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Artikel Terbaru</h3>
              <div className="space-y-4">
                {articles.slice(0, 5).map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow bg-white">
                      <div className="flex gap-3 p-3">
                        <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {article.thumbnail ? (
                            <Image
                              src={article.thumbnail}
                              alt={article.title}
                              width={64}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              📄
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 text-gray-900">
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {article.category?.name || "Umum"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}
