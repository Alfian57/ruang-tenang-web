"use client";

import { JournalAnalytics as JournalAnalyticsType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { JournalStatsCards } from "./JournalStatsCards";
import { JournalMoodChart } from "./JournalMoodChart";
import { JournalEntryChart } from "./JournalEntryChart";
import { JournalTagsCard } from "./JournalTagsCard";
import { JournalWeeklySummary } from "./JournalWeeklySummary";

// Re-export specific components if needed by other files that were importing them from here
export { JournalWeeklySummary };

interface JournalAnalyticsProps {
    analytics: JournalAnalyticsType | null;
    isLoading?: boolean;
}

export function JournalAnalytics({ analytics, isLoading = false }: JournalAnalyticsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                            <div className="h-8 w-16 bg-gray-200 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-8">
                <BarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada data analitik. Tulis jurnalmu untuk mulai melacak perkembanganmu!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <JournalStatsCards analytics={analytics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <JournalMoodChart analytics={analytics} />
                <JournalEntryChart analytics={analytics} />
            </div>

            <JournalTagsCard analytics={analytics} />
        </div>
    );
}
