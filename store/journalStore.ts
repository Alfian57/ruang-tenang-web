import { create } from "zustand";
import { journalService } from "@/services/api";
import {
  Journal,
  JournalSettings,
  JournalAIAccessLog,
  JournalAIContext,
  JournalAnalytics,
  JournalWeeklySummary,
  JournalPrompt,
  JournalExportData,
} from "@/types";

/**
 * Journal store state interface
 */
interface JournalState {
  // Journal entries
  journals: Journal[];
  activeJournal: Journal | null;
  totalJournals: number;
  currentPage: number;
  totalPages: number;

  // Settings
  settings: JournalSettings | null;

  // AI Features
  aiContext: JournalAIContext | null;
  aiAccessLogs: JournalAIAccessLog[];
  weeklyPrompt: JournalPrompt | null;
  weeklySummary: JournalWeeklySummary | null;

  // Analytics
  analytics: JournalAnalytics | null;

  // Search state
  searchQuery: string;
  searchResults: Journal[];
  isSearching: boolean;

  // Filter state
  filterTags: string[];
  filterStartDate: string | null;
  filterEndDate: string | null;
  filterMoodId: number | null;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  error: string | null;
}

/**
 * Journal store actions interface
 */
interface JournalActions {
  // CRUD Operations
  loadJournals: (token: string, page?: number, limit?: number) => Promise<void>;
  loadJournal: (token: string, id: number) => Promise<void>;
  createJournal: (token: string, data: {
    title: string;
    content: string;
    mood_id?: number;
    tags?: string[];
    is_private?: boolean;
    share_with_ai?: boolean;
  }) => Promise<Journal | null>;
  updateJournal: (token: string, id: number, data: {
    title?: string;
    content?: string;
    mood_id?: number;
    tags?: string[];
    is_private?: boolean;
    share_with_ai?: boolean;
  }) => Promise<void>;
  deleteJournal: (token: string, id: number) => Promise<void>;

  // Search & Filter
  searchJournals: (token: string, query: string) => Promise<void>;
  setFilterTags: (tags: string[]) => void;
  setFilterDates: (startDate: string | null, endDate: string | null) => void;
  setFilterMoodId: (moodId: number | null) => void;
  clearFilters: () => void;
  applyFilters: (token: string) => Promise<void>;

  // Settings
  loadSettings: (token: string) => Promise<void>;
  updateSettings: (token: string, data: {
    allow_ai_access?: boolean;
    ai_context_days?: number;
    ai_context_max_entries?: number;
    default_share_with_ai?: boolean;
  }) => Promise<void>;

  // AI Integration
  toggleAIShare: (token: string, journalId: number) => Promise<void>;
  loadAIContext: (token: string) => Promise<void>;
  loadAIAccessLogs: (token: string) => Promise<void>;

  // AI Features
  loadWritingPrompt: (token: string, mood?: string) => Promise<void>;
  loadWeeklySummary: (token: string) => Promise<void>;

  // Analytics
  loadAnalytics: (token: string) => Promise<void>;

  // Export
  exportJournals: (token: string, format: "txt" | "html", startDate?: string, endDate?: string) => Promise<JournalExportData | null>;

  // State management
  setActiveJournal: (journal: Journal | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: JournalState = {
  journals: [],
  activeJournal: null,
  totalJournals: 0,
  currentPage: 1,
  totalPages: 1,
  settings: null,
  aiContext: null,
  aiAccessLogs: [],
  weeklyPrompt: null,
  weeklySummary: null,
  analytics: null,
  searchQuery: "",
  searchResults: [],
  isSearching: false,
  filterTags: [],
  filterStartDate: null,
  filterEndDate: null,
  filterMoodId: null,
  isLoading: false,
  isSaving: false,
  isExporting: false,
  error: null,
};

export const useJournalStore = create<JournalState & JournalActions>((set, get) => ({
  ...initialState,

  // ==================== CRUD Operations ====================

  loadJournals: async (token: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const { filterTags, filterStartDate, filterEndDate, filterMoodId } = get();
      const response = await journalService.list(token, {
        page,
        limit,
        tags: filterTags.length > 0 ? filterTags : undefined,
        start_date: filterStartDate || undefined,
        end_date: filterEndDate || undefined,
        mood_id: filterMoodId || undefined,
      });
      set({
        journals: response.data || [],
        totalJournals: response.total_items,
        currentPage: response.page,
        totalPages: response.total_pages,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Gagal memuat jurnal",
      });
    }
  },

  loadJournal: async (token: string, id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await journalService.get(token, id);
      set({ activeJournal: response.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Gagal memuat jurnal",
      });
    }
  },

  createJournal: async (token, data) => {
    set({ isSaving: true, error: null });
    try {
      const response = await journalService.create(token, data);
      const newJournal = response.data;
      set((state) => ({
        journals: [newJournal, ...state.journals],
        totalJournals: state.totalJournals + 1,
        activeJournal: newJournal,
        isSaving: false,
      }));
      return newJournal;
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Gagal membuat jurnal",
      });
      return null;
    }
  },

  updateJournal: async (token, id, data) => {
    set({ isSaving: true, error: null });
    try {
      const response = await journalService.update(token, id, data);
      const updatedJournal = response.data;
      set((state) => ({
        journals: state.journals.map((j) => (j.id === id ? updatedJournal : j)),
        activeJournal: state.activeJournal?.id === id ? updatedJournal : state.activeJournal,
        isSaving: false,
      }));
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate jurnal",
      });
    }
  },

  deleteJournal: async (token, id) => {
    set({ isLoading: true, error: null });
    try {
      await journalService.delete(token, id);
      set((state) => ({
        journals: state.journals.filter((j) => j.id !== id),
        totalJournals: state.totalJournals - 1,
        activeJournal: state.activeJournal?.id === id ? null : state.activeJournal,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Gagal menghapus jurnal",
      });
    }
  },

  // ==================== Search & Filter ====================

  searchJournals: async (token, query) => {
    set({ isSearching: true, searchQuery: query, error: null });
    try {
      if (!query.trim()) {
        set({ searchResults: [], isSearching: false });
        return;
      }
      const response = await journalService.search(token, query);
      set({ searchResults: response.data || [], isSearching: false });
    } catch (error) {
      set({
        isSearching: false,
        error: error instanceof Error ? error.message : "Gagal mencari jurnal",
      });
    }
  },

  setFilterTags: (tags) => set({ filterTags: tags }),

  setFilterDates: (startDate, endDate) =>
    set({ filterStartDate: startDate, filterEndDate: endDate }),

  setFilterMoodId: (moodId) => set({ filterMoodId: moodId }),

  clearFilters: () =>
    set({
      filterTags: [],
      filterStartDate: null,
      filterEndDate: null,
      filterMoodId: null,
      searchQuery: "",
      searchResults: [],
    }),

  applyFilters: async (token) => {
    await get().loadJournals(token, 1);
  },

  // ==================== Settings ====================

  loadSettings: async (token) => {
    try {
      const response = await journalService.getSettings(token);
      set({ settings: response.data });
    } catch (error) {
      console.error("Failed to load journal settings:", error);
    }
  },

  updateSettings: async (token, data) => {
    set({ isSaving: true, error: null });
    try {
      const response = await journalService.updateSettings(token, data);
      set({ settings: response.data, isSaving: false });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate pengaturan",
      });
    }
  },

  // ==================== AI Integration ====================

  toggleAIShare: async (token, journalId) => {
    try {
      const response = await journalService.toggleAIShare(token, journalId);
      const updatedJournal = response.data;
      set((state) => ({
        journals: state.journals.map((j) =>
          j.id === journalId ? updatedJournal : j
        ),
        activeJournal:
          state.activeJournal?.id === journalId
            ? updatedJournal
            : state.activeJournal,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Gagal mengubah status AI share",
      });
    }
  },

  loadAIContext: async (token) => {
    try {
      const response = await journalService.getAIContext(token);
      set({ aiContext: response.data });
    } catch (error) {
      console.error("Failed to load AI context:", error);
    }
  },

  loadAIAccessLogs: async (token) => {
    try {
      const response = await journalService.getAIAccessLogs(token);
      set({ aiAccessLogs: response.data || [] });
    } catch (error) {
      console.error("Failed to load AI access logs:", error);
    }
  },

  // ==================== AI Features ====================

  loadWritingPrompt: async (token, mood) => {
    try {
      const response = await journalService.getWritingPrompt(token, mood);
      set({ weeklyPrompt: response.data });
    } catch (error) {
      console.error("Failed to load writing prompt:", error);
    }
  },

  loadWeeklySummary: async (token) => {
    try {
      const response = await journalService.getWeeklySummary(token);
      set({ weeklySummary: response.data });
    } catch (error) {
      console.error("Failed to load weekly summary:", error);
    }
  },

  // ==================== Analytics ====================

  loadAnalytics: async (token) => {
    try {
      const response = await journalService.getAnalytics(token);
      set({ analytics: response.data });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  },

  // ==================== Export ====================

  exportJournals: async (token, format, startDate, endDate) => {
    set({ isExporting: true, error: null });
    try {
      const response = await journalService.export(token, format, startDate, endDate);
      set({ isExporting: false });
      return response.data;
    } catch (error) {
      set({
        isExporting: false,
        error: error instanceof Error ? error.message : "Gagal mengekspor jurnal",
      });
      return null;
    }
  },

  // ==================== State Management ====================

  setActiveJournal: (journal) => set({ activeJournal: journal }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
