"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Star } from "lucide-react";
import type { StoryCard } from "@/types";

interface FeaturedStoriesProps {
    stories: StoryCard[];
}

export function FeaturedStories({ stories }: FeaturedStoriesProps) {
    if (stories.length === 0) return null;

    return (
        <div className="mb-8 sm:mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-red-500" />
                Cerita Pilihan
            </h2>
            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                {stories.slice(0, 3).map((story) => (
                    <Link key={story.id} href={ROUTES.publicStoryDetail(story.id)}>
                        <div className="rounded-xl border border-red-200 bg-linear-to-br from-red-50 to-rose-50 p-4 transition-shadow hover:shadow-lg dark:from-red-950/20 dark:to-rose-950/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-red-500" />
                                <span className="text-xs font-medium text-red-600">Pilihan</span>
                            </div>
                            <h3 className="font-semibold line-clamp-2 mb-2">{story.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {story.excerpt}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
