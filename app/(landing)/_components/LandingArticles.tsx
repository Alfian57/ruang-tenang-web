"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { articleService } from "@/services/api/article";
import { ROUTES } from "@/lib/routes";
import { getHtmlExcerpt } from "@/utils/string";
import type { Article } from "@/types";
import { useNearViewport } from "./useNearViewport";

export function LandingArticles() {
  const { ref, isNear } = useNearViewport<HTMLElement>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isNear) return;
    let active = true;
    articleService.getArticles({ limit: 3 }).then((response) => {
      if (active) setArticles(response.data || []);
    }).catch(() => {
      // An unavailable public feed is represented by the empty state below.
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [isNear]);

  return (
    <section id="articles" ref={ref} className="relative px-5 py-22 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl"><span className="landing-section-kicker">BACAAN UNTUK HARI INI</span><h2 className="landing-section-title mt-4">Sedikit wawasan, <span>lebih banyak ruang.</span></h2><p className="landing-section-copy mt-4">Temukan bacaan seputar perasaan, jeda, dan cara merawat diri dengan lebih lembut.</p></div>
          <Link href={ROUTES.PUBLIC_ARTICLES} className="landing-text-link shrink-0">Semua artikel <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        {loading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3" aria-label="Memuat artikel">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-[#f9e8e8]" />)}</div>
        ) : articles.length === 0 ? (
          <div className="mt-10 flex min-h-48 items-center gap-5 rounded-[2rem] border border-dashed border-[#f2cace] bg-white p-6 sm:p-9"><BookOpen className="h-9 w-9 shrink-0 text-[#d86a75]" aria-hidden="true" /><div><h3 className="font-brand-display text-lg font-bold text-[#283048]">Artikel belum tersedia</h3><p className="mt-1 text-sm text-slate-600">Konten edukasi sedang disiapkan. Silakan kembali lagi nanti.</p></div></div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <Link key={article.id} href={ROUTES.publicArticleDetail(article.slug)} className="landing-article group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#f3e3e4] bg-white shadow-[0_18px_50px_-38px_rgba(109,49,74,0.35)]">
                <div className={`relative aspect-[16/10] w-full overflow-hidden ${article.thumbnail?.trim() ? "bg-[#f8ecec]" : "bg-[#fff0eb]"}`}>
                  <Image src={article.thumbnail?.trim() || "/images/landing/mascot/journal.webp"} alt={article.thumbnail?.trim() ? article.title : "Maskot Ruang Tenang membaca dan menulis"} fill sizes="(max-width: 768px) 100vw, 33vw" className={`transition-transform duration-500 group-hover:scale-105 ${article.thumbnail?.trim() ? "object-cover" : "object-contain object-bottom p-3"}`} />
                </div>
                <div className="flex flex-1 flex-col p-6"><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#c05b6b]">{article.category?.name || "Bacaan Ruang Tenang"}</span><h3 className="font-brand-display mt-3 line-clamp-2 text-xl font-extrabold leading-snug text-[#283048] group-hover:text-[#cf5260]">{article.title}</h3><p className="mt-3 line-clamp-2 flex-1 text-sm leading-7 text-slate-600">{getHtmlExcerpt(article.excerpt || article.content || "", 130)}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#c55363]">Baca artikel <ArrowRight size={16} aria-hidden="true" /></span></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
