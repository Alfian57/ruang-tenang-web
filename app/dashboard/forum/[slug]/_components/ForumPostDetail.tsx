import { User, Forum } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { cn } from "@/utils";

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
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {forum.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{forum.user?.name}</p>
                        <p className="text-xs text-gray-500">Penulis</p>
                    </div>
                </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {forum.content}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                {user?.id !== forum.user_id ? (
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
                ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400 px-3 py-2">
                        <Heart className="w-4 h-4" />
                        <span>{likesCount} Suka</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{replyCount} Balasan</span>
                </div>
                <Button variant="ghost" size="sm" className="gap-2 ml-auto text-gray-500">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Bagikan</span>
                </Button>
            </div>
        </div>
    );
}
