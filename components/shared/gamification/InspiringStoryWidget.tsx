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
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-amber-200 rounded-full" />
          <div className="h-5 bg-amber-200 rounded w-32" />
        </div>
        <div className="h-20 bg-amber-100 rounded-lg" />
      </div>
    );
  }

  if (!featuredStory) {
    return (
      <Link
        href="/dashboard/stories"
        className="block bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-amber-900">Kisah Inspiratif</h3>
        </div>
        <p className="text-sm text-amber-700 mb-4">
          Temukan kekuatan dalam cerita orang lain. Baca kisah-kisah inspiratif
          dari sesama member.
        </p>
        <div className="flex items-center text-amber-600 font-medium text-sm group-hover:gap-2 transition-all">
          Jelajahi Kisah
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/stories/${featuredStory.id}`}
      className="block bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl overflow-hidden hover:shadow-md transition-all group"
    >
      {featuredStory.cover_image && (
        <div className="h-32 overflow-hidden">
          <Image
            src={featuredStory.cover_image}
            alt={featuredStory.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
            Kisah Pilihan
          </span>
        </div>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
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
