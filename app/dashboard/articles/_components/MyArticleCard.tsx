import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";
import { getStatusBadge } from "./ArticleStatusBadge";
import { getUploadUrl } from "@/services/http/upload-url";
import type { MyArticle } from "../_hooks/useArticlesPage";
import { ArticleThumbnail } from "@/components/shared/articles/ArticleThumbnail";

interface MyArticleCardProps {
  article: MyArticle;
  onDelete: (identifier: string) => void;
}

export function MyArticleCard({ article, onDelete }: MyArticleCardProps) {
  const displayStatus = article.moderation_status === "pending" || article.moderation_status === "rejected" || article.moderation_status === "revision_needed"
    ? article.moderation_status
    : article.status;

  return (
    <Card className="theme-accent-border-soft rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3 min-w-0 flex-1 items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:w-28">
            <ArticleThumbnail
              src={article.thumbnail?.trim() ? getUploadUrl(article.thumbnail.trim()) : undefined}
              alt={article.title}
              sizes="(max-width: 640px) 80px, 112px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h3 className="truncate font-semibold text-slate-900">{article.title}</h3>
              <div className="w-fit">{getStatusBadge(displayStatus)}</div>
            </div>
            <p className="text-sm text-gray-500">
              {article.category?.name || "Umum"} • {formatDate(article.created_at)}
            </p>
            {article.status === "blocked" && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Artikel ini diblokir oleh admin
              </p>
            )}
            {article.moderation_status === "pending" && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Artikel sedang menunggu persetujuan admin
              </p>
            )}
            {article.moderation_status === "rejected" && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Artikel ditolak oleh admin
              </p>
            )}
            {article.moderation_status === "revision_needed" && (
              <p className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Artikel perlu direvisi
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="icon" title="Lihat" aria-label={`Lihat ${article.title}`} className="h-9 w-9 rounded-xl">
            <Link href={ROUTES.articleRead(article.slug)}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
          {article.status !== "blocked" && (
            <Button asChild variant="outline" size="icon" title="Edit" aria-label={`Edit ${article.title}`} className="h-9 w-9 rounded-xl">
              <Link href={ROUTES.articleDetail(article.slug)}>
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl text-red-500"
            onClick={() => onDelete(article.slug || String(article.id))}
            title="Hapus"
            aria-label={`Hapus ${article.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
