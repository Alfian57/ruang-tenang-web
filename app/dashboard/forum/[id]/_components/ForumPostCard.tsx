"use client";

import { Button } from "@/components/ui/button";
import { Heart, Trash2, CheckCircle2, Trophy, MoreVertical, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/utils";
import { ReportModal, BlockUserButton } from "@/components/shared/moderation";
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
  return (
    <div className={cn("flex gap-3 group transition-all", post.is_best_answer && "translate-x-2")}>
      <div className="shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-full overflow-hidden relative flex items-center justify-center text-xs font-bold ring-2",
          post.is_best_answer ? "bg-green-100 text-green-700 ring-green-500" : "bg-gray-200 text-gray-500 ring-transparent"
        )}>
          {post.is_best_answer ? <Trophy className="w-4 h-4" /> : (post.user?.name?.charAt(0).toUpperCase() || "U")}
        </div>
      </div>
      <div className={cn(
        "flex-1 p-4 rounded-2xl rounded-tl-none shadow-sm border transaction-colors relative",
        post.is_best_answer ? "bg-green-50 border-green-200" : "bg-white"
      )}>
        {post.is_best_answer && (
          <div className="absolute -top-3 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> BEST ANSWER
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-semibold", post.is_best_answer ? "text-green-800" : "text-gray-900")}>
              {post.user?.name}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: idLocale })}</span>
          </div>
          <div className="flex items-center gap-2">
            {isForumOwner && !post.is_best_answer && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-gray-400 hover:text-green-600 hover:bg-green-50"
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
                        <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer">
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

        <p className={cn("text-sm whitespace-pre-wrap leading-relaxed mb-3", post.is_best_answer ? "text-green-900" : "text-gray-700")}>
          {post.content}
        </p>

        <div className="flex items-center gap-3 border-t border-gray-100/50 pt-2">
          {currentUserId !== post.user_id ? (
            <button
              onClick={() => onToggleLike(post)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors p-1 rounded",
                post.is_liked ? "text-red-500 bg-red-50" : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", post.is_liked && "fill-current")} />
              {post.likes_count || 0}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 p-1">
              <Heart className="w-3.5 h-3.5" />
              {post.likes_count || 0}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
