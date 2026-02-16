"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  User,
  Send,
  Loader2,
  Flag,
  MoreVertical,
} from "lucide-react";
import { ReportModal, BlockUserButton } from "@/components/shared/moderation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { StoryComment } from "@/types/gamification";

interface StoryCommentsProps {
  comments: StoryComment[];
  commentCount: number;
  loadingComments: boolean;
  token: string | null;
  userId?: number;
  newComment: string;
  submittingComment: boolean;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: () => void;
}

export function StoryComments({
  comments,
  commentCount,
  loadingComments,
  token,
  userId,
  newComment,
  submittingComment,
  onNewCommentChange,
  onSubmitComment,
}: StoryCommentsProps) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-6">
        Komentar ({commentCount})
      </h2>

      {/* Comment Input */}
      {token ? (
        <div className="mb-6">
          <Textarea
            placeholder="Tulis komentar yang mendukung..."
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            className="mb-3"
            rows={3}
          />
          <Button
            onClick={onSubmitComment}
            disabled={submittingComment || !newComment.trim()}
            className="gap-2"
          >
            {submittingComment ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Kirim Komentar
          </Button>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600 mb-2">
            Silakan login untuk berkomentar
          </p>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loadingComments ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Belum ada komentar. Jadilah yang pertama!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                {comment.author?.avatar ? (
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.author?.name || "Pengguna"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(
                          new Date(comment.created_at),
                          "d MMM yyyy, HH:mm",
                          { locale: idLocale }
                        )}
                      </span>
                    </div>
                    {token && comment.author?.id !== userId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="w-3 h-3 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ReportModal
                            type="story_comment"
                            contentId={comment.id}
                            userId={comment.author?.id}
                            trigger={
                              <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer">
                                <Flag className="w-4 h-4 mr-2" />
                                Laporkan
                              </div>
                            }
                          />
                          <BlockUserButton
                            userId={comment.author?.id || 0}
                            userName={comment.author?.name || "User"}
                            className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-gray-500 hover:text-rose-500"
                    >
                      <Heart className="w-3 h-3" />
                      {comment.heart_count}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
