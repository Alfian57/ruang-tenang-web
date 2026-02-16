"use client";

import { useState } from "react";
import { cn } from "@/utils";
import { StoryComment as StoryCommentType } from "@/types";
import { Heart, User, MoreHorizontal, Flag, EyeOff } from "lucide-react";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoryCommentProps {
    comment: StoryCommentType;
    onHeart?: () => void;
    onReport?: () => void;
    onHide?: () => void;
    isAdmin?: boolean;
    isOwner?: boolean;
    className?: string;
}

export function StoryComment({
    comment,
    onHeart,
    onReport,
    onHide,
    isAdmin,
    isOwner,
    className,
}: StoryCommentProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return minutes <= 1 ? "Baru saja" : `${minutes} menit lalu`;
        }
        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} jam lalu`;
        }
        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} hari lalu`;
        }
        // Default
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (comment.is_hidden && !isAdmin) {
        return (
            <div className={cn(
                "bg-muted/50 rounded-lg p-4 text-muted-foreground text-sm italic",
                className
            )}>
                <EyeOff className="h-4 w-4 inline mr-2" />
                Komentar ini telah disembunyikan
            </div>
        );
    }

    return (
        <div className={cn("flex gap-3", className)}>
            {/* Avatar */}
            {!comment.author ? (
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                </div>
            ) : (
                <Image
                    src={comment.author.avatar || "/images/default-avatar.png"}
                    alt={comment.author.name}
                    width={40}
                    height={40}
                    className="rounded-full shrink-0"
                />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                                {comment.author?.name || "Anonim"}
                            </span>
                            {comment.author?.tier_name && (
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: `${comment.author.tier_color}20`,
                                        color: comment.author.tier_color
                                    }}
                                >
                                    {comment.author.tier_name}
                                </span>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground p-1 rounded">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onReport && (
                                    <DropdownMenuItem onClick={onReport}>
                                        <Flag className="h-4 w-4 mr-2" />
                                        Laporkan
                                    </DropdownMenuItem>
                                )}
                                {(isAdmin || isOwner) && onHide && (
                                    <DropdownMenuItem onClick={onHide} className="text-destructive">
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        Sembunyikan
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <p className="text-sm">{comment.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <button
                        onClick={onHeart}
                        className={cn(
                            "flex items-center gap-1 hover:text-red-500 transition-colors",
                            comment.has_hearted && "text-red-500"
                        )}
                    >
                        <Heart className={cn("h-4 w-4", comment.has_hearted && "fill-current")} />
                        {comment.heart_count > 0 && <span>{comment.heart_count}</span>}
                    </button>
                    <span>{formatDate(comment.created_at)}</span>
                </div>
            </div>
        </div>
    );
}

interface StoryCommentsListProps {
    comments: StoryCommentType[];
    onHeartComment?: (commentId: string) => void;
    onReportComment?: (commentId: string) => void;
    onHideComment?: (commentId: string) => void;
    isAdmin?: boolean;
    currentUserId?: number;
    className?: string;
}

export function StoryCommentsList({
    comments,
    onHeartComment,
    onReportComment,
    onHideComment,
    isAdmin,
    currentUserId,
    className,
}: StoryCommentsListProps) {
    if (comments.length === 0) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <p>Belum ada komentar</p>
                <p className="text-sm">Jadilah yang pertama memberikan dukungan!</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {comments.map((comment) => (
                <StoryComment
                    key={comment.id}
                    comment={comment}
                    onHeart={() => onHeartComment?.(comment.id)}
                    onReport={() => onReportComment?.(comment.id)}
                    onHide={() => onHideComment?.(comment.id)}
                    isAdmin={isAdmin}
                    isOwner={comment.author?.id === currentUserId}
                />
            ))}
        </div>
    );
}

interface StoryCommentInputProps {
    onSubmit: (content: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    className?: string;
}

export function StoryCommentInput({
    onSubmit,
    isLoading,
    placeholder = "Tulis dukungan atau komentar...",
    className,
}: StoryCommentInputProps) {
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content.trim());
            setContent("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("flex gap-3", className)}>
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1 bg-muted rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? "..." : "Kirim"}
            </button>
        </form>
    );
}
