"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { storyService } from "@/services/api";
import { ArrowRight, BookHeart, Heart, Quote } from "lucide-react";
import type { StoryCard } from "@/types";

interface Story {
  id: string;
  title: string;
  content: string;
  author_name: string;
  like_count: number;
  created_at: string;
}

const GRADIENT_ACCENTS = [
  "from-rose-500/10 to-pink-500/5",
  "from-blue-500/10 to-cyan-500/5",
  "from-purple-500/10 to-violet-500/5",
  "from-amber-500/10 to-orange-500/5",
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

  if (loading) return null;
  if (stories.length === 0) return null;

  return (
    <section id="stories" className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-pink-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-pink-600 font-medium text-sm mb-6">
            <BookHeart className="w-4 h-4" />
            Cerita Inspiratif
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Kisah Nyata dari{" "}
            <span className="text-primary">Komunitas Kita</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Cerita inspiratif dari mereka yang sudah melewati masa sulit.
            Kamu tidak sendirian.
          </p>
        </motion.div>

        {/* Story Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/stories/${story.id}`}>
                <div
                  className={`group bg-gradient-to-br ${GRADIENT_ACCENTS[index % GRADIENT_ACCENTS.length]} rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full`}
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/stories"
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
