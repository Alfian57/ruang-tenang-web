"use client";

import { JournalAnalytics as JournalAnalyticsType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { JournalStatsCards } from "./JournalStatsCards";
import { JournalMoodChart } from "./JournalMoodChart";
import { JournalEntryChart } from "./JournalEntryChart";
import { JournalTagsCard } from "./JournalTagsCard";
import { JournalWeeklySummary } from "./JournalWeeklySummary";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

// Re-export specific components if needed by other files that were importing them from here
export { JournalWeeklySummary };

interface JournalAnalyticsProps {
    analytics: JournalAnalyticsType | null;
    isLoading?: boolean;
}

export function JournalAnalytics({ analytics, isLoading = false }: JournalAnalyticsProps) {
    if (isLoading) {
        return (
            <div className="space-y-5">
                <div className="animate-pulse space-y-2">
                    <div className="h-3 w-28 rounded bg-slate-100" />
                    <div className="h-7 w-64 max-w-full rounded bg-slate-100" />
                    <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="theme-accent-border-soft animate-pulse rounded-2xl border bg-white">
                            <CardContent className="space-y-3 p-5">
                                <div className="h-3 w-24 rounded bg-slate-100" />
                                <div className="h-8 w-16 rounded bg-slate-100" />
                                <div className="h-3 w-32 rounded bg-slate-50" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="theme-accent-border-soft h-72 animate-pulse rounded-2xl border bg-white" />
                    ))}
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <DashboardMascotEmpty
                image="/images/landing/mascot/journal.webp"
                title="Perjalananmu baru dimulai"
                description="Tulis beberapa jurnal, lalu kembali ke sini untuk melihat perkembangan, pola mood, dan kebiasaan menulismu."
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl border border-theme-accent-border-soft bg-[linear-gradient(120deg,var(--theme-accent-soft),white_72%)] p-4 sm:p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-theme-accent-dark shadow-sm ring-1 ring-theme-accent-border/60">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-theme-accent-dark">Perkembanganmu</p>
                    <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Setiap catatan adalah kemajuan</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">Lihat ritme menulis dan suasana hati yang terekam dari jurnal-jurnalmu.</p>
                </div>
            </div>

            <JournalStatsCards analytics={analytics} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <JournalMoodChart analytics={analytics} />
                <JournalEntryChart analytics={analytics} />
            </div>

            <JournalTagsCard analytics={analytics} />
        </div>
    );
}
