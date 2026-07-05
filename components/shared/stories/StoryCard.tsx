"use client";

import { cn } from "@/utils";
import { StoryCard as StoryCardType } from "@/types";
import { Heart, MessageCircle, Star, AlertTriangle, User, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

interface StoryCardProps {
    story: StoryCardType;
    className?: string;
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

export function StoryCard({ story, className }: StoryCardProps) {
    return (
        <Link href={ROUTES.publicStoryDetail(story.id)} className="block h-full">
            <div
                className={cn(
                    "bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group h-full flex flex-col justify-between",
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                            <span className="text-4xl">📖</span>
                        </div>
                    )}

                    {/* Featured Badge */}
                    {story.is_featured && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
                            <Star className="h-3 w-3" />
                            Pilihan
                        </div>
                    )}

                    {/* Trigger Warning */}
                    {story.has_trigger_warning && (
                        <div className="absolute top-3 right-3 theme-accent-bg text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            TW
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
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
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100/50">
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
                                    {story.author.avatar ? (
                                        <Image
                                            src={story.author.avatar}
                                            alt={story.author.name}
                                            width={24}
                                            height={24}
                                            className="rounded-full h-6 w-6 object-cover"
                                        />
                                    ) : (
                                        <div className={`w-6 h-6 bg-linear-to-br ${AVATAR_GRADIENTS[hashString(story.author.name || "?") % AVATAR_GRADIENTS.length]} rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm`}>
                                            {story.author.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="max-w-24 truncate text-xs text-muted-foreground">
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
            <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Belum Ada Cerita</h3>
                <p className="text-gray-400 text-sm mt-1">
                    Jadilah yang pertama berbagi kisah inspiratif!
                </p>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6", className)}>
            {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
            ))}
        </div>
    );
}
