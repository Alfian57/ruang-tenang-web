"use client";

import { useModerationQueue } from "./_hooks/useModerationQueue";
import { ModerationQueueHeader } from "./_components/ModerationQueueHeader";
import { ModerationQueueList } from "./_components/ModerationQueueList";

export default function ModerationQueuePage() {
    const {
        items,
        isLoading,
        totalPages,
        page,
        focusId,
        statusFilter,
        searchQuery,
        setPage,
        setStatusFilter,
        setSearchQuery,
        loadQueue,
    } = useModerationQueue();

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <ModerationQueueHeader
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
                onRefresh={loadQueue}
            />

            <ModerationQueueList
                items={items}
                isLoading={isLoading}
                searchQuery={searchQuery}
                totalPages={totalPages}
                page={page}
                focusId={focusId}
                setPage={setPage}
            />
        </div>
    );
}
