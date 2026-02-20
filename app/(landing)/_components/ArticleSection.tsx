"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { articleService } from "@/services/api";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import type { PaginatedResponse } from "@/services/http/types";
import { getHtmlExcerpt } from "@/utils";

interface Article {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  content: string;
  excerpt?: string;
  created_at: string;
  category?: {
    id: number;
    name: string;
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

const DEFAULT_IMAGE = "/images/dummy-article-1.png";

function getArticleImage(thumbnail: string | undefined): string {
  if (thumbnail && thumbnail.trim() !== "") return thumbnail;
  return DEFAULT_IMAGE;
}

export function ArticleSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = (await articleService.getArticles({
          limit: 6,
        })) as PaginatedResponse<Article>;
        setArticles(response.data || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return null;
  if (articles.length === 0) return null;

  return (
    <section id="articles" className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-600 font-medium text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            Artikel Kesehatan Mental
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Wawasan untuk{" "}
            <span className="text-primary">Kesejahteraan</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Artikel pilihan seputar kesehatan mental, tips mengelola stres, dan
            panduan untuk hidup lebih seimbang.
          </p>
        </motion.div>

        {/* Article Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/articles/${article.slug}`}>
                <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getArticleImage(article.thumbnail)}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority={index === 0}
                    />
                    {article.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-medium px-3 py-1 rounded-full">
                        {article.category.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                      {getHtmlExcerpt(article.excerpt || article.content || "", 120)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            <span>Lihat Semua Artikel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
