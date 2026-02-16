"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useJournalStore } from "@/store/journalStore";
import { Journal } from "@/types";
import { toast } from "sonner";
import { moderationService } from "@/services/api";
import { useDebounce } from "@/hooks/use-debounce";



export function useJournalPage() {
    const router = useRouter();
    const { token, isAuthenticated, isLoading: authLoading, user } = useAuthStore();

    // Store state
    const {
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
        error,
        loadJournals,
        
        deleteJournal,
        searchJournals,
        loadSettings,
        updateSettings,
        loadAnalytics,
        loadWeeklySummary,
        loadAIContext,
        loadAIAccessLogs,
        toggleAIShare,
        exportJournals,
        clearError,
        searchResults,
        isSearching,
    } = useJournalStore();

    // URL state management
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const updateUrlParam = useCallback((params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    // Derived state from URL

    // Derived state from URL
    const activeTab = (searchParams.get("tab") || "journals") as "journals" | "analytics" | "settings";
    const urlSearchQuery = searchParams.get("search") || "";

    // Local state for search input
    const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Sync state with URL when URL changes (e.g. navigation)
    useEffect(() => {
        setSearchTerm(urlSearchQuery);
    }, [urlSearchQuery]);

    // Update URL when debounced value changes
    useEffect(() => {
        if (debouncedSearch !== urlSearchQuery) {
            updateUrlParam({ search: debouncedSearch || null });
        }
    }, [debouncedSearch, updateUrlParam, urlSearchQuery]);

    // Filter state from URL
    const filterMoodId = searchParams.get("mood") ? parseInt(searchParams.get("mood")!) : null;
    const filterStartDate = searchParams.get("start_date");
    const filterEndDate = searchParams.get("end_date");
    const filterTags = useMemo(() => {
        return searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];
    }, [searchParams]);

    // Local state (UI only)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const setActiveTab = (tab: "journals" | "analytics" | "settings") => {
        updateUrlParam({ tab: tab === "journals" ? null : tab });
    };

    const setLocalSearchQuery = (query: string) => {
        setSearchTerm(query);
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

    // Initial data load & Filter change
    useEffect(() => {
        if (token) {
            loadJournals(token, 1, 10, {
                moodId: filterMoodId,
                startDate: filterStartDate,
                endDate: filterEndDate,
                tags: filterTags
            });
            loadSettings(token);
        }
    }, [token, loadJournals, loadSettings, filterMoodId, filterStartDate, filterEndDate, filterTags]); // Add filter dependencies

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

    // Search trigger (listen to URL changes via urlSearchQuery)
    useEffect(() => {
        if (token && urlSearchQuery.trim()) {
            searchJournals(token, urlSearchQuery);
        } else if (token && !urlSearchQuery.trim() && searchResults.length > 0) {
            // Clear search results if query is empty
             loadJournals(token, 1, 10, {
                moodId: filterMoodId,
                startDate: filterStartDate,
                endDate: filterEndDate,
                tags: filterTags
            });
        }
    }, [urlSearchQuery, token, searchJournals, loadJournals, filterMoodId, filterStartDate, filterEndDate, filterTags, searchResults.length]);

    // Handlers

    const handleDeleteJournal = async () => {
        if (!token || !journalToDelete) return;
        await deleteJournal(token, journalToDelete.uuid);
        setShowDeleteModal(false);
        setJournalToDelete(null);
        toast.success("Jurnal berhasil dihapus");
    };

    const handleDeleteClick = (journal: Journal) => {
        setJournalToDelete(journal);
        setShowDeleteModal(true);
    };

    const handleToggleAIShare = async (journal: Journal) => {
        if (!token) return;
        await toggleAIShare(token, journal.uuid);
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



    const handleExport = async (format: "txt" | "pdf") => {
        if (!token) return;
        
        const result = await exportJournals(token, format, filterStartDate || undefined, filterEndDate || undefined, filterTags);
        if (result) {
            // Create download link
            // If content is base64 (which it is for PDF now), we need to handle it.
            // Backend returns: Content string.
            // For TXT: Plain text. For PDF: Base64.
            
            let blob: Blob;
            if (format === "pdf") {
                // Decode base64
                const byteCharacters = atob(result.content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: "application/pdf" });
            } else {
                 blob = new Blob([result.content], { type: "text/plain" });
            }

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
            loadJournals(token, currentPage + 1, 10, {
                moodId: filterMoodId,
                startDate: filterStartDate,
                endDate: filterEndDate,
                tags: filterTags
            });
        }
    };

    return {
        // Auth/Loading
        authLoading,
        isAuthenticated,
        
        // State
        showDeleteModal,
        journalToDelete,
        showFilters,
        showDisclaimer,
        activeTab,
        localSearchQuery: searchTerm,
        filterMoodId,
        filterStartDate,
        filterEndDate,
        filterTags,
        
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
        setShowDeleteModal,
        setJournalToDelete,
        setShowFilters,
        setShowDisclaimer,
        setActiveTab,
        setLocalSearchQuery,
        
        // Handlers
        handleAcceptDisclaimer,
        handleDeleteJournal,
        handleDeleteClick,
        handleToggleAIShare,
        handleUpdateSettings,
        handleExport,
        handleLoadMore,
    };
}
