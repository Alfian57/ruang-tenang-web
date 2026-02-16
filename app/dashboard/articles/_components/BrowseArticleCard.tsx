import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/utils";
import { Article } from "@/types";

interface BrowseArticleCardProps {
  article: Article;
  isOwn: boolean;
}

export function BrowseArticleCard({ article, isOwn }: BrowseArticleCardProps) {
  return (
    <Link href={ROUTES.articleRead(article.slug)}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white cursor-pointer group h-full flex flex-col">
        <div className="relative h-40 overflow-hidden bg-gray-100">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              width={400}
              height={200}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
              <span className="text-4xl">📄</span>
            </div>
          )}
          <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-primary shadow-sm">
            {article.category?.name || "Umum"}
          </span>
          {isOwn && (
            <span className="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium rounded-full bg-primary text-white shadow-sm">
              Artikel Saya
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>
          <div className="mt-auto flex items-center gap-2 text-xs text-gray-400">
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
