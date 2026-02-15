"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, PenTool, Plus } from "lucide-react";
import { Journal } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface QuickJournalWidgetProps {
  latestJournal: Journal | null;
  isLoading?: boolean;
}

export function QuickJournalWidget({ latestJournal, isLoading }: QuickJournalWidgetProps) {
  if (isLoading) {
    return (
       <Card className="h-full border-none shadow-sm flex flex-col">
         <CardHeader>
           <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
         </CardHeader>
         <CardContent className="flex-1">
             <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
         </CardContent>
       </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border border-gray-100 shadow-sm bg-gradient-to-br from-white to-orange-50/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <Book className="w-5 h-5 text-orange-500" />
          Jurnal Terakhir
        </CardTitle>
        <Link href={ROUTES.JOURNAL}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-orange-600">
            Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {latestJournal ? (
          <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                   {latestJournal.mood_emoji && (
                       <span className="text-2xl bg-white p-1.5 rounded-full shadow-sm">{latestJournal.mood_emoji}</span>
                   )}
                   <div>
                       <h4 className="font-semibold text-gray-900 line-clamp-1">{latestJournal.title}</h4>
                       <p className="text-xs text-muted-foreground">
                           {formatDistanceToNow(new Date(latestJournal.created_at), { addSuffix: true, locale: id })}
                       </p>
                   </div>
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-orange-100/50 mb-4 h-24 overflow-hidden relative">
                    <p className="text-sm text-gray-600 line-clamp-3 italic">
                        &quot;{latestJournal.content.replace(/<[^>]*>/g, '').slice(0, 150)}...&quot;
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/80 to-transparent" />
                </div>
              </div>
              
              <Link href={ROUTES.JOURNAL}>
                  <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 group">
                      <PenTool className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Lanjut Menulis
                  </Button>
              </Link>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-white/50 rounded-xl border border-dashed border-orange-200">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <PenTool className="w-6 h-6 text-orange-500" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Hari ini belum menulis?</h4>
            <p className="text-xs text-muted-foreground mb-4">Tuangkan pikiranmu dan rasakan kelegaannya.</p>
            <Link href={ROUTES.JOURNAL} className="w-full">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200">
                <Plus className="w-4 h-4 mr-2" /> Tulis Jurnal Baru
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
