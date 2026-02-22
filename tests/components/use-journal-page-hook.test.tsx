import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useJournalPage } from "@/app/dashboard/journal/_hooks/useJournalPage";

const push = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

const useAuthStoreMock = vi.fn();
const useJournalStoreMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
    usePathname: () => "/dashboard/journal",
    useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/hooks/use-debounce", () => ({
    useDebounce: (value: string) => value,
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => useAuthStoreMock(),
}));

vi.mock("@/store/journalStore", () => ({
    useJournalStore: () => useJournalStoreMock(),
}));

vi.mock("@/services/api", () => ({
    moderationService: {
        acceptAIDisclaimer: vi.fn(),
    },
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => toastSuccess(...args),
        error: (...args: unknown[]) => toastError(...args),
    },
}));

function Harness() {
    const hook = useJournalPage();
    return (
        <div>
            <div data-testid="active-tab">{hook.activeTab}</div>
            <button
                onClick={() =>
                    hook.handleDeleteClick({ uuid: "j-1", title: "Jurnal 1" } as never)
                }
            >
                open-delete
            </button>
            <button onClick={() => hook.handleDeleteJournal()}>confirm-delete</button>
            <button
                onClick={() =>
                    hook.handleToggleAIShare({ uuid: "j-1", share_with_ai: false } as never)
                }
            >
                toggle-ai
            </button>
            <button onClick={() => hook.handleExport("txt")}>export-txt</button>
        </div>
    );
}

describe("useJournalPage", () => {
    it("loads journal data using query filters", () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams(
                "tab=analytics&search=refleksi&mood=2&start_date=2026-01-01&end_date=2026-01-31&tags=kerja,keluarga"
            )
        );

        const loadJournals = vi.fn();
        const loadSettings = vi.fn();

        useAuthStoreMock.mockReturnValue({
            token: "token",
            isAuthenticated: true,
            isLoading: false,
            user: { has_accepted_ai_disclaimer: true },
        });

        useJournalStoreMock.mockReturnValue({
            journals: [],
            totalJournals: 0,
            currentPage: 1,
            totalPages: 1,
            settings: null,
            analytics: null,
            weeklySummary: null,
            aiContext: null,
            aiAccessLogs: [],
            isLoading: false,
            isSaving: false,
            isExporting: false,
            error: null,
            loadJournals,
            deleteJournal: vi.fn(),
            searchJournals: vi.fn(),
            loadSettings,
            updateSettings: vi.fn(),
            loadAnalytics: vi.fn(),
            loadWeeklySummary: vi.fn(),
            loadAIContext: vi.fn(),
            loadAIAccessLogs: vi.fn(),
            toggleAIShare: vi.fn(),
            exportJournals: vi.fn(),
            clearError: vi.fn(),
            searchResults: [],
            isSearching: false,
        });

        render(<Harness />);

        expect(screen.getByTestId("active-tab")).toHaveTextContent("analytics");
        expect(loadJournals).toHaveBeenCalledWith("token", 1, 10, {
            moodId: 2,
            startDate: "2026-01-01",
            endDate: "2026-01-31",
            tags: ["kerja", "keluarga"],
        });
        expect(loadSettings).toHaveBeenCalledWith("token");
    });

    it("handles delete, AI share toggle, and text export", async () => {
        useSearchParamsMock.mockReturnValue(new URLSearchParams(""));

        const deleteJournal = vi.fn().mockResolvedValue(undefined);
        const toggleAIShare = vi.fn().mockResolvedValue(undefined);
        const exportJournals = vi.fn().mockResolvedValue({
            content: "isi export",
            filename: "jurnal.txt",
        });

        useAuthStoreMock.mockReturnValue({
            token: "token",
            isAuthenticated: true,
            isLoading: false,
            user: { has_accepted_ai_disclaimer: true },
        });

        useJournalStoreMock.mockReturnValue({
            journals: [],
            totalJournals: 0,
            currentPage: 1,
            totalPages: 1,
            settings: null,
            analytics: null,
            weeklySummary: null,
            aiContext: null,
            aiAccessLogs: [],
            isLoading: false,
            isSaving: false,
            isExporting: false,
            error: null,
            loadJournals: vi.fn(),
            deleteJournal,
            searchJournals: vi.fn(),
            loadSettings: vi.fn(),
            updateSettings: vi.fn(),
            loadAnalytics: vi.fn(),
            loadWeeklySummary: vi.fn(),
            loadAIContext: vi.fn(),
            loadAIAccessLogs: vi.fn(),
            toggleAIShare,
            exportJournals,
            clearError: vi.fn(),
            searchResults: [],
            isSearching: false,
        });

        const createObjectURL = vi.fn(() => "blob:url");
        const revokeObjectURL = vi.fn();
        const originalCreate = URL.createObjectURL;
        const originalRevoke = URL.revokeObjectURL;
        URL.createObjectURL = createObjectURL;
        URL.revokeObjectURL = revokeObjectURL;
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => { });

        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "open-delete" }));
        fireEvent.click(screen.getByRole("button", { name: "confirm-delete" }));
        await waitFor(() => {
            expect(deleteJournal).toHaveBeenCalledWith("token", "j-1");
            expect(toastSuccess).toHaveBeenCalledWith("Jurnal berhasil dihapus");
        });

        fireEvent.click(screen.getByRole("button", { name: "toggle-ai" }));
        await waitFor(() => {
            expect(toggleAIShare).toHaveBeenCalledWith("token", "j-1");
            expect(toastSuccess).toHaveBeenCalledWith("Jurnal dibagikan ke AI");
        });

        fireEvent.click(screen.getByRole("button", { name: "export-txt" }));
        await waitFor(() => {
            expect(exportJournals).toHaveBeenCalledWith("token", "txt", undefined, undefined, []);
            expect(createObjectURL).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalled();
            expect(revokeObjectURL).toHaveBeenCalledWith("blob:url");
        });

        clickSpy.mockRestore();
        URL.createObjectURL = originalCreate;
        URL.revokeObjectURL = originalRevoke;
    });
});
