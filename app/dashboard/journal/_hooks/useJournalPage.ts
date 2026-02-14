"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useJournalStore } from "@/store/journalStore";
import { Journal } from "@/types";
import { toast } from "sonner";
import { moderationService } from "@/services/api";

export type ViewMode = "list" | "write" | "edit" | "detail" | "analytics" | "settings";

export function useJournalPage() {
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    // URL state management
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const updateUrlParam = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    // Read from URL
    const activeTab = (searchParams.get("tab") || "journals") as "journals" | "analytics" | "settings";
    const localSearchQuery = searchParams.get("search") || "";

    const setActiveTab = (tab: "journals" | "analytics" | "settings") => {
        updateUrlParam("tab", tab === "journals" ? null : tab);
    };

    const setLocalSearchQuery = (query: string) => {
        updateUrlParam("search", query || null);
    };

    useEffect(() => {
        if (user && user.has_accepted_ai_disclaimer === false) {
            setShowDisclaimer(true);
        }
    }, [user]);
    
    const handleAcceptDisclaimer = async () => {
        if(!token) return;
        try {
            await moderationService.acceptAIDisclaimer(token);
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

    return {
        // Auth/Loading
        authLoading,
        isAuthenticated,
        
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
        setShowDisclaimer,
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
    };
}
