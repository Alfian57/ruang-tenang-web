import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Flame, TrendingUp } from "lucide-react";
import { JournalAnalytics } from "@/types";

interface JournalStatsCardsProps {
    analytics: JournalAnalytics;
}

export function JournalStatsCards({ analytics }: JournalStatsCardsProps) {
    const stats = [
        { label: "Total jurnal", value: analytics.total_entries.toLocaleString(), detail: "catatan tersimpan", icon: FileText, tone: "text-theme-accent-dark bg-theme-accent-soft" },
        { label: "Bulan ini", value: analytics.entries_this_month.toLocaleString(), detail: "entri bulan berjalan", icon: Calendar, tone: "text-sky-700 bg-sky-50" },
        { label: "Streak menulis", value: analytics.writing_streak.toLocaleString(), detail: "hari konsisten", icon: Flame, tone: "text-amber-700 bg-amber-50" },
        { label: "Total kata", value: (analytics.total_word_count ?? 0).toLocaleString(), detail: "kata yang kamu tulis", icon: TrendingUp, tone: "text-violet-700 bg-violet-50" },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, detail, icon: Icon, tone }) => (
                <Card key={label} className="group theme-accent-border-soft relative overflow-hidden rounded-2xl border bg-[linear-gradient(145deg,white,var(--theme-accent-soft))] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="relative flex min-h-32 items-start justify-between gap-3 p-4 sm:p-5">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                            <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
                            <p className="mt-1 text-xs text-slate-500">{detail}</p>
                        </div>
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ring-black/[0.03] transition-transform group-hover:scale-105 ${tone}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
