"use client";

import { useForumThread } from "./_hooks/useForumThread";
import { ForumHeader } from "./_components/ForumHeader";
import { ForumDeleteDialogs } from "./_components/ForumDeleteDialogs";
import { ForumPostDetail } from "./_components/ForumPostDetail";
import { ForumReplyForm } from "./_components/ForumReplyForm";
import { ForumReplyList } from "./_components/ForumReplyList";
import { AlertTriangle } from "lucide-react";

export default function ForumTopicPage() {
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
    } = useForumThread();

    if (loading) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] bg-gray-50">
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
        return <div className="p-10 text-center text-gray-500">Topik tidak ditemukan</div>;
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

            <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] bg-gray-50">
                <ForumHeader
                    forum={forum}
                    user={user}
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                    onDeleteClick={() => setShowDeleteForumDialog(true)}
                />

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
                        {forum.is_flagged && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
                                <div className="bg-red-100 p-2 rounded-full shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Topik Ini Diblokir</h3>
                                    <p className="text-sm text-red-700">
                                        Topik ini telah ditandai/diblokir oleh moderator dan tidak dapat
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
                            <div className="relative flex justify-center text-xs uppercase tracking-wider font-medium">
                                <span className="bg-gray-50 px-3 text-gray-400">Balasan</span>
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
