"use client";

import { useForumThread } from "../_hooks/useForumThread";
import { ForumHeader } from "./ForumHeader";
import { ForumDeleteDialogs } from "./ForumDeleteDialogs";
import { ForumPostDetail } from "./ForumPostDetail";
import { ForumReplyForm } from "./ForumReplyForm";
import { ForumReplyList } from "./ForumReplyList";
import { AlertTriangle, ArrowUpDown } from "lucide-react";

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
            <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-0rem)]">
                <div className="bg-white border-b px-4 lg:px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shrink-0 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-1.5">
                        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                        <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
                    </div>
                </div>
                {/* Skeleton content could be extracted or just kept simple */}
            </div>
        );
    }

    if (!forum) {
        return <div className="py-10 text-center text-gray-500">Topik tidak ditemukan</div>;
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

            <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-0rem)]">
                <ForumHeader
                    forum={forum}
                    user={user}
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                    onDeleteClick={() => setShowDeleteForumDialog(true)}
                />

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-4xl space-y-6 py-4 lg:py-6">
                        {forum.is_flagged && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
                                <div className="bg-red-100 p-2 rounded-full shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Topik Ini Diblokir</h3>
                                    <p className="text-sm text-red-700">
                                        Topik ini telah ditandai/diblokir oleh admin dan tidak dapat
                                        menerima balasan baru.
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

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-between items-center">
                                <span className="bg-gray-50 pl-0 pr-3 text-xs uppercase tracking-wider font-medium text-gray-400">Balasan</span>
                                <div className="bg-gray-50 pl-3 pr-0 flex items-center gap-1.5">
                                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as "top" | "newest" | "oldest")}
                                        className="text-xs bg-transparent border-none outline-none text-gray-500 font-medium cursor-pointer"
                                    >
                                        <option value="top">Top</option>
                                        <option value="newest">Terbaru</option>
                                        <option value="oldest">Terlama</option>
                                    </select>
                                </div>
                            </div>
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
                    </div>
                </div>
            </div>
        </>
    );
}
