"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articleService } from "@/services/api";
import { Article, ArticleCategory } from "@/types";
import { formatDate, getHtmlExcerpt } from "@/utils";
import { ROUTES } from "@/lib/routes";

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
    } catch {
      // silently ignore
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
    } catch {
      // silently ignore
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
    <div className="min-h-screen bg-linear-to-b from-red-50/50 via-white to-white">
      <Navbar variant="back" backHref={ROUTES.HOME} backLabel="Kembali ke Beranda" />

      <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">
            Artikel <span className="text-primary">Kesehatan Mental</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Kumpulan bacaan praktis untuk memahami emosi, menjaga rutinitas sehat,
            dan mengenali langkah awal saat butuh dukungan.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-8">
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
                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4">
                      <div className="h-36 w-full animate-pulse rounded-lg bg-gray-200 sm:h-24 sm:w-32" />
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
              <div className="flex flex-col gap-4">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={ROUTES.publicArticleDetail(article.slug)}
                    className="block group"
                  >
                    <Card className="overflow-hidden bg-white transition-shadow group-hover:shadow-md">
                      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4">
                        <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-32">
                          {article.thumbnail ? (
                            <Image
                              src={article.thumbnail}
                              alt={article.title}
                              width={128}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl">
                              📄
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {getHtmlExcerpt(article.excerpt || article.content || "", 120)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 sm:gap-3">
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
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Tidak ada artikel</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {search ? "Coba kata kunci lain" : "Artikel akan segera tersedia"}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Featured Articles */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Artikel Terbaru</h3>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Card key={idx} className="overflow-hidden border-gray-100 bg-white">
                      <div className="flex gap-3 p-4 items-start animate-pulse">
                        <div className="w-20 h-20 rounded-lg shrink-0 bg-gray-100" />
                        <div className="flex-1 min-w-0 pt-0.5 space-y-2">
                          <div className="h-4 bg-gray-100 rounded w-5/6" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                          <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.slice(0, 5).map((article) => (
                    <Link
                      key={article.id}
                      href={ROUTES.publicArticleDetail(article.slug)}
                      className="block group"
                    >
                      <Card className="overflow-hidden border-gray-100 group-hover:shadow-md transition-all bg-white">
                        <div className="flex gap-3 p-4 items-start">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-20">
                            {article.thumbnail ? (
                              <Image
                                src={article.thumbnail}
                                alt={article.title}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                📄
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {article.category?.name || "Umum"}
                            </p>
                            {getHtmlExcerpt(article.excerpt || article.content || "", 56) && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-1 leading-relaxed">
                                {getHtmlExcerpt(article.excerpt || article.content || "", 56)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-gray-200 bg-white/80">
                  <div className="p-6 text-center">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-600">Belum ada artikel terbaru</p>
                    <p className="text-xs text-gray-400 mt-1">Artikel terbaru akan muncul di sini saat tersedia.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ArticlesFallback() {
  return (
    <div className="min-h-screen bg-linear-to-b from-red-50/50 via-white to-white">
      <Navbar variant="back" backHref={ROUTES.HOME} backLabel="Kembali ke Beranda" />
      <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full rounded-full bg-gray-200" />
          <div className="h-28 rounded-xl bg-gray-200" />
          <div className="h-28 rounded-xl bg-gray-200" />
          <div className="h-28 rounded-xl bg-gray-200" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticlesFallback />}>
      <ArticlesContent />
    </Suspense>
  );
}
