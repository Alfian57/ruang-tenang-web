"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Clock3, ListChecks, PenTool, Plus, Sparkles } from "lucide-react";
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
  const hasPreview = previewText.trim().length > 0;

  const contentLength = previewSource
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

  const depthLabel = (() => {
    if (contentLength >= 280) return "Refleksi Mendalam";
    if (contentLength >= 120) return "Refleksi Menengah";
    if (contentLength > 0) return "Refleksi Singkat";
    return "Belum Ditulis";
  })();

  const emptyStatePrompts = [
    "Satu hal yang paling kamu rasakan hari ini.",
    "Apa pemicu utamanya dan bagaimana responsmu?",
    "Langkah kecil apa yang ingin kamu lakukan setelah ini?",
  ];

  const continueWritingPrompts = [
    "Lanjutkan dengan menceritakan momen paling menonjol hari ini.",
    "Tambahkan satu insight yang kamu pelajari dari perasaanmu.",
    "Tutup dengan aksi kecil yang realistis untuk besok.",
  ];

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
      <Card className="h-full border-none shadow-sm flex flex-col min-h-70">
        <CardHeader>
          <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border shadow-sm theme-accent-border-soft min-h-70" style={{ background: `linear-gradient(to bottom right, white, var(--theme-accent-soft))` }}>
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
          <div className="flex-1 flex flex-col gap-3">
            <div className="rounded-xl border theme-accent-border-soft bg-white/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {latestJournal.mood_emoji && (
                    <span className="text-2xl bg-white p-1.5 rounded-full shadow-sm shrink-0">{latestJournal.mood_emoji}</span>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{journalTitle}</h4>
                    <p className="text-xs text-muted-foreground">{relativeCreatedAt}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                  {depthLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
              <div className="rounded-lg border theme-accent-border-soft bg-white/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Karakter</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{contentLength > 0 ? contentLength : 0}</p>
              </div>
              <div className="rounded-lg border theme-accent-border-soft bg-white/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{hasPreview ? "Ada Cuplikan" : "Perlu Dilanjutkan"}</p>
              </div>
            </div>

            {hasPreview ? (
              <div className="flex-1 min-h-36 rounded-xl border theme-accent-border-soft bg-white/65 p-4 overflow-hidden relative">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cuplikan Terakhir</p>
                <p className="text-sm text-gray-600 line-clamp-6 italic mt-2">{`\"${previewText}\"`}</p>
                <div className="absolute bottom-0 left-0 w-full h-10 bg-linear-to-t from-white/90 to-transparent" />
              </div>
            ) : (
              <div className="flex-1 min-h-36 rounded-xl border border-dashed theme-accent-border bg-white/65 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide theme-accent-text">Kerangka Lanjutan</p>
                <ul className="mt-2 space-y-2">
                  {continueWritingPrompts.map((prompt) => (
                    <li key={prompt} className="flex items-start gap-2 text-xs text-gray-700">
                      <ListChecks className="w-3.5 h-3.5 mt-0.5 shrink-0 theme-accent-text" />
                      <span>{prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
              <Button asChild variant="outline" className="w-full theme-accent-border theme-accent-text-dark group" style={{ borderColor: `var(--theme-accent-border)`, color: `var(--theme-accent-dark)` }}>
                <Link href={ROUTES.JOURNAL}>
                  <PenTool className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {exclusivity.journalCta}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-center text-xs text-muted-foreground hover:text-(--theme-accent-hover)">
                <Link href={ROUTES.JOURNAL}>
                  Buka Arsip Jurnal
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3">
            <div className="rounded-xl border border-dashed theme-accent-border bg-white/55 p-4 text-center">
              <div className="w-12 h-12 theme-accent-light-bg rounded-full flex items-center justify-center mx-auto mb-3">
                <PenTool className="w-6 h-6 theme-accent-text" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{exclusivity.journalEmptyTitle}</h4>
              <p className="text-xs text-muted-foreground">{exclusivity.journalEmptyDesc}</p>
            </div>

            <div className="rounded-xl border theme-accent-border-soft bg-white/65 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide theme-accent-text">Mulai Dalam 3 Menit</p>
              <ul className="mt-2 space-y-2">
                {emptyStatePrompts.map((prompt) => (
                  <li key={prompt} className="flex items-start gap-2 text-xs text-gray-700">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 theme-accent-text" />
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
              <div className="rounded-lg border theme-accent-border-soft bg-white/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Durasi</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5 theme-accent-text" />
                  3 Menit
                </p>
              </div>
              <div className="rounded-lg border theme-accent-border-soft bg-white/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">1 refleksi hari ini</p>
              </div>
            </div>

            <Button asChild className="w-full text-white shadow-md theme-accent-bg theme-accent-bg-hover mt-auto" style={{ backgroundColor: `var(--theme-accent)`, boxShadow: `0 4px 6px -1px var(--theme-accent-border-soft)` }}>
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
