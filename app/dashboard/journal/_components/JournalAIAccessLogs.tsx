import { useState } from "react";
import { JournalAIAccessLog } from "@/types";
import { History, ChevronDown, ChevronUp, Clock, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { parseApiDate } from "@/utils/date";
import { id } from "date-fns/locale";

interface JournalAIAccessLogsProps {
    logs: JournalAIAccessLog[];
    isLoading?: boolean;
}

export function JournalAIAccessLogs({ logs = [], isLoading = false }: JournalAIAccessLogsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card className="theme-accent-border-soft rounded-2xl border bg-white shadow-sm">
                <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary animate-spin" />
                        <CardTitle className="text-lg">Memuat log akses...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

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
                            <History className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="text-base font-semibold leading-tight text-slate-900">Riwayat akses AI</span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-500">Lihat kapan jurnal digunakan sebagai konteks</span>
                        </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{logs.length} akses</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </span>
                </button>
            </CardHeader>
            {isExpanded && (
                <CardContent className="space-y-3 border-t border-slate-100 pt-4 sm:pt-5">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center rounded-2xl bg-slate-50/80 px-4 py-7 text-center">
                            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                                <History className="h-5 w-5" />
                            </span>
                            <p className="text-sm font-medium text-slate-700">Belum ada aktivitas akses</p>
                            <p className="mt-1 text-xs text-slate-500">Riwayat penggunaan konteks AI akan muncul di sini.</p>
                        </div>
                    ) : (
                        <div className="max-h-80 space-y-2 overflow-auto pr-1">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-theme-accent-dark shadow-sm">
                                            <Brain className="h-4 w-4" />
                                        </span>
                                        <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-800">
                                            {log.journal?.title || `Jurnal #${log.journal_id}`}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Konteks: {log.context_type}
                                        </p>
                                        </div>
                                    </div>
                                    <p className="flex shrink-0 items-center gap-1.5 pl-12 text-xs text-slate-500 sm:pl-0">
                                        <Clock className="h-3.5 w-3.5" />
                                        {(() => {
                
                                            // Clamp future dates to now to avoid "in about X hours"
                                            // The parseApiDate handles the Z suffix correctly
                                            return formatDistanceToNow(parseApiDate(log.accessed_at), {
                                                addSuffix: true,
                                                locale: id,
                                            });
                                        })()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
