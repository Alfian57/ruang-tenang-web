"use client";

import {
  ArrowLeft,
  Share2,
  Flag,
  AlertTriangle,
  MoreVertical,
  Clock3,
  BookOpen,
} from "lucide-react";
import { ReportModal, BlockUserButton } from "@/components/shared/moderation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStoryDetail } from "../_hooks/useStoryDetail";
import { StoryContent } from "./StoryContent";
import { StoryComments } from "./StoryComments";
import { ROUTES } from "@/lib/routes";

export default function StoryDetailPage() {
  const {
    token,
    user,
    isAdmin,
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
    handleHideComment,
  } = useStoryDetail();

  if (loading) {
    return (
      <div className="min-h-[70vh] pb-12">
        <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="flex gap-2"><div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" /><div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" /></div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
          <div className="space-y-4 rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
            <div className="h-4 w-36 animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 w-4/5 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-5 w-2/5 animate-pulse rounded-full bg-slate-100" />
            <div className="h-8 w-64 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="space-y-4 rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="h-4 animate-pulse rounded-full bg-slate-100" style={{ width: `${82 + (i % 3) * 6}%` }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-lg flex-col items-center rounded-[1.75rem] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-primary"><BookOpen className="h-7 w-7" /></span>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Kisah tidak ditemukan</h2>
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">Kisah mungkin sudah dihapus atau tidak tersedia untuk akunmu.</p>
          <Button onClick={() => router.push(ROUTES.communityTab("stories"))} className="rounded-xl">Kembali ke Kisah</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
        <div className="flex">
          <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(ROUTES.communityTab("stories"))}
              className="h-9 gap-2 rounded-xl px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke kisah
            </Button>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200" />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Bagikan kisah"
              onClick={handleShare}
              className="h-9 gap-2 rounded-xl px-3 text-slate-600 hover:bg-rose-50 hover:text-primary"
            >
              <Share2 className="h-4 w-4" />
              Bagikan
            </Button>
            {token && !!story?.author?.id && story.author.id !== user?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Opsi kisah" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <ReportModal
                    type="story"
                    contentId={storyId}
                    userId={story.author.id}
                    trigger={
                      <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50">
                        <Flag className="mr-2 h-4 w-4" />
                        Laporkan Kisah
                      </div>
                    }
                  />
                  <BlockUserButton
                    userId={story.author.id}
                    userName={story.author.name || "User"}
                    className="h-auto w-full justify-start px-2 py-1.5 text-sm font-normal text-red-600 hover:bg-red-50 hover:text-red-600"
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {user?.id === story.author?.id && story.status !== "approved" && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 text-amber-900 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100"><Clock3 className="h-5 w-5 text-amber-700" /></span>
              <div>
                <p className="font-semibold">Kisah Anda sedang menunggu moderasi</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  Kisah belum tampil di halaman publik sampai disetujui admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trigger Warning Overlay */}
        {story.has_trigger_warning && !showContent && (
          <div className="rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 px-5 py-10 text-center shadow-sm sm:px-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Peringatan konten sensitif</h2>
            <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-slate-600">
              {story.trigger_warning_text ||
                "Kisah ini mungkin mengandung konten yang sensitif atau memicu."}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.communityTab("stories"))}
                className="rounded-xl"
              >
                Kembali
              </Button>
              <Button
                onClick={() => setShowContent(true)}
                className="rounded-xl bg-amber-600 hover:bg-amber-700"
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
              isAdmin={isAdmin}
              newComment={newComment}
              submittingComment={submittingComment}
              onNewCommentChange={setNewComment}
              onSubmitComment={handleSubmitComment}
              onHideComment={handleHideComment}
            />
          </>
        )}
      </main>
    </div>
  );
}
