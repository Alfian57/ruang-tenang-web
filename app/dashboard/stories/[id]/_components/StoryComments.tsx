"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Heart,
  User,
  Send,
  Loader2,
  Flag,
  MoreVertical,
  MessageCircle,
  EyeOff,
} from "lucide-react";
import { ReportModal, BlockUserButton } from "@/components/shared/moderation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { StoryComment } from "@/types/gamification";

interface StoryCommentsProps {
  comments: StoryComment[];
  commentCount: number;
  loadingComments: boolean;
  canComment: boolean;
  token: string | null;
  userId?: number;
  isAdmin?: boolean;
  newComment: string;
  submittingComment: boolean;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  onHideComment?: (commentId: string, reason: string) => void | Promise<void>;
}

export function StoryComments({
  comments,
  commentCount,
  loadingComments,
  canComment,
  token,
  userId,
  isAdmin = false,
  newComment,
  submittingComment,
  onNewCommentChange,
  onSubmitComment,
  onHideComment,
}: StoryCommentsProps) {
  const safeComments = Array.isArray(comments) ? comments : [];
  const [hideTarget, setHideTarget] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState("");
  const [hiding, setHiding] = useState(false);

  const submitHide = async () => {
    if (!hideTarget || !onHideComment) return;
    setHiding(true);
    try {
      await onHideComment(hideTarget, hideReason.trim());
      setHideTarget(null);
      setHideReason("");
    } finally {
      setHiding(false);
    }
  };

  return (
    <section id="story-comments" className="space-y-5 scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-primary">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Ruang komentar</h2>
            <p className="text-sm text-slate-500">Berbagi tanggapan dengan hangat dan saling menghargai.</p>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600">
          {commentCount} komentar
        </span>
      </div>

      {token && canComment ? (
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-orange-50/50 p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <MessageCircle className="h-4 w-4 text-primary" />
            Tulis komentar yang mendukung
          </div>
          <Textarea
            aria-label="Tulis komentar"
            placeholder="Apa yang ingin kamu sampaikan?"
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            className="min-h-28 resize-y rounded-2xl border-slate-200 bg-white/90 px-4 py-3 leading-relaxed shadow-inner shadow-slate-100/70 placeholder:text-slate-400 focus-visible:bg-white"
            rows={4}
          />
          <div className="mt-3 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-relaxed text-slate-500">Pilih kata-kata yang memberi ruang dan dukungan.</p>
            <Button
              type="button"
              onClick={onSubmitComment}
              disabled={submittingComment || !newComment.trim()}
              className="h-10 gap-2 rounded-xl px-4"
            >
              {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Kirim komentar
            </Button>
          </div>
        </div>
      ) : token && !canComment ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><MessageCircle className="h-4 w-4" /></span>
          <p className="pt-1 text-sm leading-relaxed text-amber-800">Komentar akan tersedia setelah kisah ini disetujui admin.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><User className="h-5 w-5" /></span>
            <div>
              <p className="font-semibold text-slate-800">Ingin ikut berbagi dukungan?</p>
              <p className="mt-0.5 text-sm text-slate-500">Masuk terlebih dahulu untuk menulis komentar.</p>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-rose-200 text-primary hover:bg-rose-50">
            <Link href="/login">Masuk untuk berkomentar</Link>
          </Button>
        </div>
      )}

      {loadingComments ? (
        <div className="space-y-3" aria-label="Memuat komentar">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100" />
                <div className="space-y-2"><div className="h-3 w-32 rounded-full bg-slate-100" /><div className="h-3 w-20 rounded-full bg-slate-50" /></div>
              </div>
              <div className="h-4 w-4/5 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      ) : safeComments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 px-5 py-9 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><MessageCircle className="h-5 w-5" /></span>
          <h3 className="font-semibold text-slate-800">Belum ada komentar</h3>
          <p className="mt-1 text-sm text-slate-500">Jadilah yang pertama menyampaikan dukungan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeComments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 sm:p-5">
              <div className="flex items-start gap-3">
                {comment.author?.avatar ? (
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full border border-slate-100 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-orange-100 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-slate-800">{comment.author?.name || "Pengguna"}</span>
                      <span className="text-xs text-slate-400">{format(new Date(comment.created_at), "d MMM yyyy, HH:mm", { locale: idLocale })}</span>
                      {comment.is_hidden && (
                        <Badge variant="muted" icon={<EyeOff className="h-3 w-3" />}>Disembunyikan</Badge>
                      )}
                    </div>
                    {token && (isAdmin || (!!comment.author?.id && comment.author.id !== userId)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Opsi komentar" className="-mr-2 -mt-2 h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!!comment.author?.id && comment.author.id !== userId && (
                            <>
                              <ReportModal
                                type="story_comment"
                                contentId={comment.id}
                                userId={comment.author.id}
                                trigger={
                                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50">
                                    <Flag className="mr-2 h-4 w-4" />
                                    Laporkan
                                  </div>
                                }
                              />
                              <BlockUserButton
                                userId={comment.author.id}
                                userName={comment.author.name || "User"}
                                className="h-auto w-full justify-start px-2 py-1.5 text-sm font-normal text-red-600 hover:bg-red-50 hover:text-red-600"
                              />
                            </>
                          )}
                          {isAdmin && onHideComment && !comment.is_hidden && (
                            <DropdownMenuItem
                              onClick={() => {
                                setHideReason("");
                                setHideTarget(comment.id);
                              }}
                              className="text-red-600"
                            >
                              <EyeOff className="mr-2 h-4 w-4" />
                              Sembunyikan Komentar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 sm:text-[15px]">{comment.content}</p>
                  <div className="mt-3">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-slate-500 hover:bg-rose-50 hover:text-primary">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{comment.heart_count}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={hideTarget !== null} onOpenChange={(open) => { if (!open) setHideTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sembunyikan Komentar</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Komentar akan disembunyikan dari publik. Sertakan alasan moderasi.</p>
            <Textarea
              placeholder="Alasan menyembunyikan komentar"
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHideTarget(null)} disabled={hiding}>Batal</Button>
            <Button variant="destructive" onClick={submitHide} disabled={hiding || !hideReason.trim()}>
              {hiding ? "Menyembunyikan..." : "Sembunyikan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
