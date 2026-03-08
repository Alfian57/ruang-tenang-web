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
    <Card className="h-full flex flex-col border shadow-sm theme-accent-border-soft" style={{ background: `linear-gradient(to bottom right, white, var(--theme-accent-soft))` }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <Book className="w-5 h-5 theme-accent-text" />
          Jurnal Terakhir
        </CardTitle>
        <Link href={ROUTES.JOURNAL}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" style={{ ["--tw-text-opacity" as string]: 1 }} onMouseEnter={e => e.currentTarget.style.color = `var(--theme-accent-hover)`} onMouseLeave={e => e.currentTarget.style.color = ''}>
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
                    {(() => {
                      const date = new Date(latestJournal.created_at);
                      const now = new Date();
                      const safeDate = date > now ? now : date;
                      return formatDistanceToNow(safeDate, { addSuffix: true, locale: id });
                    })()}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-white/60 rounded-xl border theme-accent-border-soft mb-4 h-24 overflow-hidden relative">
                <p className="text-sm text-gray-600 line-clamp-3 italic">
                  {(() => {
                    const previewSource = latestJournal.preview || latestJournal.content || "";
                    const previewText = getHtmlExcerpt(previewSource, 150);
                    return previewText
                      ? `\"${previewText}\"`
                      : "Belum ada isi jurnal.";
                  })()}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-white/80 to-transparent" />
              </div>
            </div>

            <Link href={ROUTES.JOURNAL}>
              <Button variant="outline" className="w-full theme-accent-border theme-accent-text-dark group" style={{ borderColor: `var(--theme-accent-border)`, color: `var(--theme-accent-dark)` }}>
                <PenTool className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {exclusivity.journalCta}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-white/50 rounded-xl border border-dashed theme-accent-border">
            <div className="w-12 h-12 theme-accent-light-bg rounded-full flex items-center justify-center mb-3">
              <PenTool className="w-6 h-6 theme-accent-text" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{exclusivity.journalEmptyTitle}</h4>
            <p className="text-xs text-muted-foreground mb-4">{exclusivity.journalEmptyDesc}</p>
            <Link href={ROUTES.JOURNAL} className="w-full">
              <Button className="w-full text-white shadow-md theme-accent-bg theme-accent-bg-hover" style={{ backgroundColor: `var(--theme-accent)`, boxShadow: `0 4px 6px -1px var(--theme-accent-border-soft)` }}>
                <Plus className="w-4 h-4 mr-2" /> {exclusivity.journalEmptyCta}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
