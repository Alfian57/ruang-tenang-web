"use client";

import { cn } from "@/utils";
import { InspiringStory } from "@/types";
import {
    Heart,
    MessageCircle,
    Share2,
    AlertTriangle,
    Star,
    Eye,
    Calendar,
    User,
    ArrowLeft
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface StoryDetailProps {
    story: InspiringStory;
    onHeart?: () => void;
    isHeartLoading?: boolean;
    className?: string;
}

export function StoryDetail({
    story,
    onHeart,
    isHeartLoading,
    className
}: StoryDetailProps) {
    const [showContent, setShowContent] = useState(!story.has_trigger_warning);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <article className={cn("max-w-3xl mx-auto", className)}>
            {/* Back Link */}
            <Link
                href="/stories"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Cerita
            </Link>

            {/* Cover Image */}
            {story.cover_image && (
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
                    <Image
                        src={story.cover_image}
                        alt={story.title}
                        fill
                        className="object-cover"
                    />
                    {story.is_featured && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            Cerita Pilihan
                        </div>
                    )}
                </div>
            )}

            {/* Header */}
            <header className="mb-8">
                {/* Categories */}
                {story.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {story.categories.map((cat) => (
                            <span
                                key={cat.id}
                                className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full"
                            >
                                {cat.icon} {cat.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{story.title}</h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {/* Author */}
                    {story.is_anonymous || !story.author ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span>Anonim</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Image
                                src={story.author.avatar || "/images/default-avatar.png"}
                                alt={story.author.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                                style={story.author.tier_color ? {
                                    borderWidth: 2,
                                    borderColor: story.author.tier_color
                                } : undefined}
                            />
                            <div>
                                <span className="font-medium text-foreground">{story.author.name}</span>
                                {story.author.tier_name && (
                                    <span
                                        className="ml-2 text-xs"
                                        style={{ color: story.author.tier_color }}
                                    >
                                        {story.author.tier_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(story.published_at || story.created_at)}
                    </span>

                    <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {story.view_count} views
                    </span>
                </div>

                {/* Tags */}
                {story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {story.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            {/* Trigger Warning */}
            {story.has_trigger_warning && !showContent && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-2 text-orange-600 mb-4">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">Peringatan Konten</span>
                    </div>
                    <p className="text-orange-700 mb-4">
                        {story.trigger_warning_text || "Cerita ini mungkin mengandung konten yang sensitif."}
                    </p>
                    <button
                        onClick={() => setShowContent(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Saya Mengerti, Tampilkan Cerita
                    </button>
                </div>
            )}

            {/* Content */}
            {showContent && (
                <div
                    className="prose prose-lg max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: story.content }}
                />
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 py-6 border-t border-b">
                <button
                    onClick={onHeart}
                    disabled={isHeartLoading}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                        story.has_hearted
                            ? "bg-red-50 text-red-500"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                >
                    <Heart className={cn("h-5 w-5", story.has_hearted && "fill-current")} />
                    <span>{story.heart_count}</span>
                </button>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span>{story.comment_count} komentar</span>
                </div>

                <button
                    className="ml-auto flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                        navigator.share?.({
                            title: story.title,
                            url: window.location.href,
                        });
                    }}
                >
                    <Share2 className="h-5 w-5" />
                    Bagikan
                </button>
            </div>
        </article>
    );
}
