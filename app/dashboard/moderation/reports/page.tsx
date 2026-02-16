"use client";

import { useModerationReports } from "./_hooks/useModerationReports";
import { ModerationReportsHeader } from "./_components/ModerationReportsHeader";
import { ModerationReportsList } from "./_components/ModerationReportsList";

export default function ModerationReportsPage() {
    const {
        statusFilter,
        typeFilter,
        searchQuery,
        page,
        reports,
        isLoading,
        totalPages,
        setStatusFilter,
        setTypeFilter,
        setSearchQuery,
        setPage,
        loadReports,
    } = useModerationReports();

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <ModerationReportsHeader
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
                onRefresh={loadReports}
            />

            <ModerationReportsList
                reports={reports}
                isLoading={isLoading}
                searchQuery={searchQuery}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
            />
        </div>
    );
}
