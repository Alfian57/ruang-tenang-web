"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { StoryCard } from "@/types";

interface FeaturedStoriesProps {
    stories: StoryCard[];
}

export function FeaturedStories({ stories }: FeaturedStoriesProps) {
    if (stories.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Cerita Pilihan
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
                {stories.slice(0, 3).map((story) => (
                    <Link key={story.id} href={`/stories/${story.id}`}>
                        <div className="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs font-medium text-yellow-600">Featured</span>
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
