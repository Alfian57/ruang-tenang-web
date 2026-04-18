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

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={authorAvatar} alt={forum.user?.name || "User"} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {authorInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{forum.user?.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-gray-500">Penulis</p>
                            {isOwner && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                    Topik Anda
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed wrap-break-word">
                {displayContent || "Topik ini belum memiliki isi konten."}
            </div>

            {!isOwner && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Merasa topik ini tidak aman? Gunakan tombol lapor atau blokir pengguna di bawah.
                </div>
            )}

            <div className="flex items-center gap-2 sm:gap-4 mt-6 pt-4 border-t flex-wrap">
                {!isOwner && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-2 hover:bg-red-50 hover:text-red-500 transition-colors",
                            isLiked && "text-red-500 bg-red-50"
                        )}
                        onClick={onToggleLike}
                    >
                        <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                        <span>{likesCount} Suka</span>
                    </Button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{replyCount} Balasan</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
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
                                className="text-red-600 hover:text-red-600 hover:bg-red-50"
                            />
                        </>
                    )}

                    <Button variant="ghost" size="sm" className="gap-2 text-gray-500 shrink-0">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Bagikan</span>
                    </Button>
                </div>
            </div>

            {moderationFeedback && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {moderationFeedback}
                </div>
            )}
        </div>
    );
}
