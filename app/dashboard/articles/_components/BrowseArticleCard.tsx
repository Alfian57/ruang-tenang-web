import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/utils";
import { Article } from "@/types";
import { ArticleThumbnail } from "@/components/shared/articles/ArticleThumbnail";

interface BrowseArticleCardProps {
  article: Article;
  isOwn: boolean;
}

export function BrowseArticleCard({ article, isOwn }: BrowseArticleCardProps) {
  return (
    <Link href={ROUTES.articleRead(article.slug)} className="group block h-full min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <Card className="theme-accent-border-soft flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg motion-reduce:transition-none">
        <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
          <ArticleThumbnail
            src={article.thumbnail}
            alt={article.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            imageClassName="object-center transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-primary shadow-sm">
            {article.category?.name || "Umum"}
          </span>
          {isOwn && (
            <span className="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium rounded-full bg-primary text-white shadow-sm">
              Artikel Saya
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>
          <div className="mt-auto flex min-w-0 items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>{formatDate(article.created_at)}</span>
            {article.author && (
              <>
                <span>•</span>
                <span className="text-gray-500 truncate">{article.author.name}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
