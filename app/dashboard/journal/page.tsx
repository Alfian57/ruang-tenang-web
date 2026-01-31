"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useJournalStore } from "@/stores/journalStore";
import { Journal } from "@/types";
import {
    JournalEditor,
    JournalList,
    JournalDetail,
    JournalPrivacySettings,
    JournalAIAccessLogs,
    JournalAIContextPreview,
    JournalAnalytics,
    JournalWeeklySummaryCard,
} from "@/components/journal";
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
import { toast } from "sonner";
import { AIDisclaimerModal } from "@/components/ui/ai-disclaimer-modal";
import { api } from "@/lib/api";

type ViewMode = "list" | "write" | "edit" | "detail" | "analytics" | "settings";

export default function JournalPage() {
    const router = useRouter();
    const { token, isAuthenticated, isLoading: authLoading, user } = useAuthStore();

    // Store state
    const {
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
        error,
        loadJournals,
        createJournal,
        updateJournal,
        deleteJournal,
        searchJournals,
        loadSettings,
        updateSettings,
        loadAnalytics,
        loadWeeklySummary,
        loadWritingPrompt,
        loadAIContext,
        loadAIAccessLogs,
        toggleAIShare,
        exportJournals,
        setActiveJournal,
        clearError,
        searchResults,
        isSearching,
    } = useJournalStore();

    // Local state
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<"journals" | "analytics" | "settings">("journals");
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    useEffect(() => {
        if (user && user.has_accepted_ai_disclaimer === false) {
            setShowDisclaimer(true);
        }
    }, [user]);
    
    const handleAcceptDisclaimer = async () => {
        if(!token) return;
        try {
            await api.acceptAIDisclaimer(token);
            setShowDisclaimer(false);
        } catch (error) {
            console.error("Failed to accept disclaimer:", error);
        }
    };

    // Auth check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    // Initial data load
    useEffect(() => {
        if (token) {
            loadJournals(token);
            loadSettings(token);
        }
    }, [token, loadJournals, loadSettings]);

    // Load analytics and settings data when tab changes
    useEffect(() => {
        if (!token) return;
        if (activeTab === "analytics") {
            loadAnalytics(token);
            loadWeeklySummary(token);
        }
        if (activeTab === "settings") {
            loadAIContext(token);
            loadAIAccessLogs(token);
        }
    }, [activeTab, token, loadAnalytics, loadWeeklySummary, loadAIContext, loadAIAccessLogs]);

    // Error toast
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (token && localSearchQuery.trim()) {
                searchJournals(token, localSearchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearchQuery, token, searchJournals]);

    // Handlers
    const handleCreateJournal = async (data: {
        title: string;
        content: string;
        mood_id?: number;
        tags: string[];
        is_private: boolean;
        share_with_ai: boolean;
    }) => {
        if (!token) return;
        const newJournal = await createJournal(token, data);
        if (newJournal) {
            toast.success("Jurnal berhasil disimpan!");
            setViewMode("detail");
        }
    };

    const handleUpdateJournal = async (data: {
        title: string;
        content: string;
        mood_id?: number;
        tags: string[];
        is_private: boolean;
        share_with_ai: boolean;
    }) => {
        if (!token || !activeJournal) return;
        await updateJournal(token, activeJournal.id, data);
        toast.success("Jurnal berhasil diperbarui!");
        setViewMode("detail");
    };

    const handleDeleteJournal = async () => {
        if (!token || !journalToDelete) return;
        await deleteJournal(token, journalToDelete.id);
        setShowDeleteModal(false);
        setJournalToDelete(null);
        setViewMode("list");
        toast.success("Jurnal berhasil dihapus");
    };

    const handleSelectJournal = (journal: Journal) => {
        setActiveJournal(journal);
        setViewMode("detail");
    };

    const handleEditJournal = (journal: Journal) => {
        setActiveJournal(journal);
        setViewMode("edit");
    };

    const handleDeleteClick = (journal: Journal) => {
        setJournalToDelete(journal);
        setShowDeleteModal(true);
    };

    const handleToggleAIShare = async (journal: Journal) => {
        if (!token) return;
        await toggleAIShare(token, journal.id);
        toast.success(
            journal.share_with_ai
                ? "Jurnal disembunyikan dari AI"
                : "Jurnal dibagikan ke AI"
        );
    };

    const handleUpdateSettings = async (data: Parameters<typeof updateSettings>[1]) => {
        if (!token) return;
        await updateSettings(token, data);
        toast.success("Pengaturan berhasil disimpan");
    };

    const handleGeneratePrompt = async () => {
        if (!token) return;
        await loadWritingPrompt(token);
        toast.success("Ide menulis berhasil dibuat!");
    };

    const handleExport = async (format: "txt" | "html") => {
        if (!token) return;
        const result = await exportJournals(token, format);
        if (result) {
            // Create download link
            const blob = new Blob([result.content], { type: result.content_type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Jurnal berhasil diekspor sebagai ${format.toUpperCase()}`);
        }
    };

    const handleLoadMore = () => {
        if (token && currentPage < totalPages) {
            loadJournals(token, currentPage + 1);
        }
    };

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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari jurnal..."
                                    value={localSearchQuery}
                                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                                    className="pl-10"
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
