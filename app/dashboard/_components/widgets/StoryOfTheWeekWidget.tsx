"use client";

import { useEffect, useState } from "react";
import { storyService } from "@/services/api";
import { StoryCard } from "@/types";
import { BookOpen, Heart, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

import { useTheme } from "@/hooks/useTheme";

export function StoryOfTheWeekWidget() {
    const { exclusivity } = useTheme();
    const [story, setStory] = useState<StoryCard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await storyService.getFeatured();
                if (res.data && res.data.length > 0) {
                    // Pick the first featured story as "Story of the Week"
                    setStory(res.data[0]);
                }
            } catch {
                // Silently fail - widget is non-critical
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (isLoading) {
        return (
            <div className="theme-story-bg rounded-2xl p-5 border theme-story-border animate-pulse h-full">
                <div className="h-4 w-32 rounded mb-3" style={{ backgroundColor: `var(--theme-story-border)` }} />
                <div className="h-5 w-48 rounded mb-2" style={{ backgroundColor: `var(--theme-story-border)` }} />
                <div className="h-3 w-full rounded mb-1" style={{ backgroundColor: `var(--theme-story-icon-bg)` }} />
                <div className="h-3 w-3/4 rounded" style={{ backgroundColor: `var(--theme-story-icon-bg)` }} />
            </div>
        );
    }

    if (!story) {
        return (
            <div className="theme-story-bg rounded-2xl p-5 border theme-story-border flex flex-col items-center justify-center text-center min-h-[140px] h-full">
                <div className="p-3 bg-gray-100 rounded-full mb-3" style={{ backgroundColor: `var(--theme-story-icon-bg)` }}>
                    <BookOpen className="h-6 w-6 text-gray-400" style={{ color: `var(--theme-story-icon)` }} />
                </div>
                <h3 className="font-medium text-gray-800" style={{ color: `var(--theme-story-heading)` }}>Belum ada kisah minggu ini</h3>
                <p className="text-xs text-gray-500 mt-1">Coba cek lagi beberapa hari ke depan!</p>
            </div>
        );
    }

    return (
        <div className="theme-story-bg rounded-2xl p-5 border theme-story-border hover:shadow-md transition-shadow h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `var(--theme-story-icon-bg)` }}>
                    <BookOpen className="h-4 w-4" style={{ color: `var(--theme-story-icon)` }} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `var(--theme-story-heading)` }}>
                    {exclusivity.storyLabel}
                </span>
            </div>

            <Link href={ROUTES.storyDetail(story.id)} className="group">
                <h3 className="font-semibold text-gray-900 transition-colors line-clamp-2 mb-2" style={{ ['--hover-color' as string]: `var(--theme-story-heading)` }}>
                    {story.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {story.excerpt}
                </p>
            </Link>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-400" />
                        {story.heart_count}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                        {story.comment_count}
                    </span>
                    {story.author && !story.is_anonymous && (
                        <span className="text-gray-400">
                            oleh {story.author.name}
                        </span>
                    )}
                </div>
                <Link
                    href={ROUTES.STORIES}
                    className="text-xs flex items-center gap-1 font-medium"
                    style={{ color: `var(--theme-story-link)` }}
                >
                    Selengkapnya
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
