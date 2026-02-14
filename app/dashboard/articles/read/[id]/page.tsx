"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Calendar, ArrowLeft, Tag, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articleService } from "@/services/api";
import { Article } from "@/types";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export default function DashboardArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";
  const isArticleAuthor = user?.id === article?.author?.id;

  const loadArticle = useCallback(async () => {
    const id = params.id as string;
    if (!id) return;

    setIsLoading(true);
    try {
      const [articleRes, relatedRes] = await Promise.all([
        articleService.getArticle(Number(id)),
        articleService.getArticles({ limit: 6 }),
      ]);
      setArticle(articleRes.data);
      // Filter out current article from related
      setRelatedArticles(
        (relatedRes.data || []).filter((a) => a.id !== Number(id)).slice(0, 5)
      );
    } catch (error) {
      console.error("Failed to load article:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const getBackLink = () => {
    if (isAdmin) return "/dashboard/admin/articles";
    return "/dashboard/articles";
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="p-6 lg:p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-64 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-4">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-3 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-gray-500">Kembali</span>
        </div>
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📄</span>
          <h3 className="font-semibold mb-2">Artikel tidak ditemukan</h3>
          <p className="text-gray-500 text-sm mb-4">
            Artikel yang Anda cari mungkin sudah dihapus atau tidak tersedia
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href={getBackLink()}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Detail Artikel</h1>
            <p className="text-gray-500 text-sm">Membaca artikel</p>
          </div>
        </div>
        {/* Show edit button for owner or admin/moderator */}
        {/* Show edit button for owner or admin/moderator */}
        {(isArticleAuthor || isAdmin || isModerator) && article.status !== "blocked" && (
          <Link href={isArticleAuthor ? `/dashboard/articles/${article.id}` : "#"}>
            <Button variant="outline" size="sm" disabled={!isArticleAuthor && !isAdmin}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <Card className="bg-white p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                  <Tag className="w-3.5 h-3.5" />
                  {article.category?.name || "Umum"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.created_at)}
                </span>
                {article.author && (
                  <span className="text-gray-400">
                    oleh <span className="text-gray-600 font-medium">{article.author.name}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            {article.thumbnail && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Card>
        </div>

        {/* Sidebar - Related Articles */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Artikel Terkait</h3>
            <div className="space-y-4">
              {relatedArticles.length > 0 ? (
                relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/dashboard/articles/read/${related.id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow bg-white">
                      <div className="flex gap-3 p-3">
                        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {related.thumbnail ? (
                            <Image
                              src={related.thumbnail}
                              alt={related.title}
                              width={80}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📄
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900">
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {related.category?.name || "Umum"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">Tidak ada artikel terkait</p>
              )}
            </div>

            {/* Back to Articles */}
            <div className="mt-6">
              <Link href={getBackLink()}>
                <Button variant="outline" className="w-full">
                  Kembali ke Daftar Artikel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
