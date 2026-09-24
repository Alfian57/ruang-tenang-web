import Link from "next/link";
import { Calendar, Tag, Ban, Edit, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";
import { sanitizeHtml } from "@/utils/sanitize";
import { Article } from "@/types";
import { ROUTES } from "@/lib/routes";
import { ArticleThumbnail } from "@/components/shared/articles/ArticleThumbnail";

interface ArticleContentProps {
  article: Article;
  isArticleAuthor: boolean;
  isAdmin: boolean;
  authorId: number | undefined;
  isBlocked: (userId: number) => boolean;
  onBlockClick: () => void;
}

type ArticleActionPlan = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

function getArticleActionPlan(article: Article): ArticleActionPlan {
  const signal = `${article.title} ${article.category?.name || ""}`.toLowerCase();

  if (/(cemas|panik|gelisah|stress|overthink|tegang)/.test(signal)) {
    return {
      title: "Tutup bacaan ini dengan refleksi singkat",
      description: "Catat satu hal yang kamu rasakan agar insight dari artikel lebih mudah dipraktikkan.",
      primaryLabel: "Catat Refleksi",
      primaryHref: `${ROUTES.JOURNAL}/create?mode=structured-reflection`,
      secondaryLabel: "Catat Trigger di Jurnal",
      secondaryHref: `${ROUTES.JOURNAL}/create?mode=structured-reflection`,
    };
  }

  if (/(syukur|gratitude|refleksi|mindful|jurnal|journal)/.test(signal)) {
    return {
      title: "Ubah insight jadi catatan pribadi sekarang",
      description: "Satu paragraf refleksi setelah membaca akan memperkuat retensi dan arah aksi.",
      primaryLabel: "Lanjut ke Jurnal Syukur",
      primaryHref: `${ROUTES.JOURNAL}/create?mode=gratitude`,
      secondaryLabel: "Diskusi di Community",
      secondaryHref: ROUTES.COMMUNITY,
    };
  }

  if (/(relasi|komunikasi|dukungan|keluarga|teman|komunitas)/.test(signal)) {
    return {
      title: "Hubungkan insight ini ke dukungan sosial",
      description: "Pilih satu langkah interaksi sehat agar dampak artikel terasa di kehidupan nyata.",
      primaryLabel: "Buka Community Mission",
      primaryHref: ROUTES.COMMUNITY,
      secondaryLabel: "Mulai Obrolan Aman",
      secondaryHref: ROUTES.CHAT,
    };
  }

  return {
    title: "Lanjutkan ke aksi 2 menit agar tidak berhenti di bacaan",
    description: "Pilih satu langkah kecil yang paling relevan dengan kondisimu hari ini.",
    primaryLabel: "Refleksi Cepat di Jurnal",
    primaryHref: `${ROUTES.JOURNAL}/create?mode=action-plan`,
    secondaryLabel: "Buka Chat Pendamping",
    secondaryHref: ROUTES.CHAT,
  };
}

export function ArticleContent({
  article,
  isArticleAuthor,
  isAdmin,
  authorId,
  isBlocked,
  onBlockClick,
}: ArticleContentProps) {
  const actionPlan = getArticleActionPlan(article);

  return (
    <div className="min-w-0 lg:col-span-8">
      <Card className="theme-accent-border-soft overflow-hidden rounded-3xl border bg-white p-5 shadow-sm sm:p-7 lg:p-8">
        <div className="mb-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="min-w-0 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {article.title}
            </h1>
            {(isArticleAuthor || isAdmin) && article.status !== "blocked" && (
              <Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
                <Link href={isArticleAuthor ? ROUTES.articleDetail(article.slug) : ROUTES.ADMIN.ARTICLES}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 rounded-full border border-theme-accent-border bg-theme-accent-soft px-3 py-1.5 font-semibold text-theme-accent-dark">
              <Tag className="w-3.5 h-3.5" />
              {article.category?.name || "Umum"}
            </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
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
                className="h-8 gap-1 rounded-full px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={onBlockClick}
                disabled={isBlocked(authorId)}
              >
                <Ban className="w-3 h-3" />
                {isBlocked(authorId) ? "Diblokir" : "Blokir"}
              </Button>
            )}
          </div>
        </div>

        <div className="relative mb-7 aspect-video overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <ArticleThumbnail src={article.thumbnail} alt={article.title} sizes="(max-width: 1024px) 100vw, 66vw" />
        </div>

        <div
          className="prose prose-slate max-w-none break-words prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:font-semibold prose-a:text-primary prose-img:rounded-2xl prose-blockquote:border-primary/40 prose-blockquote:text-slate-600"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        <div className="theme-accent-border-soft mt-8 rounded-3xl border bg-[linear-gradient(135deg,var(--theme-accent-soft),white_55%,var(--theme-accent-light))] p-5 md:p-6">
          <div className="flex items-center gap-2 text-primary mb-2">
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Langkah Lanjutan</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">{actionPlan.title}</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">{actionPlan.description}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full sm:w-auto">
              <Link href={actionPlan.primaryHref}>
                {actionPlan.primaryLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/10">
              <Link href={actionPlan.secondaryHref}>
                {actionPlan.secondaryLabel}
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
