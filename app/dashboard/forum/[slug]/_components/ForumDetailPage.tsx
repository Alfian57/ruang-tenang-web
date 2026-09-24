"use client";

import { useForumThread } from "../_hooks/useForumThread";
import { ForumHeader } from "./ForumHeader";
import { ForumDeleteDialogs } from "./ForumDeleteDialogs";
import { ForumPostDetail } from "./ForumPostDetail";
import { ForumReplyForm } from "./ForumReplyForm";
import { ForumReplyList } from "./ForumReplyList";
import { AlertTriangle, ArrowUpDown, MessageSquareText } from "lucide-react";

export default function ForumDetailPage() {
    const {
        user,
        isAdmin,
        forum,
        posts,
        loading,
        replyContent,
        submitting,
        isLiked,
        likesCount,
        showDeletePostDialog,
        showDeleteForumDialog,
        isDeleting,
        setReplyContent,
        setDeletePostId,
        setShowDeletePostDialog,
        setShowDeleteForumDialog,
        handleReply,
        handleDeletePost,
        handleDeleteForum,
        handleToggleLike,
        handleTogglePostLike,
        handleToggleBestAnswer,
        sortOrder,
        setSortOrder,
    } = useForumThread();

    if (loading) {
        return (
            <div className="mx-auto min-h-[70vh] w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6 lg:py-10">
                <div className="h-12 w-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                <div className="h-40 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white" />
                <div className="h-60 animate-pulse rounded-3xl border border-slate-200 bg-white" />
                <div className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white" />
                <div className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white" />
            </div>
        );
    }

    if (!forum) {
        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-12 sm:px-6">
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900">Topik tidak ditemukan</h1>
                    <p className="mt-2 text-sm text-slate-500">Topik mungkin sudah dihapus atau tidak tersedia.</p>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === forum.user_id;

    return (
        <>
            <ForumDeleteDialogs
                showDeletePostDialog={showDeletePostDialog}
                setShowDeletePostDialog={setShowDeletePostDialog}
                handleDeletePost={handleDeletePost}
                showDeleteForumDialog={showDeleteForumDialog}
                setShowDeleteForumDialog={setShowDeleteForumDialog}
                handleDeleteForum={handleDeleteForum}
                isDeleting={isDeleting}
                setDeletePostId={setDeletePostId}
            />

            <main className="mx-auto min-h-[70vh] w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6 lg:space-y-6 lg:py-10">
                <ForumHeader
                    forum={forum}
                    user={user}
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                    onDeleteClick={() => setShowDeleteForumDialog(true)}
                />

                {forum.is_flagged && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-sm">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-sm">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                            <h3 className="font-bold">Topik ini dibatasi</h3>
                            <p className="mt-1 text-sm leading-relaxed text-rose-800">
                                Topik ditandai oleh admin dan sementara tidak dapat menerima balasan baru.
                            </p>
                        </div>
                    </div>
                )}

                <ForumPostDetail
                    forum={forum}
                    user={user}
                    isLiked={isLiked}
                    likesCount={likesCount}
                    replyCount={posts.length}
                    onToggleLike={handleToggleLike}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/8 text-primary">
                            <MessageSquareText className="h-4 w-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Percakapan</h2>
                        </div>
                    </div>
                    <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-500 shadow-sm transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
                        <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as "top" | "newest" | "oldest")}
                            aria-label="Urutkan balasan"
                            className="max-w-32 cursor-pointer bg-transparent text-xs font-semibold text-slate-600 outline-none"
                        >
                            <option value="top">Paling disukai</option>
                            <option value="newest">Terbaru</option>
                            <option value="oldest">Terlama</option>
                        </select>
                    </label>
                </div>

                <ForumReplyForm
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    handleReply={handleReply}
                    submitting={submitting}
                    isFlagged={!!forum.is_flagged}
                />

                <ForumReplyList
                    posts={posts}
                    currentUserId={user?.id}
                    isForumOwner={isOwner}
                    isAdmin={isAdmin}
                    onToggleLike={handleTogglePostLike}
                    onToggleBestAnswer={handleToggleBestAnswer}
                    onShowDeleteDialog={(postId) => {
                        setDeletePostId(postId);
                        setShowDeletePostDialog(true);
                    }}
                />
            </main>
        </>
    );
}
