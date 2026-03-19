import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";
import { getStatusBadge } from "./ArticleStatusBadge";
import type { MyArticle } from "../_hooks/useArticlesPage";

interface MyArticleCardProps {
  article: MyArticle;
  onDelete: (identifier: string) => void;
}

export function MyArticleCard({ article, onDelete }: MyArticleCardProps) {
  const displayStatus = article.moderation_status === "pending" || article.moderation_status === "rejected" || article.moderation_status === "revision_needed"
    ? article.moderation_status
    : article.status;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3 min-w-0">
          <div className="w-20 h-20 sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {article.thumbnail ? (
              <Image
                src={article.thumbnail}
                alt={article.title}
                width={96}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{article.title}</h3>
              <div className="w-fit">{getStatusBadge(displayStatus)}</div>
            </div>
            <p className="text-sm text-gray-500">
              {article.category?.name} • {formatDate(article.created_at)}
            </p>
            {article.status === "blocked" && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Artikel ini diblokir oleh admin
              </p>
            )}
            {article.moderation_status === "pending" && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Artikel sedang menunggu persetujuan admin
              </p>
            )}
            {article.moderation_status === "rejected" && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Artikel ditolak oleh admin
              </p>
            )}
            {article.moderation_status === "revision_needed" && (
              <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Artikel perlu direvisi
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={ROUTES.articleRead(article.slug)}>
            <Button variant="outline" size="icon" title="Lihat" className="h-9 w-9">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          {article.status !== "blocked" && (
            <Link href={ROUTES.articleDetail(article.slug)}>
              <Button variant="outline" size="icon" title="Edit" className="h-9 w-9">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-red-500"
            onClick={() => onDelete(article.slug || String(article.id))}
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
