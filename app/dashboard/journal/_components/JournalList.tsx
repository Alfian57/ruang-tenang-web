"use client";

import { Journal } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalListItem } from "./JournalListItem";

interface JournalListProps {
    journals: Journal[];
    activeJournalId?: number;
    onDelete: (journal: Journal) => void;
    onToggleAIShare: (journal: Journal) => void;
    isLoading?: boolean;
}

function JournalListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="p-4 bg-white rounded-lg border border-gray-200"
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
            <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada jurnal
                </h3>
                <p className="text-sm text-gray-600">
                    Mulai menulis jurnal pertamamu hari ini!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
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
