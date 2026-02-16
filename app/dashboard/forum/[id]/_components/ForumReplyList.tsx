import { ForumPost } from "@/types";
import { ForumPostCard } from "./ForumPostCard";
import { MessageSquare } from "lucide-react";

interface ForumReplyListProps {
    posts: ForumPost[];
    currentUserId?: number;
    isForumOwner: boolean;
    isAdmin: boolean;
    onToggleLike: (post: ForumPost) => void;
    onToggleBestAnswer: (post: ForumPost) => void;

    onShowDeleteDialog: (postId: number) => void;
}

export function ForumReplyList({
    posts,
    currentUserId,
    isForumOwner,
    isAdmin,
    onToggleLike,
    onToggleBestAnswer,

    onShowDeleteDialog,
}: ForumReplyListProps) {
    return (
        <div className="space-y-4 pb-4">
            {posts.map((post) => (
                <ForumPostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    isForumOwner={isForumOwner}
                    isAdmin={isAdmin}
                    onToggleLike={onToggleLike}
                    onToggleBestAnswer={onToggleBestAnswer}

                    onShowDeleteDialog={onShowDeleteDialog}
                />
            ))}

            {posts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-gray-500 text-sm">
                        Belum ada balasan. Jadilah yang pertama!
                    </p>
                </div>
            )}
        </div>
    );
}
