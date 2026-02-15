"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { Article } from "@/types";
import { formatDate } from "@/lib/utils";

interface RecommendedArticlesWidgetProps {
  articles: Article[];
  isLoading?: boolean;
}

export function RecommendedArticlesWidget({ articles, isLoading }: RecommendedArticlesWidgetProps) {
  if (isLoading) {
    return (
       <Card className="h-full border-none shadow-none bg-transparent">
         <CardHeader className="px-0 pt-0">
           <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
         </CardHeader>
         <CardContent className="px-0 space-y-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex gap-4">
               <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse shrink-0" />
               <div className="flex-1 space-y-2">
                 <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                 <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
               </div>
             </div>
           ))}
         </CardContent>
       </Card>
    );
  }

  return (
    <Card className="flex flex-col border border-gray-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Bacaan Untukmu
        </CardTitle>
        <Link href={ROUTES.ARTICLES}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
            Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-2">
        {articles.length > 0 ? (
          articles.slice(0, 3).map((article) => (
            <Link key={article.id} href={ROUTES.articleRead(article.id)} className="block group relative">
              <div className="flex gap-4 items-start p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative shadow-sm group-hover:shadow-md transition-shadow">
                   {article.thumbnail ? (
                     <Image
                       src={article.thumbnail}
                       alt={article.title}
                       fill
                       className="object-cover group-hover:scale-110 transition-transform duration-500"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-primary/5 text-2xl">📄</div>
                   )}
                </div>
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between h-24">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        {article.category?.name || "Umum"}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {/* Mock reading time for now */}
                        5 min baca
                      </span>
                    </div>
                    <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors text-gray-800">
                      {article.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-dashed border-gray-100 group-hover:border-gray-200 transition-colors">
                     <span className="font-medium text-gray-500">{formatDate(article.created_at)}</span>
                     <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-primary transition-colors -translate-x-1 group-hover:translate-x-0" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">Belum ada artikel</p>
              <p className="text-xs text-muted-foreground">Cek kembali nanti untuk bacaan baru</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
