"use client";

import { Journal } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalListItem } from "./JournalListItem";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

interface JournalListProps {
    journals: Journal[];
    activeJournalId?: number;
    onDelete: (journal: Journal) => void;
    onToggleAIShare: (journal: Journal) => void;
    isLoading?: boolean;
}

function JournalListSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4 bg-gray-200" />
                            <Skeleton className="h-4 w-full bg-gray-200" />
                            <Skeleton className="h-4 w-2/3 bg-gray-200" />
                        </div>
                        <Skeleton className="h-8 w-8 bg-gray-200 ml-4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function JournalList({
    journals,
    activeJournalId,
    onDelete,
    onToggleAIShare,
    isLoading = false,
}: JournalListProps) {
    if (isLoading) {
        return <JournalListSkeleton />;
    }

    if (journals.length === 0) {
        return (
            <DashboardMascotEmpty
                image="/images/landing/mascot/journal.webp"
                title="Belum ada jurnal di sini"
                description="Setiap pikiran layak mendapat ruang. Mulailah dengan satu catatan kecil tentang harimu."
            />
        );
    }

    return (
        <div className="space-y-4">
            {journals.map((journal) => (
                <JournalListItem
                    key={journal.id}
                    journal={journal}
                    isActive={journal.id === activeJournalId}
                    onDelete={() => onDelete(journal)}
                    onToggleAIShare={() => onToggleAIShare(journal)}
                />
            ))}
        </div>
    );
}
