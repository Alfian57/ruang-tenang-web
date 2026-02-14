"use client";

import {
    JournalEditor,
    JournalList,
    JournalDetail,
    JournalPrivacySettings,
    JournalAIAccessLogs,
    JournalAIContextPreview,
    JournalAnalytics,
    JournalWeeklySummaryCard,
} from "./_components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    PlusCircle,
    Search,
    BookOpen,
    BarChart2,
    Settings,
    Download,
    Filter,
    X,
    ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIDisclaimerModal } from "@/components/ui/ai-disclaimer-modal";
import { useJournalPage } from "./_hooks/useJournalPage";

export default function JournalPage() {
    const {
        // Auth/Loading
        authLoading,
        
        // State
        viewMode,
        showDeleteModal,
        journalToDelete,
        showFilters,
        showDisclaimer,
        activeTab,
        localSearchQuery,
        
        // Store Data
        journals,
        activeJournal,
        totalJournals,
        currentPage,
        totalPages,
        settings,
        analytics,
        weeklySummary,
        weeklyPrompt,
        aiContext,
        aiAccessLogs,
        isLoading,
        isSaving,
        isExporting,
        searchResults,
        isSearching,

        // Actions
        setViewMode,
        setShowDeleteModal,
        setJournalToDelete,
        setShowFilters,
        setActiveTab,
        setLocalSearchQuery,
        setActiveJournal,
        
        // Handlers
        handleAcceptDisclaimer,
        handleCreateJournal,
        handleUpdateJournal,
        handleDeleteJournal,
        handleSelectJournal,
        handleEditJournal,
        handleDeleteClick,
        handleToggleAIShare,
        handleUpdateSettings,
        handleGeneratePrompt,
        handleExport,
        handleLoadMore,
    } = useJournalPage();

    // Show loading state
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    // Render based on view mode
    const renderContent = () => {
        switch (viewMode) {
            case "write":
                return (
                    <JournalEditor
                        onSave={handleCreateJournal}
                        onCancel={() => setViewMode("list")}
                        isSaving={isSaving}
                        defaultShareWithAI={settings?.default_share_with_ai}
                        onGeneratePrompt={handleGeneratePrompt}
                        writingPrompt={weeklyPrompt?.prompt}
                    />
                );

            case "edit":
                return activeJournal ? (
                    <JournalEditor
                        initialTitle={activeJournal.title}
                        initialContent={activeJournal.content}
                        initialMoodId={activeJournal.mood_id}
                        initialTags={activeJournal.tags}
                        initialIsPrivate={activeJournal.is_private}
                        initialShareWithAI={activeJournal.share_with_ai}
                        onSave={handleUpdateJournal}
                        onCancel={() => setViewMode("detail")}
                        isSaving={isSaving}
                        defaultShareWithAI={settings?.default_share_with_ai}
                    />
                ) : null;

            case "detail":
                return activeJournal ? (
                    <JournalDetail
                        journal={activeJournal}
                        onBack={() => {
                            setActiveJournal(null);
                            setViewMode("list");
                        }}
                        onEdit={() => setViewMode("edit")}
                        onDelete={() => handleDeleteClick(activeJournal)}
                        onToggleAIShare={() => handleToggleAIShare(activeJournal)}
                    />
                ) : null;

            default:
                return null;
        }
    };

    // Main layout
    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {viewMode !== "list" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setActiveJournal(null);
                                setViewMode("list");
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            📔 Jurnal Pribadi
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tulis, refleksi, dan pertumbuhan pribadimu
                        </p>
                    </div>
                </div>

                {viewMode === "list" && (
                    <Button onClick={() => setViewMode("write")}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Tulis Jurnal
                    </Button>
                )}
            </div>

            {/* Main Content */}
            {viewMode === "list" ? (
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
                            <Button variant="outline" onClick={() => handleExport("txt")} disabled={isExporting}>
                                <Download className="w-4 h-4 mr-2" />
                                {isExporting ? "Mengekspor..." : "Ekspor"}
                            </Button>
                        </div>

                        {/* Journal List */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* List */}
                            <div className="lg:col-span-2">
                                <JournalList
                                    journals={localSearchQuery ? searchResults : journals}
                                    activeJournalId={activeJournal?.id}
                                    onSelect={handleSelectJournal}
                                    onEdit={handleEditJournal}
                                    onDelete={handleDeleteClick}
                                    onToggleAIShare={handleToggleAIShare}
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
                                <JournalWeeklySummaryCard
                                    summary={weeklySummary}
                                    isLoading={isLoading}
                                />

                                {/* Quick Stats */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                    <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Statistik Cepat</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Total Jurnal</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{totalJournals}</span>
                                        </div>
                                        {settings && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">AI Akses</span>
                                                    <span
                                                        className={cn(
                                                            "font-medium",
                                                            settings.allow_ai_access
                                                                ? "text-green-600 dark:text-green-400"
                                                                : "text-gray-500 dark:text-gray-500"
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
            ) : (
                <div className="max-w-4xl mx-auto">{renderContent()}</div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setJournalToDelete(null);
                }}
                onConfirm={handleDeleteJournal}
                title="Hapus Jurnal"
                description={`Apakah kamu yakin ingin menghapus jurnal "${journalToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={isLoading}
            />
            {/* AI Disclaimer Modal */}
            <AIDisclaimerModal
                isOpen={showDisclaimer}
                onAccept={handleAcceptDisclaimer}
            />
        </div>
    );
}
