"use client";

import {
  ArrowLeft,
  Share2,
  Flag,
  AlertTriangle,
  MoreVertical,
  Clock3,
} from "lucide-react";
import { ReportModal, BlockUserButton } from "@/components/shared/moderation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStoryDetail } from "./_hooks/useStoryDetail";
import { StoryContent } from "./_components/StoryContent";
import { StoryComments } from "./_components/StoryComments";

export default function StoryDetailPage() {
  const {
    token,
    user,
    storyId,
    story,
    comments,
    loading,
    loadingComments,
    showContent,
    newComment,
    submittingComment,
    heartLoading,
    canComment,
    router,
    setShowContent,
    setNewComment,
    handleToggleHeart,
    handleSubmitComment,
    handleShare,
  } = useStoryDetail();

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(to bottom, color-mix(in srgb, var(--theme-accent-soft) 50%, transparent), white)` }}>
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-4 lg:p-6 flex items-center justify-between">
            <div className="h-10 w-20 rounded-lg bg-gray-200 animate-pulse" />
            <div className="flex gap-2"><div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" /><div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" /></div>
          </div>
        </div>
        <div className="p-4 lg:p-6 space-y-8">
          <div className="rounded-2xl aspect-video bg-gray-200 animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" /><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /><div className="h-4 w-28 rounded bg-gray-200 animate-pulse" /></div>
          </div>
          <div className="flex gap-2">{[1, 2, 3].map(i => <div key={i} className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />)}</div>
          <div className="space-y-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-5 rounded bg-gray-200 animate-pulse" style={{ width: `${85 + (i % 3) * 5}%` }} />)}</div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Kisah tidak ditemukan</h2>
        <Button onClick={() => router.push("/dashboard/stories")}>
          Kembali ke Kisah
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/stories")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              {token && !!story?.author?.id && story.author.id !== user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ReportModal
                      type="story"
                      contentId={storyId}
                      userId={story?.author?.id}
                      trigger={
                        <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 cursor-pointer">
                          <Flag className="w-4 h-4 mr-2" />
                          Laporkan Kisah
                        </div>
                      }
                    />
                    <BlockUserButton
                      userId={story?.author?.id || 0}
                      userName={story?.author?.name || "User"}
                      className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {user?.id === story.author?.id && story.status !== "approved" && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-start gap-3">
              <Clock3 className="w-5 h-5 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">Kisah Anda sedang menunggu moderasi</p>
                <p className="text-sm text-amber-800 mt-1">
                  Kisah belum tampil di halaman publik sampai disetujui admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trigger Warning Overlay */}
        {story.has_trigger_warning && !showContent && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Peringatan Konten Sensitif</h2>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              {story.trigger_warning_text ||
                "Kisah ini mungkin mengandung konten yang sensitif atau memicu."}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/stories")}
              >
                Kembali
              </Button>
              <Button
                onClick={() => setShowContent(true)}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Saya Mengerti, Tampilkan
              </Button>
            </div>
          </div>
        )}

        {/* Story Content */}
        {(!story.has_trigger_warning || showContent) && (
          <>
            <StoryContent
              story={story}
              heartLoading={heartLoading}
              onToggleHeart={handleToggleHeart}
            />

            <StoryComments
              comments={comments}
              commentCount={story.comment_count}
              loadingComments={loadingComments}
              canComment={canComment}
              token={token}
              userId={user?.id}
              newComment={newComment}
              submittingComment={submittingComment}
              onNewCommentChange={setNewComment}
              onSubmitComment={handleSubmitComment}
            />
          </>
        )}
      </div>
    </div>
  );
}
