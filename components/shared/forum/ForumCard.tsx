"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Clock, Heart, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { Forum } from "@/types/forum";
import { cn } from "@/utils";
import { ROUTES } from "@/lib/routes";
import { parseApiDate } from "@/utils/date";
import { stripForumFormatTag, extractForumFormatLabel } from "@/utils/forum-content";

interface ForumCardProps {
  forum: Forum;
  className?: string;
}

const CATEGORY_BADGE_STYLES = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-cyan-50 text-cyan-700 border-cyan-200",
] as const;

const AVATAR_GRADIENTS = [
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-purple-400 to-purple-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-cyan-400 to-cyan-600",
] as const;

function hashString(value: string): number {
  return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function getCategoryBadgeClass(categoryName?: string): string {
  if (!categoryName) {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }
  return CATEGORY_BADGE_STYLES[hashString(categoryName) % CATEGORY_BADGE_STYLES.length];
}

export function ForumCard({ forum, className }: ForumCardProps) {
  const categoryName = forum.category?.name || "Umum";
  const previewContent = stripForumFormatTag(forum.content);
  const formatLabel = extractForumFormatLabel(forum.content);
  const authorName = forum.user?.name || "Anonim";
  const isAnswered = forum.has_accepted_answer || forum.has_best_answer;

  const avatarGradient = AVATAR_GRADIENTS[hashString(authorName) % AVATAR_GRADIENTS.length];
  const initial = authorName.charAt(0).toUpperCase();

  return (
    <Link
      href={ROUTES.forumDetail(forum.slug)}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border bg-card p-5 transition-all",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Accent rail on hover */}
      <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />

      <div className="flex flex-col gap-3">
        {/* Header: author + meta */}
        <div className="flex items-center gap-3">
          {forum.user?.avatar ? (
            <Image
              src={forum.user.avatar}
              alt={authorName}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
              unoptimized
            />
          ) : (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm",
                avatarGradient
              )}
            >
              {initial}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{authorName}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(parseApiDate(forum.created_at), { addSuffix: true, locale: id })}
            </p>
          </div>

          {isAnswered && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Terjawab
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex max-w-full items-center rounded-md border px-2 py-0.5 text-xs font-medium",
              getCategoryBadgeClass(categoryName)
            )}
          >
            <span className="truncate max-w-45">{categoryName}</span>
          </span>
          {formatLabel && (
            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
              {formatLabel}
            </span>
          )}
        </div>

        {/* Title + preview */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2 wrap-break-word">
            {forum.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground wrap-break-word">
            {previewContent || "Tidak ada preview konten"}
          </p>
        </div>

        {/* Footer stats */}
        <div className="mt-1 flex items-center gap-4 border-t pt-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5" title="Balasan">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">{forum.replies_count || 0}</span>
            <span className="hidden sm:inline">balasan</span>
          </span>
          <span className="inline-flex items-center gap-1.5" title="Suka">
            <Heart className="h-4 w-4" />
            <span className="font-medium">{forum.likes_count || 0}</span>
            <span className="hidden sm:inline">suka</span>
          </span>
          <span className="ml-auto text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Lihat diskusi →
          </span>
        </div>
      </div>
    </Link>
  );
}
