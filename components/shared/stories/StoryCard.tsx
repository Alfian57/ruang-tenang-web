"use client";

import { cn } from "@/utils";
import { StoryCard as StoryCardType } from "@/types";
import { Heart, MessageCircle, Star, AlertTriangle, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface StoryCardProps {
    story: StoryCardType;
    className?: string;
}

export function StoryCard({ story, className }: StoryCardProps) {
    return (
        <Link href={`/stories/${story.id}`}>
            <div
                className={cn(
                    "bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group",
                    className
                )}
            >
                {/* Cover Image */}
                <div className="relative h-40 bg-muted">
                    {story.cover_image ? (
                        <Image
                            src={story.cover_image}
                            alt={story.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                            <span className="text-4xl">📖</span>
                        </div>
                    )}

                    {/* Featured Badge */}
                    {story.is_featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                        </div>
                    )}

                    {/* Trigger Warning */}
                    {story.has_trigger_warning && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            TW
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Categories */}
                    {story.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {story.categories.slice(0, 2).map((cat) => (
                                <span
                                    key={cat.id}
                                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                                >
                                    {cat.name}
                                </span>
                            ))}
                            {story.categories.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                    +{story.categories.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {story.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {story.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            {story.is_anonymous || !story.author ? (
                                <>
                                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                    <span className="text-xs text-muted-foreground">Anonim</span>
                                </>
                            ) : (
                                <>
                                    <Image
                                        src={story.author.avatar || "/images/default-avatar.png"}
                                        alt={story.author.name}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <span className="text-xs text-muted-foreground truncate max-w-25">
                                        {story.author.name}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {story.heart_count}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {story.comment_count}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

interface StoryListProps {
    stories: StoryCardType[];
    className?: string;
}

export function StoryList({ stories, className }: StoryListProps) {
    if (stories.length === 0) {
        return (
            <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📖</span>
                <h3 className="font-semibold mb-2">Belum Ada Cerita</h3>
                <p className="text-muted-foreground">
                    Jadilah yang pertama berbagi kisah inspiratif!
                </p>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
            {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
            ))}
        </div>
    );
}
