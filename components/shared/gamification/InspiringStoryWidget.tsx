"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Heart, ChevronRight, User } from "lucide-react";
import Image from "next/image";
import { storyService } from "@/services/api";
import { StoryCard } from "@/types";

export function InspiringStoryWidget() {
  const [featuredStory, setFeaturedStory] = useState<StoryCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedStory = async () => {
      try {
        const response = await storyService.getFeatured();
        if (response.data && response.data.length > 0) {
          // Get the first featured story
          setFeaturedStory(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to load featured story:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedStory();
  }, []);

  if (loading) {
    return (
      <div className="theme-story-bg border theme-story-border rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `var(--theme-story-border)` }} />
          <div className="h-5 rounded w-32" style={{ backgroundColor: `var(--theme-story-border)` }} />
        </div>
        <div className="h-20 rounded-lg" style={{ backgroundColor: `var(--theme-story-icon-bg)` }} />
      </div>
    );
  }

  if (!featuredStory) {
    return (
      <Link
        href="/dashboard/stories"
        className="block theme-story-bg border theme-story-border rounded-xl p-6 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" style={{ color: `var(--theme-story-icon)` }} />
          <h3 className="font-semibold" style={{ color: `var(--theme-story-heading)` }}>Kisah Inspiratif</h3>
        </div>
        <p className="text-sm mb-4" style={{ color: `var(--theme-story-heading)` }}>
          Temukan kekuatan dalam cerita orang lain. Baca kisah-kisah inspiratif
          dari sesama member.
        </p>
        <div className="flex items-center font-medium text-sm group-hover:gap-2 transition-all" style={{ color: `var(--theme-story-link)` }}>
          Jelajahi Kisah
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/stories/${featuredStory.id}`}
      className="block theme-story-bg border theme-story-border rounded-xl overflow-hidden hover:shadow-md transition-all group"
    >
      {featuredStory.cover_image && (
        <div className="h-32 overflow-hidden">
          <Image
            src={featuredStory.cover_image}
            alt={featuredStory.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" style={{ color: `var(--theme-story-icon)` }} />
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: `var(--theme-story-link)` }}>
            Kisah Pilihan
          </span>
        </div>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 transition-colors" style={{ ['--hover-color' as string]: `var(--theme-story-link)` }}>
          {featuredStory.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            {featuredStory.is_anonymous ? (
              <>
                <User className="w-3 h-3" />
                <span>Anonim</span>
              </>
            ) : (
              <span>{featuredStory.author?.name}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-rose-500">
            <Heart className="w-3 h-3 fill-current" />
            <span>{featuredStory.heart_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
