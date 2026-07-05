"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { storyService } from "@/services/api";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, BookHeart, Heart, Quote } from "lucide-react";
import type { StoryCard } from "@/types";


interface Story {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  like_count: number;
  created_at: string;
  href?: string;
}

function hashString(value: string): number {
  return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

const AVATAR_GRADIENTS = [
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-purple-400 to-purple-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-cyan-400 to-cyan-600",
] as const;

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
  const shouldReduceMotion = useReducedMotion();
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
          author_avatar: s.author?.avatar,
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
    <section id="stories" className="relative overflow-hidden bg-linear-to-br from-rose-50 via-orange-50/40 to-amber-50/30 px-4 py-14 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
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
              <div className="mb-6 rounded-2xl border border-dashed border-rose-200 bg-white/60 px-5 py-4 text-center backdrop-blur">
                <p className="text-sm font-medium text-gray-600">
                  ✨ Cerita di bawah adalah contoh inspirasi. <Link href={ROUTES.PUBLIC_STORY_CREATE} className="text-primary font-semibold hover:underline">Bagikan ceritamu</Link> untuk menginspirasi komunitas!
                </p>
              </div>
            )}

            <div className="mb-8 grid gap-6 md:grid-cols-2">
              {displayedStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 30 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link href={story.href || ROUTES.publicStoryDetail(story.id)} className="block group h-full">
                    <div className="relative h-full flex flex-col justify-between rounded-3xl border border-rose-100/80 bg-white p-6 shadow-md shadow-rose-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                      <div>
                        <Quote className="absolute top-5 right-5 w-10 h-10 text-rose-200/60 sm:top-6 sm:right-6 sm:w-12 sm:h-12" />
                        <p className="relative text-gray-700 text-base leading-relaxed mb-6 italic line-clamp-4 sm:text-lg">
                          &ldquo;{truncateContent(story.content, 180)}&rdquo;
                        </p>
                        <h3 className="font-bold text-gray-900 text-base mb-4 group-hover:text-primary transition-colors line-clamp-2">
                          {story.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between border-t border-rose-100/60 pt-4">
                        <div className="flex items-center gap-3">
                          {story.author_avatar ? (
                            <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden shadow-sm">
                              <Image
                                src={story.author_avatar}
                                alt={story.author_name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 bg-linear-to-br ${AVATAR_GRADIENTS[hashString(story.author_name || "?") % AVATAR_GRADIENTS.length]} rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm`}>
                              {story.author_name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                          )}
                          <div>
                            <span className="block text-sm font-semibold text-gray-800">
                              {story.author_name || "Anonim"}
                            </span>
                            <span className="block text-xs text-gray-400">Komunitas Ruang Tenang</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <Heart className="w-4 h-4" fill="currentColor" />
                          <span className="text-xs font-medium">{story.like_count || 0}</span>
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
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
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
