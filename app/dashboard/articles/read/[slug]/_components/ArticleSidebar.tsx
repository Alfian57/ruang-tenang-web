import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Article } from "@/types";
import { getHtmlExcerpt } from "@/utils";
import { ArticleThumbnail } from "@/components/shared/articles/ArticleThumbnail";

interface ArticleSidebarProps {
  relatedArticles: Article[];
  backLink: string;
}

export function ArticleSidebar({ relatedArticles, backLink }: ArticleSidebarProps) {
  return (
    <div className="min-w-0 lg:col-span-4">
      <div className="lg:sticky lg:top-24">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><span className="h-5 w-1 rounded-full bg-primary" /> Artikel terkait</h3>
        <div className="space-y-4">
          {relatedArticles.length > 0 ? (
            relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/dashboard/articles/read/${related.slug}`}
                className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-white shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <div className="flex items-start gap-3 p-3 sm:p-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <ArticleThumbnail src={related.thumbnail} alt={related.title} sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {related.category?.name || "Umum"}
                      </p>
                      {getHtmlExcerpt(related.excerpt || related.content || "", 56) && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 leading-relaxed">
                          {getHtmlExcerpt(related.excerpt || related.content || "", 56)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500">Belum ada artikel terkait.</div>
          )}
        </div>

        <div className="mt-6">
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href={backLink}>
              Kembali ke Daftar Artikel
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
