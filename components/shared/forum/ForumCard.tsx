"use client";

import Link from "next/link";
import { MessageSquare, Clock, User, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { Forum } from "@/types/forum";
import { cn } from "@/utils";

interface ForumCardProps {
  forum: Forum;
  className?: string;
}

export function ForumCard({ forum, className }: ForumCardProps) {
  return (
    <Link 
      href={`/dashboard/forum/${forum.slug}`}
      className={cn(
        "block bg-card p-5 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all group",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 w-full">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {forum.category ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {forum.category.name}
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Umum
                </span>
              )}
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                 <User className="w-3 h-3" />
                 {forum.user?.name || "Anonymous"}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 break-words">
              {forum.title}
            </h3>
          </div>
        </div>
        
        <p className="text-muted-foreground line-clamp-2 text-sm break-words">
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
              <span>{formatDistanceToNow(new Date(forum.created_at), { addSuffix: true, locale: id })}</span>
           </div>
        </div>
      </div>
    </Link>
  );
}
