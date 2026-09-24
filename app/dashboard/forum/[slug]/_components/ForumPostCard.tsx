"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Trash2, CheckCircle2, Trophy, MoreVertical, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/utils";
import { ReportModal, BlockUserButton } from "@/components/shared/moderation";
import { parseApiDate } from "@/utils/date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ForumPost } from "@/types/forum";

interface ForumPostCardProps {
  post: ForumPost;
  currentUserId?: number;
  isForumOwner: boolean;
  isAdmin: boolean;
  onToggleLike: (post: ForumPost) => void;
  onToggleBestAnswer: (post: ForumPost) => void;

  onShowDeleteDialog: (postId: number) => void;
}

export function ForumPostCard({
  post,
  currentUserId,
  isForumOwner,
  isAdmin,
  onToggleLike,
  onToggleBestAnswer,

  onShowDeleteDialog,
}: ForumPostCardProps) {
  const isBestAnswer = post.is_accepted_answer ?? post.is_best_answer ?? false;
  const isLiked = post.has_user_voted ?? post.is_liked ?? false;
  const likeCount = post.upvotes_count ?? post.likes_count ?? 0;
  const isOwner = currentUserId === post.user_id;
  const authorInitial = post.user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const authorAvatar = post.user?.avatar?.trim() || "";

  return (
    <article className="group flex items-start gap-2.5 sm:gap-3.5">
      <div className="shrink-0 pt-1">
        <Avatar
          className={cn(
            "h-9 w-9 ring-2 ring-offset-2 ring-offset-slate-50 sm:h-10 sm:w-10",
            isBestAnswer ? "ring-emerald-300" : "ring-white"
          )}
        >
          <AvatarImage src={authorAvatar} alt={post.user?.name || "User"} className="object-cover" />
          <AvatarFallback
            className={cn(
              "text-xs font-bold",
              isBestAnswer ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            )}
          >
            {isBestAnswer ? <Trophy className="w-4 h-4" /> : authorInitial}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className={cn(
        "relative min-w-0 flex-1 rounded-2xl border p-3.5 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.45)] transition duration-200 group-hover:-translate-y-px group-hover:shadow-[0_18px_36px_-28px_rgba(15,23,42,0.4)] sm:p-4",
        isBestAnswer ? "border-emerald-200 bg-emerald-50/55" : "border-slate-200/80 bg-white group-hover:border-slate-300"
      )}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className={cn("max-w-48 truncate text-sm font-bold", isBestAnswer ? "text-emerald-900" : "text-slate-900")}>
              {post.user?.name}
            </span>
            {isOwner && (
              <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Komentar Anda
              </span>
            )}
            <span className="text-[11px] text-slate-400">{formatDistanceToNow(parseApiDate(post.created_at), { addSuffix: true, locale: idLocale })}</span>
            {isBestAnswer && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800">
                <Trophy className="h-3 w-3" /> Jawaban terbaik
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isForumOwner && !isBestAnswer && (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Tandai sebagai jawaban terbaik"
                className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 sm:w-auto sm:px-2.5"
                onClick={() => onToggleBestAnswer(post)}
                title="Tandai sebagai Jawaban Terbaik"
              >
                <CheckCircle2 className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden text-xs font-semibold sm:inline">Pilih terbaik</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Aksi balasan" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(currentUserId === post.user_id || isAdmin) && (
                  <DropdownMenuItem
                    onClick={() => onShowDeleteDialog(post.id)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Balasan
                  </DropdownMenuItem>
                )}
                {currentUserId && currentUserId !== post.user_id && (
                  <>
                    <ReportModal
                      type="forum_post"
                      contentId={post.id}
                      userId={post.user_id}
                      trigger={
                        <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 cursor-pointer">
                          <Flag className="w-4 h-4 mr-2" />
                          Laporkan Balasan
                        </div>
                      }
                    />
                    <BlockUserButton
                      userId={post.user_id}
                      userName={post.user?.name || "User"}
                      className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                    />
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className={cn("mb-3 whitespace-pre-wrap break-words text-sm leading-7", isBestAnswer ? "text-emerald-950" : "text-slate-700")}>
          {post.content}
        </p>

        <div className="flex items-center gap-2 border-t border-slate-200/70 pt-2.5">
          {!isOwner && (
            <button
              onClick={() => onToggleLike(post)}
              aria-label={`${isLiked ? "Batal suka" : "Suka"} balasan dari ${post.user?.name || "pengguna"}`}
              aria-pressed={isLiked}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                isLiked ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              {likeCount}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
