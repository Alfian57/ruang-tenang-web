import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag, Ban, Edit, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";
import { sanitizeHtml } from "@/utils/sanitize";
import { Article } from "@/types";
import { ROUTES } from "@/lib/routes";

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
      title: "Tutup bacaan ini dengan napas terstruktur 3 menit",
      description: "Regulasi tubuh dulu agar insight dari artikel lebih mudah dipraktikkan.",
      primaryLabel: "Mulai Atur Napas",
      primaryHref: ROUTES.BREATHING,
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
      secondaryHref: ROUTES.DASHBOARD_COMMUNITY,
    };
  }

  if (/(relasi|komunikasi|dukungan|keluarga|teman|komunitas)/.test(signal)) {
    return {
      title: "Hubungkan insight ini ke dukungan sosial",
      description: "Pilih satu langkah interaksi sehat agar dampak artikel terasa di kehidupan nyata.",
      primaryLabel: "Buka Community Mission",
      primaryHref: ROUTES.DASHBOARD_COMMUNITY,
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
    <div className="lg:col-span-8">
      <Card className="bg-white p-6 lg:p-8">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {article.title}
            </h1>
            {(isArticleAuthor || isAdmin) && article.status !== "blocked" && (
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

        <div className="mt-8 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5 md:p-6">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Langkah Lanjutan</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">{actionPlan.title}</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">{actionPlan.description}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link href={actionPlan.primaryHref}>
              <Button className="w-full sm:w-auto">
                {actionPlan.primaryLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href={actionPlan.secondaryHref}>
              <Button variant="outline" className="w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                {actionPlan.secondaryLabel}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
