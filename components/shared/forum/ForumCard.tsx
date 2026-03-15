"use client";

import Link from "next/link";
import { MessageSquare, Clock, User, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { Forum } from "@/types/forum";
import { cn } from "@/utils";
import { ROUTES } from "@/lib/routes";
import { parseApiDate } from "@/utils/date";

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

function getCategoryBadgeClass(categoryName?: string): string {
  if (!categoryName) {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  const hash = Array.from(categoryName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CATEGORY_BADGE_STYLES[hash % CATEGORY_BADGE_STYLES.length];
}

export function ForumCard({ forum, className }: ForumCardProps) {
  const categoryName = forum.category?.name || "Umum";

  return (
    <Link
      href={ROUTES.forumDetail(forum.slug)}
      className={cn(
        "block bg-card p-5 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all group",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 w-full">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border max-w-full",
                  getCategoryBadgeClass(categoryName)
                )}
              >
                <span className="truncate max-w-45">{categoryName}</span>
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {forum.user?.name || "Anonymous"}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 wrap-break-word">
              {forum.title}
            </h3>
          </div>
        </div>

        <p className="text-muted-foreground line-clamp-2 text-sm wrap-break-word">
          {forum.content || "Tidak ada preview konten"}
        </p>

        <div className="flex items-center justify-between mt-2 pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5" title="Balasan">
              <MessageSquare className="w-4 h-4" />
              <span>{forum.replies_count || 0}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Suka">
              <Heart className="w-4 h-4" />
              <span>{forum.likes_count || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(parseApiDate(forum.created_at), { addSuffix: true, locale: id })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
