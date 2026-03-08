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
                <div className="text-center py-16">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Belum ada balasan</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Jadilah yang pertama!
                    </p>
                </div>
            )}
        </div>
    );
}
