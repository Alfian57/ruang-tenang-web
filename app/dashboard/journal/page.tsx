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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { cn } from "@/utils";
import { useJournalPage } from "./_hooks/useJournalPage";
import Link from "next/link";

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
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            📔 Jurnal Pribadi
                        </h1>
                        <p className="text-sm text-gray-500">
                            Tulis, refleksi, dan pertumbuhan pribadimu
                        </p>
                    </div>
                </div>

                <Button asChild>
                    <Link href="/dashboard/journal/create">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Tulis Jurnal
                    </Link>
                </Button>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="mb-6">
                    <TabsTrigger value="journals" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Jurnal
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" />
                        Analitik
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Pengaturan
                    </TabsTrigger>
                </TabsList>

                {/* Journals Tab */}
                <TabsContent value="journals" className="space-y-6">
                    {/* Search & Filter */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(showFilters && "bg-primary/10")}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={isExporting}>
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
                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <h3 className="font-medium mb-3 text-gray-900">Statistik Cepat</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Jurnal</span>
                                        <span className="font-medium text-gray-900">{totalJournals}</span>
                                    </div>
                                    {settings && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">AI Akses</span>
                                                <span
                                                    className={cn(
                                                        "font-medium",
                                                        settings.allow_ai_access
                                                            ? "text-green-600"
                                                            : "text-gray-500"
                                                    )}
                                                >
                                                    {settings.allow_ai_access ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </div>
                                        </>
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
                <TabsContent value="settings" className="space-y-6">
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
                isLoading={isSaving}
            />
        </div>
    );
}
