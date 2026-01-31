"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Calendar, ArrowLeft, Tag, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Article } from "@/types";
import { formatDate } from "@/lib/utils";
import { ReportModal } from "@/components/moderation";

export default function DashboardArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadArticle = useCallback(async () => {
    const id = params.id as string;
    if (!id) return;

    setIsLoading(true);
    try {
      const [articleRes, relatedRes] = await Promise.all([
        api.getArticle(Number(id)) as Promise<{ data: Article }>,
        api.getArticles({ limit: 6 }) as Promise<{ data: Article[] }>,
      ]);
      setArticle(articleRes.data);
      // Filter out current article from related
      setRelatedArticles(
        (relatedRes.data || []).filter((a: Article) => a.id !== Number(id)).slice(0, 5)
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

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
          <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <p className="text-gray-500 mb-4">Artikel tidak ditemukan</p>
        <Link href="/dashboard/reading">
          <Button variant="outline">Kembali ke Pustaka</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard/reading" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pustaka</span>
        </Link>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <Card className="bg-white p-6 lg:p-8 border-none shadow-sm">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                    <Tag className="w-3.5 h-3.5" />
                    {article.category?.name || "Kesehatan Mental"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(article.created_at)}
                  </span>
                </div>
              </div>

              {/* Thumbnail */}
              {article.thumbnail && (
                <div className="mb-8 rounded-2xl overflow-hidden bg-gray-100">
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
                className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-8 pt-6 border-t flex justify-end">
                <ReportModal
                  type="article"
                  contentId={article.id}
                  userId={article.user_id}
                  trigger={
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                      <Flag className="w-4 h-4 mr-2" />
                      Laporkan Artikel
                    </Button>
                  }
                />
              </div>
            </Card>
          </div>

          {/* Sidebar - Related Articles */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Bacaan Lainnya</h3>
              <div className="space-y-4">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/dashboard/reading/${related.id}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-all bg-white border-none shadow-sm">
                      <div className="flex gap-3 p-3">
                        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 relative">
                          {related.thumbnail ? (
                            <Image
                              src={related.thumbnail}
                              alt={related.title}
                              width={80}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📄
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900 group-hover:text-primary transition-colors">
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {related.category?.name || "Umum"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-6">
                <Link href="/dashboard/reading">
                  <Button variant="outline" className="w-full rounded-xl">
                    Lihat Semua Artikel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
