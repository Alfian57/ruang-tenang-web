import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Article } from "@/types";
import { getHtmlExcerpt } from "@/utils";

interface ArticleSidebarProps {
  relatedArticles: Article[];
  backLink: string;
}

export function ArticleSidebar({ relatedArticles, backLink }: ArticleSidebarProps) {
  return (
    <div className="lg:col-span-4">
      <div className="sticky top-24">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Artikel Terkait</h3>
        <div className="space-y-4">
          {relatedArticles.length > 0 ? (
            relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/dashboard/articles/read/${related.slug}`}
                className="block group"
              >
                <Card className="overflow-hidden border-gray-100 group-hover:shadow-md transition-all bg-white">
                  <div className="flex gap-3 p-4 items-start">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {related.thumbnail ? (
                        <Image
                          src={related.thumbnail}
                          alt={related.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          📄
                        </div>
                      )}
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
            <p className="text-sm text-gray-500">Tidak ada artikel terkait</p>
          )}
        </div>

        <div className="mt-6">
          <Link href={backLink}>
            <Button variant="outline" className="w-full">
              Kembali ke Daftar Artikel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
