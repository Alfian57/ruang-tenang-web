"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { articleService } from "@/services/api";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import type { PaginatedResponse } from "@/services/http/types";
import { getHtmlExcerpt } from "@/utils";
import { LandingDataNotice } from "./LandingDataNotice";

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

const DEFAULT_IMAGE = "/images/landing/about-illustration.png";

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

  return (
    <section id="articles" className="relative overflow-hidden bg-linear-to-b from-white via-red-50/30 to-white px-4 py-14 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm">
            <BookOpen className="w-4 h-4" />
            Artikel Kesehatan Mental
          </div>
          <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-5xl">
            Wawasan untuk{" "}
            <span className="text-primary">Kesejahteraan</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Artikel publik seputar kesehatan mental, tips mengelola stres, dan
            panduan untuk hidup lebih seimbang.
          </p>
          <div className="mt-5">
            <LandingDataNotice variant="public" />
          </div>
        </motion.div>

        {/* Article Cards */}
        {loading ? (
          <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-rose-100 bg-white">
                <div className="aspect-16/10 w-full bg-rose-50" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-4/5" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="mb-8 rounded-2xl border border-dashed border-rose-200 bg-white/80 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">Artikel belum tersedia</p>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Konten edukasi sedang dipersiapkan. Silakan cek kembali beberapa saat lagi.
            </p>
          </div>
        ) : (
          <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={ROUTES.publicArticleDetail(article.slug)}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm shadow-red-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-16/10 overflow-hidden bg-gray-100">
                      <Image
                        src={getArticleImage(article.thumbnail)}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
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
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href={ROUTES.PUBLIC_ARTICLES}
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
