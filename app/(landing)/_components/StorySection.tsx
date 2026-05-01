"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { storyService } from "@/services/api";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, BookHeart, Heart, Quote } from "lucide-react";
import type { StoryCard } from "@/types";
import { LandingDataNotice } from "./LandingDataNotice";

interface Story {
  id: string;
  title: string;
  content: string;
  author_name: string;
  like_count: number;
  created_at: string;
  href?: string;
}

const GRADIENT_ACCENTS = [
  "from-rose-500/10 to-pink-500/5",
  "from-red-500/10 to-rose-500/5",
  "from-rose-600/10 to-red-500/5",
  "from-pink-500/10 to-red-500/5",
];

const FALLBACK_STORIES: Story[] = [
  {
    id: "featured-story-1",
    title: "Aku berhenti memaksa terlihat kuat setiap saat",
    content:
      "Saat semester makin berat, aku belajar bahwa istirahat bukan tanda lemah. Mulai dari jurnal 5 menit dan napas teratur, hariku perlahan lebih stabil.",
    author_name: "Cerita Pilihan",
    like_count: 0,
    created_at: new Date().toISOString(),
    href: ROUTES.PUBLIC_STORIES,
  },
  {
    id: "featured-story-2",
    title: "Dari overthinking malam ke rutinitas pulih yang konsisten",
    content:
      "Aku sempat sulit tidur karena pikiran tidak berhenti. Setelah rutin check-in mood dan pilih sesi relaksasi sebelum tidur, kualitas istirahatku membaik.",
    author_name: "Ruang Tenang",
    like_count: 0,
    created_at: new Date().toISOString(),
    href: ROUTES.PUBLIC_STORIES,
  },
];

function truncateContent(content: string, maxLen: number): string {
  const stripped = content.replace(/<[^>]*>/g, "");
  if (stripped.length <= maxLen) return stripped;
  return stripped.substring(0, maxLen) + "...";
}

export function StorySection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await storyService.getStories({ limit: 4 });
        // Map StoryCard to local Story interface
        const mappedStories: Story[] = (response.data || []).map((s: StoryCard) => ({
          id: s.id,
          title: s.title,
          content: s.excerpt,
          author_name: s.author?.name || "Anonim",
          like_count: s.heart_count,
          created_at: s.published_at || new Date().toISOString()
        }));
        setStories(mappedStories);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const displayedStories = stories.length > 0 ? stories : FALLBACK_STORIES;
  const usingFallbackStories = stories.length === 0;

  return (
    <section id="stories" className="relative overflow-hidden bg-linear-to-b from-white via-rose-50/45 to-white px-4 py-14 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm">
            <BookHeart className="w-4 h-4" />
            Cerita Inspiratif
          </div>
          <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-5xl">
            Kisah Nyata dari{" "}
            <span className="text-primary">Komunitas Kita</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Cerita yang tampil di sini adalah cerita publik komunitas atau contoh pilihan saat data terbaru belum tersedia.
          </p>
          <div className="mt-5">
            <LandingDataNotice variant="public" />
          </div>
        </motion.div>

        {/* Story Cards */}
        {loading ? (
          <div className="mb-8 grid gap-5 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-rose-100 bg-white p-7">
                <div className="h-6 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-5 bg-gray-100 rounded w-4/5 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {usingFallbackStories && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3">
                <p className="text-sm font-medium text-rose-800">
                  Menampilkan cerita pilihan sementara sambil menunggu cerita komunitas terbaru.
                </p>
              </div>
            )}

            <div className="mb-8 grid gap-5 md:grid-cols-2">
              {displayedStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={story.href || ROUTES.publicStoryDetail(story.id)}>
                    <div
                      className={`group h-full rounded-2xl border border-rose-100 bg-linear-to-br ${GRADIENT_ACCENTS[index % GRADIENT_ACCENTS.length]} p-7 shadow-sm shadow-red-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                    >
                      <Quote className="w-8 h-8 text-primary/20 mb-4" />
                      <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">
                        {truncateContent(story.content, 150)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                            {story.author_name?.charAt(0)?.toUpperCase() || "A"}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {story.author_name || "Anonim"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs">{story.like_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href={ROUTES.PUBLIC_STORIES}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            <span>Baca Semua Cerita</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
