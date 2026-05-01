"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Calendar, Tag } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articleService } from "@/services/api";
import { Article } from "@/types";
import { formatDate } from "@/utils";
import { sanitizeHtml } from "@/utils/sanitize";
import { getHtmlExcerpt } from "@/utils";
import { ROUTES } from "@/lib/routes";

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadArticle = useCallback(async () => {
    const slug = params.slug as string;
    if (!slug) return;

    setIsLoading(true);
    try {
      const [articleRes, relatedRes] = await Promise.all([
        articleService.getArticle(slug),
        articleService.getArticles({ limit: 6 }),
      ]);
      setArticle(articleRes.data);
      // Filter out current article from related
      setRelatedArticles(
        (relatedRes.data || []).filter((a) => a.slug !== slug).slice(0, 5)
      );
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-red-50/50 via-white to-white">
        <Navbar variant="back" backHref={ROUTES.PUBLIC_ARTICLES} backLabel="Kembali ke Artikel" />
        <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
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
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-linear-to-b from-red-50/50 via-white to-white">
        <Navbar variant="back" backHref={ROUTES.PUBLIC_ARTICLES} backLabel="Kembali ke Artikel" />
        <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
          <p className="text-gray-500">Artikel tidak ditemukan</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={ROUTES.PUBLIC_ARTICLES}>Kembali ke Artikel</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50/50 via-white to-white">
      <Navbar variant="back" backHref={ROUTES.PUBLIC_ARTICLES} backLabel="Kembali ke Artikel" />

      <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Card */}
            <Card className="bg-white p-4 sm:p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6">
                <h1 className="mb-4 text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 sm:gap-4">
                  <span className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                    <Tag className="w-3.5 h-3.5" />
                    {article.category?.name || "Mental Health"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(article.created_at)}
                  </span>
                </div>
              </div>

              {/* Thumbnail */}
              {article.thumbnail && (
                <div className="mb-6 overflow-hidden rounded-xl">
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
                className="prose prose-sm prose-gray max-w-none break-words prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-pre:overflow-x-auto sm:prose-base"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
              />
            </Card>
          </div>

          {/* Sidebar - Related Articles */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Artikel Terkait</h3>
              <div className="space-y-4">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={ROUTES.publicArticleDetail(related.slug)}
                    className="block group"
                  >
                    <Card className="overflow-hidden border-gray-100 group-hover:shadow-md transition-all bg-white">
                      <div className="flex gap-3 p-4 items-start">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-20">
                          {related.thumbnail ? (
                            <Image
                              src={related.thumbnail}
                              alt={related.title}
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
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {related.category?.name || "Umum"}
                          </p>
                          {getHtmlExcerpt(related.excerpt || related.content || "", 56) && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1 leading-relaxed">
                              {getHtmlExcerpt(related.excerpt || related.content || "", 56)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Back to Articles */}
              <div className="mt-6">
                <Link href={ROUTES.PUBLIC_ARTICLES}>
                  <Button variant="outline" className="w-full">
                    Lihat Semua Artikel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
