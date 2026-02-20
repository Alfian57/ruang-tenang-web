"use client";

import { useEffect, useState } from "react";
import { storyService } from "@/services/api";
import { StoryCard } from "@/types";
import { BookOpen, Heart, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function StoryOfTheWeekWidget() {
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
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 animate-pulse">
                <div className="h-4 w-32 bg-amber-200 rounded mb-3" />
                <div className="h-5 w-48 bg-amber-200 rounded mb-2" />
                <div className="h-3 w-full bg-amber-100 rounded mb-1" />
                <div className="h-3 w-3/4 bg-amber-100 rounded" />
            </div>
        );
    }

    if (!story) return null;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    Kisah Minggu Ini
                </span>
            </div>

            <Link href={ROUTES.storyDetail(story.id)} className="group">
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
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
                    className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium"
                >
                    Selengkapnya
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
