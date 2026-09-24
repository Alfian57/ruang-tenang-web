import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Brain, CalendarDays, Heart, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { parseApiDate } from "@/utils/date";
import { id } from "date-fns/locale";
import { JournalWeeklySummary as JournalWeeklySummaryType } from "@/types";

interface JournalWeeklySummaryProps {
    summary: JournalWeeklySummaryType | null;
    isLoading?: boolean;
}

const moodLabels: Record<string, string> = {
    happy: "Bahagia",
    neutral: "Netral",
    angry: "Marah",
    disappointed: "Kecewa",
    sad: "Sedih",
    crying: "Menangis",
};

export function JournalWeeklySummary({
    summary,
    isLoading = false,
}: JournalWeeklySummaryProps) {
    if (isLoading) {
        return (
            <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-white shadow-sm animate-pulse">
                <CardHeader className="space-y-3">
                    <div className="h-4 w-28 rounded-full bg-slate-100" />
                    <div className="h-6 w-48 rounded bg-slate-100" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {[1, 2, 3].map((item) => <div key={item} className="h-16 rounded-xl bg-slate-50" />)}
                    </div>
                    <div className="space-y-2 rounded-xl bg-slate-50 p-4">
                        <div className="h-4 w-full rounded bg-slate-100" />
                        <div className="h-4 w-3/4 rounded bg-slate-100" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!summary) {
        return (
            <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-[linear-gradient(145deg,white,var(--theme-accent-soft))] shadow-sm">
                <CardContent className="flex flex-col items-center px-5 pt-10 pb-8 text-center sm:px-7 sm:pt-12 sm:pb-10">
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-theme-accent-dark shadow-sm ring-1 ring-theme-accent-border/60">
                        <Brain className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Ringkasan mingguan menantimu</p>
                    <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
                        Tulis beberapa jurnal minggu ini untuk melihat pola dan refleksi personalmu.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="theme-accent-border-soft relative overflow-hidden rounded-2xl border bg-[linear-gradient(145deg,white,var(--theme-accent-soft))] shadow-sm">
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-theme-accent-light/60 blur-3xl" />
            <div className="relative h-1 bg-gradient-to-r from-theme-accent via-theme-accent-light to-transparent" />
            <CardHeader className="relative space-y-2 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-accent-border-soft bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-accent-dark">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Refleksi pekan ini
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                        {format(parseApiDate(summary.week_start), "d MMM", { locale: id })} -{" "}
                        {format(parseApiDate(summary.week_end), "d MMM yyyy", { locale: id })}
                    </span>
                </div>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <Brain className="h-5 w-5 text-theme-accent-dark" />
                    Ringkasan Mingguanmu
                </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="min-w-0 rounded-xl border border-white/80 bg-white/85 p-3 shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <FileText className="h-3.5 w-3.5 text-theme-accent-dark" /> Jurnal
                        </div>
                        <p className="mt-1 text-lg font-bold leading-none text-slate-900">{summary.entry_count}</p>
                    </div>
                    <div className="min-w-0 rounded-xl border border-white/80 bg-white/85 p-3 shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <TrendingUp className="h-3.5 w-3.5 text-sky-600" /> Kata ditulis
                        </div>
                        <p className="mt-1 text-lg font-bold leading-none text-slate-900">{(summary.total_words ?? 0).toLocaleString()}</p>
                    </div>
                    {summary.dominant_mood && (
                        <div className="col-span-2 min-w-0 rounded-xl border border-white/80 bg-white/85 p-3 shadow-sm sm:col-span-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Heart className="h-3.5 w-3.5 text-rose-500" /> Mood dominan
                            </div>
                            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                {moodLabels[summary.dominant_mood] || summary.dominant_mood}
                            </p>
                        </div>
                    )}
                </div>

                {/* AI Summary */}
                <div className="rounded-xl border border-theme-accent-border-soft bg-white/90 p-4 shadow-sm">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-theme-accent-dark">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Benang merah pekan ini
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {summary.summary}
                    </p>
                </div>

                {/* Key Themes */}
                {summary.key_themes && summary.key_themes.length > 0 && (
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tema yang muncul</p>
                        <div className="flex flex-wrap gap-2">
                            {summary.key_themes.map((theme, i) => (
                                <span
                                    key={i}
                                    className="rounded-full border border-theme-accent-border-soft bg-white/80 px-3 py-1.5 text-xs font-medium text-theme-accent-dark"
                                >
                                    {theme}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {summary.recommendations && summary.recommendations.length > 0 && (
                    <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Langkah lembut berikutnya
                        </p>
                        <ul className="space-y-2">
                            {summary.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 rounded-xl border border-white/80 bg-white/70 p-3 text-sm leading-relaxed text-slate-600">
                                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-theme-accent-soft text-[11px] font-semibold text-theme-accent-dark">{i + 1}</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
