import { User, Forum } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { cn } from "@/utils";
import { BlockUserButton, ReportModal } from "@/components/shared/moderation";
import { useState } from "react";
import { stripForumFormatTag } from "@/utils/forum-content";

interface ForumPostDetailProps {
    forum: Forum;
    user: User | null;
    isLiked: boolean;
    likesCount: number;
    replyCount: number;
    onToggleLike: () => void;
}

export function ForumPostDetail({
    forum,
    user,
    isLiked,
    likesCount,
    replyCount,
    onToggleLike,
}: ForumPostDetailProps) {
    const [moderationFeedback, setModerationFeedback] = useState<string | null>(null);
    const isOwner = user?.id === forum.user_id;
    const authorInitial = forum.user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
    const authorAvatar = forum.user?.avatar?.trim() || "";
    const displayContent = stripForumFormatTag(forum.content);

    const handleShare = async () => {
        try {
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({ title: forum.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setModerationFeedback("Tautan topik berhasil disalin.");
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            setModerationFeedback("Tautan topik belum dapat dibagikan dari perangkat ini.");
        }
    };

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_48px_-38px_rgba(15,23,42,0.42)]">
            <div className="h-1 bg-linear-to-r from-primary/80 via-rose-300 to-amber-200" aria-hidden="true" />
            <div className="p-4 sm:p-6 lg:p-7">
                <div className="mb-5 flex items-center gap-3">
                    <Avatar className="h-11 w-11 shrink-0 ring-4 ring-slate-50">
                        <AvatarImage src={authorAvatar} alt={forum.user?.name || "User"} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                            {authorInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{forum.user?.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <p className="text-xs text-slate-500">Penulis topik</p>
                            {isOwner && (
                                <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                    Topik Anda
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-none whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
                    {displayContent || "Topik ini belum memiliki isi konten."}
                </div>

                {!isOwner && (
                    <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-3 text-xs leading-relaxed text-amber-900 sm:text-sm">
                        Merasa topik ini tidak aman? Kamu bisa melaporkan atau memblokir penulis melalui tindakan di bawah.
                    </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    {!isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-pressed={isLiked}
                            className={cn(
                                "h-9 gap-2 rounded-xl px-3 text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600",
                                isLiked && "bg-rose-50 text-rose-600"
                            )}
                            onClick={onToggleLike}
                        >
                            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                            <span>{likesCount} Suka</span>
                        </Button>
                    )}
                    <div className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-slate-500">
                        <MessageSquare className="h-4 w-4" />
                        <span>{replyCount} Balasan</span>
                    </div>

                    <div className="ml-auto flex flex-wrap items-center gap-1">
                        {!isOwner && (
                            <>
                                <ReportModal
                                    type="forum"
                                    contentId={forum.id}
                                    userId={forum.user_id}
                                    onSuccess={() =>
                                        setModerationFeedback("Laporanmu diterima dan masuk antrean review. Tim moderasi akan memproses dalam 1 x 24 jam.")
                                    }
                                />
                                <BlockUserButton
                                    userId={forum.user_id}
                                    userName={forum.user?.name || "User"}
                                    onSuccess={() =>
                                        setModerationFeedback("Pengguna berhasil diblokir. Konten dari akun ini tidak akan muncul lagi di feed kamu.")
                                    }
                                    className="text-red-600 hover:bg-red-50 hover:text-red-600"
                                />
                            </>
                        )}

                        <Button variant="ghost" size="sm" onClick={handleShare} className="h-9 shrink-0 gap-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                            <Share2 className="h-4 w-4" />
                            <span>Bagikan</span>
                        </Button>
                    </div>
                </div>

                {moderationFeedback && (
                    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
                        {moderationFeedback}
                    </div>
                )}
            </div>
        </article>
    );
}
