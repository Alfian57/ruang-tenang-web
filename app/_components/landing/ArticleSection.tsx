"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { articleService } from "@/services/api";
import { ArrowRight, BookOpen } from "lucide-react";

interface Article {
  id: number;
  title: string;
  thumbnail: string;
  content: string;
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
}

interface ApiResponse {
  data: Article[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Use dummy article images that exist in public folder
const DUMMY_IMAGES = [
  "/images/dummy-article-1.png",
  "/images/dummy-article-2.png",
  "/images/dummy-article-3.png",
  "/images/dummy-article-4.png",
  "/images/dummy-article-5.png",
];

function getArticleImage(thumbnail: string | undefined, index: number): string {
  if (thumbnail && thumbnail.startsWith("/images/")) {
    return thumbnail;
  }
  return DUMMY_IMAGES[index % DUMMY_IMAGES.length];
}

export function ArticleSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articleService.getArticles({ limit: 6 }) as ApiResponse;
        setArticles(response.data || []);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 7);

  if (loading) {
    return (
      <section id="articles" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Article</h2>
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section id="articles" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Artikel</h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-primary shadow-sm">
               <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Belum ada artikel</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Kami sedang menyiapkan artikel-artikel menarik untuk Anda. Kembali lagi nanti ya!
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="articles" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-10"
        >
          Article
        </motion.h2>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Featured Article - Left Side */}
          {featuredArticle && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <Link href={`/articles/${featuredArticle.id}`}>
                <article className="group">
                  <div className="relative h-64 md:h-80 mb-6 rounded-2xl overflow-hidden">
                    <Image
                      src={getArticleImage(featuredArticle.thumbnail, 0)}
                      alt={featuredArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="font-medium text-primary">Mental Health</span>
                    <span>•</span>
                    <span>{formatDate(featuredArticle.created_at)}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-colors">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {truncateText((featuredArticle.content || "").replace(/<[^>]*>/g, ""), 250)}
                  </p>
                </article>
              </Link>
            </motion.div>
          )}

          {/* Side Articles - Right Side */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-700">Artikel Terkait</h3>
            </div>

            <div className="space-y-4">
              {sideArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                >
                  <Link href={`/articles/${article.id}`}>
                    <article className="flex gap-4 group py-3 border-b border-gray-100 last:border-0">
                      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                        <Image
                          src={getArticleImage(article.thumbnail, index + 1)}
                          alt={article.title}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-primary">Kategori</span>
                          <span>•</span>
                          <span>{article.category?.name || "Umum"}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-primary font-medium mt-6 hover:gap-3 transition-all"
            >
              Lihat Semua Artikel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
