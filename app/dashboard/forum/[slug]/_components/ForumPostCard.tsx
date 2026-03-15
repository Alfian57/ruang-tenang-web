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
    <div className={cn("flex gap-2 sm:gap-3 group transition-all", isBestAnswer && "sm:translate-x-2")}>
      <div className="shrink-0">
        <Avatar
          className={cn(
            "w-8 h-8 ring-2",
            isBestAnswer ? "ring-green-500" : "ring-transparent"
          )}
        >
          <AvatarImage src={authorAvatar} alt={post.user?.name || "User"} className="object-cover" />
          <AvatarFallback
            className={cn(
              "text-xs font-bold",
              isBestAnswer ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
            )}
          >
            {isBestAnswer ? <Trophy className="w-4 h-4" /> : authorInitial}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className={cn(
        "flex-1 min-w-0 p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-sm border transaction-colors relative",
        isBestAnswer ? "bg-green-50 border-green-200" : "bg-white"
      )}>
        {isBestAnswer && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1 max-w-[55%] truncate">
            <CheckCircle2 className="w-3 h-3" /> BEST ANSWER
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className={cn("text-sm font-semibold truncate max-w-45", post.is_best_answer ? "text-green-800" : "text-gray-900")}>
              {post.user?.name}
            </span>
            {isOwner && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Komentar Anda
              </span>
            )}
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDistanceToNow(parseApiDate(post.created_at), { addSuffix: true, locale: idLocale })}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isForumOwner && !isBestAnswer && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-gray-400 hover:text-green-600 hover:bg-green-50 hidden sm:inline-flex"
                onClick={() => onToggleBestAnswer(post)}
                title="Tandai sebagai Jawaban Terbaik"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Best Answer
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                  <MoreVertical className="w-3 h-3 text-gray-400" />
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

        {isForumOwner && !isBestAnswer && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-gray-500 hover:text-green-700 hover:bg-green-100 mb-2 sm:hidden"
            onClick={() => onToggleBestAnswer(post)}
            title="Tandai sebagai Jawaban Terbaik"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Best Answer
          </Button>
        )}

        <p className={cn("text-sm whitespace-pre-wrap leading-relaxed mb-3 wrap-break-word", isBestAnswer ? "text-green-900" : "text-gray-700")}>
          {post.content}
        </p>

        <div className="flex items-center gap-3 border-t border-gray-100/50 pt-2">
          {!isOwner && (
            <button
              onClick={() => onToggleLike(post)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors p-1 rounded",
                isLiked ? "text-red-500 bg-red-50" : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
              {likeCount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
