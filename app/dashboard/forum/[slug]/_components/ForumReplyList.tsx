import { ForumPost } from "@/types";
import { ForumPostCard } from "./ForumPostCard";
import { MessageCircle } from "lucide-react";

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
        <section className="space-y-4 pb-6" aria-label="Daftar balasan">
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
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 px-5 py-12 text-center">
                    <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/8 text-primary">
                        <MessageCircle className="h-6 w-6" />
                    </span>
                    <h3 className="text-base font-bold text-slate-800">Belum ada balasan</h3>
                    <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                        Percakapan bisa dimulai dari satu tanggapan yang tulus dan suportif.
                    </p>
                </div>
            )}
        </section>
    );
}
