"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  thumbnail: string;
  excerpt?: string;
  status: string;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export default function MyArticlesPage() {
  const { token } = useAuthStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);

  // URL state management
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const search = searchParams.get("search") || "";

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const loadArticles = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await api.getMyArticles(token) as { data: Article[] };
      setArticles(response.data || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await api.deleteMyArticle(token, id);
      setDeleteArticleId(null);
      loadArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Dipublikasikan</span>;
      case "draft":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draf</span>;
      case "blocked":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Diblokir</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Artikel Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola artikel yang kamu tulis</p>
        </div>
        <Link href="/dashboard/articles/new">
          <Button className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
          </Button>
        </Link>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
        <Input
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
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
      ) : filteredArticles.length > 0 ? (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
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
                    {getStatusBadge(article.status)}
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
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/dashboard/reading/articles/${article.id}`}>
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
            {search ? "Tidak ada artikel yang cocok" : "Mulai tulis artikel pertamamu"}
          </p>
          {!search && (
            <Link href="/dashboard/articles/new">
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
              </Button>
            </Link>
          )}
        </div>
      )}

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
