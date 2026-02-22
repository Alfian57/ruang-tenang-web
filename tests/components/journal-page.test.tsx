import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import JournalPage from "@/app/dashboard/journal/page";

const useJournalPageMock = vi.fn();

vi.mock("@/app/dashboard/journal/_hooks/useJournalPage", () => ({
    useJournalPage: () => useJournalPageMock(),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: any; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock("@/app/dashboard/journal/_components", () => ({
    JournalList: ({ journals }: { journals: Array<{ title: string }> }) => (
        <div>List: {journals.map((j) => j.title).join(", ")}</div>
    ),
    JournalPrivacySettings: () => <div>Privacy Settings</div>,
    JournalAIAccessLogs: () => <div>AI Access Logs</div>,
    JournalAIContextPreview: () => <div>AI Context Preview</div>,
    JournalAnalytics: () => <div>Analytics Content</div>,
    JournalWeeklySummary: () => <div>Weekly Summary</div>,
    JournalFilters: () => <div>Filters Panel</div>,
}));

vi.mock("@/components/ui/delete-confirmation-modal", () => ({
    DeleteConfirmationModal: ({ onConfirm }: { onConfirm: () => void }) => (
        <button onClick={onConfirm}>Confirm Delete</button>
    ),
}));

vi.mock("@/components/ui/tabs", () => ({
    Tabs: ({ children }: { children: any }) => <div>{children}</div>,
    TabsList: ({ children }: { children: any }) => <div>{children}</div>,
    TabsTrigger: ({ children }: { children: any }) => <button>{children}</button>,
    TabsContent: ({ children }: { children: any }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: any; onClick: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

const baseState = {
    authLoading: false,
    showFilters: false,
    activeTab: "journals",
    localSearchQuery: "",
    journals: [{ uuid: "j-1", title: "Catatan Pagi" }],
    totalJournals: 10,
    currentPage: 1,
    totalPages: 2,
    settings: { allow_ai_access: true },
    analytics: {},
    weeklySummary: {},
    aiContext: {},
    aiAccessLogs: [],
    isLoading: false,
    isSaving: false,
    isExporting: false,
    searchResults: [{ uuid: "s-1", title: "Hasil Cari" }],
    isSearching: false,
    setShowFilters: vi.fn(),
    setActiveTab: vi.fn(),
    setLocalSearchQuery: vi.fn(),
    handleUpdateSettings: vi.fn(),
    handleExport: vi.fn(),
    handleLoadMore: vi.fn(),
    handleToggleAIShare: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleDeleteJournal: vi.fn(),
    showDeleteModal: false,
    setShowDeleteModal: vi.fn(),
    journalToDelete: { title: "Catatan Pagi" },
};

describe("JournalPage", () => {
    it("shows auth loading spinner", () => {
        useJournalPageMock.mockReturnValue({ ...baseState, authLoading: true });

        const { container } = render(<JournalPage />);
        expect(container.querySelector(".animate-spin")).toBeTruthy();
    });

    it("handles search change, filter toggle, export, and load more", () => {
        useJournalPageMock.mockReturnValue({ ...baseState, localSearchQuery: "" });

        render(<JournalPage />);

        fireEvent.change(screen.getByPlaceholderText("Cari jurnal..."), {
            target: { value: "baru" },
        });
        expect(baseState.setLocalSearchQuery).toHaveBeenCalledWith("baru");

        fireEvent.click(screen.getByRole("button", { name: "Filter" }));
        expect(baseState.setShowFilters).toHaveBeenCalledWith(true);

        fireEvent.click(screen.getByRole("button", { name: "Ekspor sebagai TXT" }));
        expect(baseState.handleExport).toHaveBeenCalledWith("txt");

        fireEvent.click(screen.getByRole("button", { name: "Ekspor sebagai PDF" }));
        expect(baseState.handleExport).toHaveBeenCalledWith("pdf");

        fireEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
        expect(baseState.handleLoadMore).toHaveBeenCalledTimes(1);
    });

    it("clears search query via close button", () => {
        useJournalPageMock.mockReturnValue({ ...baseState, localSearchQuery: "mood" });

        const { container } = render(<JournalPage />);

        const clearButton = container.querySelector(".absolute.right-3.top-1\\/2");
        expect(clearButton).toBeTruthy();

        fireEvent.click(clearButton as Element);
        expect(baseState.setLocalSearchQuery).toHaveBeenCalledWith("");
    });

    it("uses search results and supports delete confirmation", () => {
        useJournalPageMock.mockReturnValue({ ...baseState, localSearchQuery: "ada" });

        render(<JournalPage />);

        expect(screen.getByText("List: Hasil Cari")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Confirm Delete" }));
        expect(baseState.handleDeleteJournal).toHaveBeenCalledTimes(1);
    });
});
