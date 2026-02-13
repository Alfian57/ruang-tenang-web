"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import { Article, ArticleCategory } from "@/types";

interface MyArticle {
  id: number;
  title: string;
  thumbnail: string;
  excerpt?: string;
  status: string;
  moderation_status?: string;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export default function ArticlesPage() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  const activeTab = searchParams.get("tab") || "browse";
  const search = searchParams.get("search") || "";
  const mySearch = searchParams.get("mySearch") || "";

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setActiveTab = (value: string) => updateUrl({ tab: value === "browse" ? null : value });
  const setSearch = (value: string) => updateUrl({ search: value || null });
  const setMySearch = (value: string) => updateUrl({ mySearch: value || null });
  const selectedCategory = searchParams.get("category") ? parseInt(searchParams.get("category")!, 10) : null;
  const setSelectedCategory = (id: number | null) => updateUrl({ category: id ? String(id) : null });

  // Browse tab state
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isBrowseLoading, setIsBrowseLoading] = useState(true);

  // My articles tab state
  const [myArticles, setMyArticles] = useState<MyArticle[]>([]);
  const [isMyLoading, setIsMyLoading] = useState(true);
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.getArticleCategories() as { data: ArticleCategory[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const loadPublishedArticles = useCallback(async () => {
    setIsBrowseLoading(true);
    try {
      const response = await api.getArticles({
        category_id: selectedCategory || undefined,
        search: search || undefined,
      }) as { data: Article[] };
      setPublishedArticles(response.data || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsBrowseLoading(false);
    }
  }, [selectedCategory, search]);

  const loadMyArticles = useCallback(async () => {
    if (!token) return;
    setIsMyLoading(true);
    try {
      const response = await api.getMyArticles(token) as { data: MyArticle[] };
      setMyArticles(response.data || []);
    } catch (error) {
      console.error("Failed to load my articles:", error);
    } finally {
      setIsMyLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPublishedArticles();
  }, [loadPublishedArticles]);

  useEffect(() => {
    loadMyArticles();
  }, [loadMyArticles]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await api.deleteMyArticle(token, id);
      setDeleteArticleId(null);
      loadMyArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const filteredMyArticles = myArticles.filter(a =>
    a.title.toLowerCase().includes(mySearch.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Dipublikasikan</span>;
      case "draft":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draf</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">Menunggu Persetujuan</span>;
      case "blocked":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Diblokir</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Ditolak</span>;
      case "revision_needed":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Perlu Revisi</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Artikel</h1>
        <p className="text-gray-500 text-sm mt-1">
          Jelajahi artikel menarik atau kelola tulisanmu sendiri
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="browse">Jelajahi Artikel</TabsTrigger>
            <TabsTrigger value="mine">Artikel Saya</TabsTrigger>
          </TabsList>
          {activeTab === "mine" && (
            <Link href="/dashboard/articles/new">
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
              </Button>
            </Link>
          )}
        </div>

        {/* Browse Published Articles Tab */}
        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
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

          {isBrowseLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden bg-white">
                  <div className="h-40 bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : publishedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedArticles.map((article) => {
                const isOwn = user?.id === article.author?.id || user?.id === article.user_id;
                return (
                  <Link key={article.id} href={`/dashboard/articles/read/${article.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white cursor-pointer group h-full flex flex-col">
                      <div className="relative h-40 overflow-hidden bg-gray-100">
                        {article.thumbnail ? (
                          <Image
                            src={article.thumbnail}
                            alt={article.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
                            <span className="text-4xl">📄</span>
                          </div>
                        )}
                        {/* Category badge */}
                        <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-primary shadow-sm">
                          {article.category?.name || "Umum"}
                        </span>
                        {/* Own article badge */}
                        {isOwn && (
                          <span className="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium rounded-full bg-primary text-white shadow-sm">
                            Artikel Saya
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <div className="mt-auto flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatDate(article.created_at)}</span>
                          {article.author && (
                            <>
                              <span>•</span>
                              <span className="text-gray-500 truncate">{article.author.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
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
        </TabsContent>

        {/* My Articles Tab */}
        <TabsContent value="mine" className="space-y-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              placeholder="Cari artikel saya..."
              value={mySearch}
              onChange={(e) => setMySearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {isMyLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-20 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMyArticles.length > 0 ? (
            <div className="grid gap-4">
              {filteredMyArticles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {article.thumbnail ? (
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          width={96}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{article.title}</h3>
                        {getStatusBadge(article.moderation_status === "pending" || article.moderation_status === "rejected" || article.moderation_status === "revision_needed" ? article.moderation_status : article.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {article.category?.name} • {formatDate(article.created_at)}
                      </p>
                      {article.status === "blocked" && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Artikel ini diblokir oleh admin
                        </p>
                      )}
                      {article.moderation_status === "pending" && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Artikel sedang menunggu persetujuan admin
                        </p>
                      )}
                      {article.moderation_status === "rejected" && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Artikel ditolak oleh admin
                        </p>
                      )}
                      {article.moderation_status === "revision_needed" && (
                        <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Artikel perlu direvisi
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/dashboard/articles/read/${article.id}`}>
                        <Button variant="outline" size="icon" title="Lihat">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {article.status !== "blocked" && (
                        <Link href={`/dashboard/articles/${article.id}`}>
                          <Button variant="outline" size="icon" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => setDeleteArticleId(article.id)}
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📝</span>
              <h3 className="font-semibold mb-2">Belum ada artikel</h3>
              <p className="text-gray-500 text-sm mb-4">
                {mySearch ? "Tidak ada artikel yang cocok" : "Mulai tulis artikel pertamamu"}
              </p>
              {!mySearch && (
                <Link href="/dashboard/articles/new">
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      {deleteArticleId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Hapus Artikel?</h3>
            <p className="text-gray-600 mb-4">
              Artikel yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteArticleId(null)}>
                Batal
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDelete(deleteArticleId)}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
