"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, PenTool, Plus } from "lucide-react";
import { Journal } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getHtmlExcerpt } from "@/utils";
import { useTheme } from "@/hooks/useTheme";

interface QuickJournalWidgetProps {
  latestJournal: Journal | null;
  isLoading?: boolean;
}

export function QuickJournalWidget({ latestJournal, isLoading }: QuickJournalWidgetProps) {
  const { exclusivity } = useTheme();
  const journalTitle = latestJournal?.title?.trim() || "Jurnal tanpa judul";
  const previewSource = latestJournal?.preview || latestJournal?.content || "";
  const previewText = getHtmlExcerpt(previewSource, 150);

  const relativeCreatedAt = (() => {
    if (!latestJournal?.created_at) return "Waktu tidak tersedia";

    const date = new Date(latestJournal.created_at);
    if (Number.isNaN(date.getTime())) return "Waktu tidak tersedia";

    const now = new Date();
    const safeDate = date > now ? now : date;
    return formatDistanceToNow(safeDate, { addSuffix: true, locale: id });
  })();

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-sm flex flex-col">
        <CardHeader>
          <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border shadow-sm theme-accent-border-soft" style={{ background: `linear-gradient(to bottom right, white, var(--theme-accent-soft))` }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <Book className="w-5 h-5 theme-accent-text" />
          Jurnal Terakhir
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-(--theme-accent-hover)">
          <Link href={ROUTES.JOURNAL}>
            Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
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
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{journalTitle}</h4>
                  <p className="text-xs text-muted-foreground">{relativeCreatedAt}</p>
                </div>
              </div>

              {previewText ? (
                <div className="p-4 bg-white/60 rounded-xl border theme-accent-border-soft mb-4 h-24 overflow-hidden relative">
                  <p className="text-sm text-gray-600 line-clamp-3 italic">{`\"${previewText}\"`}</p>
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-white/80 to-transparent" />
                </div>
              ) : (
                <div className="mb-4 h-24 rounded-xl border border-dashed theme-accent-border bg-white/70 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full theme-accent-light-bg flex items-center justify-center shrink-0">
                    <PenTool className="w-4 h-4 theme-accent-text" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Jurnal ini belum memiliki isi</p>
                    <p className="text-xs text-muted-foreground">Lanjutkan menulis untuk menyimpan refleksi harianmu.</p>
                  </div>
                </div>
              )}
            </div>

            <Button asChild variant="outline" className="w-full theme-accent-border theme-accent-text-dark group" style={{ borderColor: `var(--theme-accent-border)`, color: `var(--theme-accent-dark)` }}>
              <Link href={ROUTES.JOURNAL}>
                <PenTool className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {exclusivity.journalCta}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-white/50 rounded-xl border border-dashed theme-accent-border">
            <div className="w-12 h-12 theme-accent-light-bg rounded-full flex items-center justify-center mb-3">
              <PenTool className="w-6 h-6 theme-accent-text" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{exclusivity.journalEmptyTitle}</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-70">{exclusivity.journalEmptyDesc}</p>
            <Button asChild className="w-full text-white shadow-md theme-accent-bg theme-accent-bg-hover" style={{ backgroundColor: `var(--theme-accent)`, boxShadow: `0 4px 6px -1px var(--theme-accent-border-soft)` }}>
              <Link href={ROUTES.JOURNAL} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> {exclusivity.journalEmptyCta}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
