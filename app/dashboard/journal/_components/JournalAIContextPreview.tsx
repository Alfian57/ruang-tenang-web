import { useState } from "react";
import { JournalAIContext } from "@/types";
import { Info, EyeOff, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoodAssetIcon } from "@/components/shared/mood";

interface JournalAIContextPreviewProps {
    context: JournalAIContext | null;
    isLoading?: boolean;
}

export function JournalAIContextPreview({
    context,
    isLoading = false,
}: JournalAIContextPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card className="theme-accent-border-soft rounded-2xl border bg-white shadow-sm">
                <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary animate-spin" />
                        <CardTitle className="text-lg">Memuat konteks...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    if (!context) return null;

    const entries = context.entries || [];

    return (
        <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-white shadow-sm">
            <CardHeader className="p-0 sm:p-0">
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2.5 p-3 text-left transition-colors hover:bg-theme-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent sm:px-4 sm:py-3"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                >
                    <span className="flex min-w-0 items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-theme-accent-soft text-theme-accent-dark">
                            <Brain className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="text-base font-semibold leading-tight text-slate-900">Yang dapat dibaca AI</span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-500">Jurnal yang kamu pilih untuk dibagikan</span>
                        </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {context.total_shared} dibagikan
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </span>
                </button>
            </CardHeader>
            {isExpanded && (
                <CardContent className="space-y-3 border-t border-slate-100 pt-4 sm:pt-5">
                    {entries.length === 0 ? (
                        <div className="flex flex-col items-center rounded-2xl bg-slate-50/80 px-4 py-7 text-center">
                            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                                <EyeOff className="h-5 w-5" />
                            </span>
                            <p className="text-sm font-medium text-slate-700">Belum ada jurnal yang dibagikan</p>
                            <p className="mt-1 text-xs text-slate-500">Jurnal privatmu tetap menjadi milikmu.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(145deg,white,var(--theme-accent-soft))] p-4 transition-shadow hover:shadow-sm"
                                >
                                    <div className="mb-2 flex min-w-0 items-center gap-2">
                                        {entry.mood_label && (
                                            <MoodAssetIcon moodLabel={entry.mood_label} size={20} className="h-5 w-5 object-contain" />
                                        )}
                                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{entry.title}</p>
                                        <Brain className="h-3.5 w-3.5 shrink-0 text-theme-accent-dark" aria-label="Dibagikan ke AI" />
                                    </div>
                                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                                        {entry.content_preview}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        <span className="rounded-full bg-white/80 px-2.5 py-1">
                                            {format(new Date(entry.created_at), "d MMM yyyy", { locale: id })}
                                        </span>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <span className="min-w-0 truncate">{entry.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
