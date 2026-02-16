import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Article } from "@/types";

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
                className="block"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow bg-white">
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {related.thumbnail ? (
                        <Image
                          src={related.thumbnail}
                          alt={related.title}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          📄
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900">
                        {related.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {related.category?.name || "Umum"}
                      </p>
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
