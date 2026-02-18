import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag, Ban, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";
import { sanitizeHtml } from "@/utils/sanitize";
import { Article } from "@/types";

interface ArticleContentProps {
  article: Article;
  isArticleAuthor: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  authorId: number | undefined;
  isBlocked: (userId: number) => boolean;
  onBlockClick: () => void;
}

export function ArticleContent({
  article,
  isArticleAuthor,
  isAdmin,
  isModerator,
  authorId,
  isBlocked,
  onBlockClick,
}: ArticleContentProps) {
  return (
    <div className="lg:col-span-8">
      <Card className="bg-white p-6 lg:p-8">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {article.title}
            </h1>
            {(isArticleAuthor || isAdmin || isModerator) && article.status !== "blocked" && (
              <Link href={isArticleAuthor ? `/dashboard/articles/${article.slug}` : "#"}>
                <Button variant="outline" size="sm" disabled={!isArticleAuthor && !isAdmin}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
              <Tag className="w-3.5 h-3.5" />
              {article.category?.name || "Umum"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(article.created_at)}
            </span>
            {article.author && (
              <span className="text-gray-400">
                oleh <span className="text-gray-600 font-medium">{article.author.name}</span>
              </span>
            )}
            {article.author && !isArticleAuthor && authorId !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2 text-xs gap-1"
                onClick={onBlockClick}
                disabled={isBlocked(authorId)}
              >
                <Ban className="w-3 h-3" />
                {isBlocked(authorId) ? "Diblokir" : "Blokir"}
              </Button>
            )}
          </div>
        </div>

        {article.thumbnail && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <Image
              src={article.thumbnail}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />
      </Card>
    </div>
  );
}
