"use client";

import {
    JournalList,
    JournalPrivacySettings,
    JournalAIAccessLogs,
    JournalAIContextPreview,
    JournalAnalytics,
    JournalWeeklySummary,
    JournalFilters,
} from "./_components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenuTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    PlusCircle,
    Search,
    BookOpen,
    BarChart2,
    Settings,
    Download,
    Filter,
    X,
    FileText,
    Brain,
    ShieldCheck,
} from "lucide-react";
import { cn } from "@/utils";
import { useJournalPage } from "./_hooks/useJournalPage";
import Link from "next/link";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";
import { DashboardHubTabList, type DashboardHubTab } from "@/components/shared/dashboard/DashboardHubTabs";

const JOURNAL_TABS: readonly DashboardHubTab[] = [
    { value: "journals", label: "Jurnal Saya", icon: BookOpen },
    { value: "analytics", label: "Analitik", icon: BarChart2 },
    { value: "settings", label: "Privasi & Pengaturan", icon: Settings },
];

export default function JournalPage() {
    const {
        // Auth/Loading
        authLoading,

        // State
        showFilters,
        activeTab,
        localSearchQuery,

        // Store Data
        journals,
        totalJournals,
        currentPage,
        totalPages,
        settings,
        analytics,
        weeklySummary,
        aiContext,
        aiAccessLogs,
        isLoading,
        isSaving,
        isDeletingJournal,
        isExporting,
        searchResults,
        isSearching,

        // Actions
        setShowFilters,
        setActiveTab,
        setLocalSearchQuery,

        // Handlers
        handleUpdateSettings,
        handleExport,
        handleLoadMore,
        handleToggleAIShare,
        handleDeleteClick,
        handleDeleteJournal,
        showDeleteModal,
        setShowDeleteModal,
        journalToDelete,
    } = useJournalPage();

    const isJournalBlocked = Boolean(settings?.is_blocked);

    // Show loading state
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    // Main layout
    return (
        <div className="min-w-0 pb-8">
            <DashboardMascotHero
                eyebrow="Ruang refleksi"
                title="Jurnal Pribadi"
                description="Ruang tenang untuk menulis, memahami perasaan, dan merayakan langkah kecilmu."
                image="/images/landing/mascot/journal.webp"
                imageAlt="Bulan Pulih membawa buku dan pensil untuk menemani journaling"
            />

            {isJournalBlocked && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                    Akses fitur jurnal kamu sedang diblokir oleh admin. Kamu tidak bisa membuat atau mengubah jurnal sampai blokir dibuka.
                </div>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <div data-user-tour="journal-actions" className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
                    <DashboardHubTabList
                        tabs={JOURNAL_TABS}
                        className="mb-0 w-full overflow-x-auto sm:w-fit"
                    />
                    <Button asChild={!isJournalBlocked} disabled={isJournalBlocked} className="shrink-0">
                        {isJournalBlocked ? (
                            <span>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Akses Jurnal Diblokir
                            </span>
                        ) : (
                            <Link href="/dashboard/journal/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tulis Jurnal
                            </Link>
                        )}
                    </Button>
                </div>

                {/* Journals Tab */}
                <TabsContent value="journals" className="space-y-6">
                    {/* Search & Filter */}
                    <div className="theme-accent-border-soft flex flex-col gap-3 rounded-2xl border bg-white/85 p-3 shadow-sm sm:flex-row sm:items-center">
                        <div className="relative min-w-0 flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                            <Input
                                placeholder="Cari jurnal..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                                className="pl-10 bg-white"
                            />
                            {localSearchQuery && (
                                <button
                                    onClick={() => setLocalSearchQuery("")}
                                    aria-label="Hapus pencarian"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn("shrink-0", showFilters && "bg-primary/10")}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={isExporting} className="shrink-0">
                                    <Download className="w-4 h-4 mr-2" />
                                    {isExporting ? "Mengekspor..." : "Ekspor"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExport("txt")}>
                                    Ekspor sebagai TXT
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                                    Ekspor sebagai PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <JournalFilters />
                    )}

                    {/* Journal List */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* List */}
                        <div className="lg:col-span-2">
                            <JournalList
                                journals={localSearchQuery ? searchResults : journals}
                                activeJournalId={undefined}
                                onToggleAIShare={handleToggleAIShare} // Still needed for list actions if any
                                onDelete={handleDeleteClick}
                                isLoading={isLoading || isSearching}
                            />

                            {/* Pagination */}
                            {!localSearchQuery && totalPages > 1 && currentPage < totalPages && (
                                <div className="mt-4 text-center">
                                    <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                                        Muat lebih banyak
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Weekly Summary */}
                        <div className="space-y-6">
                            <JournalWeeklySummary
                                summary={weeklySummary}
                                isLoading={isLoading}
                            />

                            {/* Quick Stats */}
                            <div className="theme-accent-border-soft relative overflow-hidden rounded-2xl border bg-[linear-gradient(145deg,white,var(--theme-accent-soft))] p-4 shadow-sm sm:p-5">
                                <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-theme-accent-light/60 blur-3xl" />
                                <div className="relative">
                                    <div className="flex items-center gap-3">
                                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-theme-accent-dark shadow-sm ring-1 ring-theme-accent-border/60">
                                            <Brain className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900">Statistik cepat</h3>
                                            <p className="text-xs text-slate-500">Jejak refleksimu sejauh ini</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-white/90 bg-white/85 p-4 shadow-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                                                <FileText className="h-4 w-4 shrink-0 text-theme-accent-dark" />
                                                <span>Total jurnal</span>
                                            </div>
                                            <span className="text-2xl font-bold tracking-tight text-slate-900">
                                                {totalJournals.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">Catatan yang tersimpan di ruang pribadimu</p>
                                    </div>

                                    {settings && (
                                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/90 bg-white/70 px-3 py-3">
                                            <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                                                <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500" />
                                                Akses AI
                                            </span>
                                            <span className={cn(
                                                "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                                                settings.allow_ai_access
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-600"
                                            )}>
                                                {settings.allow_ai_access ? "Diizinkan" : "Nonaktif"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                    <JournalAnalytics analytics={analytics} isLoading={isLoading} />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-3">
                    <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 sm:p-4">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-theme-accent-soft text-theme-accent-dark">
                            <Settings className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-theme-accent-dark">Ruang yang aman</p>
                            <h2 className="mt-0.5 text-base font-bold tracking-tight text-slate-900 sm:text-lg">Privasi dan kendali jurnal</h2>
                            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">Atur bagaimana AI menggunakan catatanmu, lalu tinjau konteks dan riwayat akses kapan saja.</p>
                        </div>
                    </div>
                    {settings && (
                        <JournalPrivacySettings
                            settings={settings}
                            onUpdate={handleUpdateSettings}
                            isSaving={isSaving}
                        />
                    )}
                    <JournalAIContextPreview context={aiContext} isLoading={isLoading} />
                    <JournalAIAccessLogs logs={aiAccessLogs} isLoading={isLoading} />
                </TabsContent>
            </Tabs>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteJournal}
                title="Hapus Jurnal"
                description={`Apakah Anda yakin ingin menghapus jurnal "${journalToDelete?.title || 'ini'}"? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={isDeletingJournal}
            />
        </div>
    );
}
