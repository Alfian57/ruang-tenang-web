import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import JournalDetailPage from "@/app/dashboard/journal/[uuid]/page";

const push = vi.fn();
const toastSuccess = vi.fn();
const useParamsMock = vi.fn();
const useAuthStoreMock = vi.fn();
const useJournalStoreMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
    useParams: () => useParamsMock(),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: any; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => toastSuccess(...args),
    },
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => useAuthStoreMock(),
}));

vi.mock("@/store/journalStore", () => ({
    useJournalStore: () => useJournalStoreMock(),
}));

vi.mock("@/app/dashboard/journal/_components", () => ({
    JournalDetail: ({ onDelete, onToggleAIShare }: { onDelete: () => void; onToggleAIShare: () => void }) => (
        <div>
            <h2>Detail Component</h2>
            <button onClick={onDelete}>Delete From Detail</button>
            <button onClick={onToggleAIShare}>Toggle AI Share</button>
        </div>
    ),
}));

vi.mock("@/components/ui/delete-confirmation-modal", () => ({
    DeleteConfirmationModal: ({ onConfirm, isOpen }: { onConfirm: () => void; isOpen: boolean }) =>
        isOpen ? <button onClick={onConfirm}>Confirm Delete</button> : null,
}));

describe("JournalDetailPage", () => {
    it("renders loading skeleton", () => {
        useParamsMock.mockReturnValue({ uuid: "j-1" });
        useAuthStoreMock.mockReturnValue({ token: "token", isAuthenticated: true });
        useJournalStoreMock.mockReturnValue({
            loadJournal: vi.fn(),
            activeJournal: null,
            isLoading: true,
            deleteJournal: vi.fn(),
            toggleAIShare: vi.fn(),
            setActiveJournal: vi.fn(),
        });

        const { container } = render(<JournalDetailPage />);
        expect(container.querySelector(".animate-pulse")).toBeTruthy();
    });

    it("loads journal, toggles AI share, and deletes via modal", async () => {
        const loadJournal = vi.fn();
        const deleteJournal = vi.fn().mockResolvedValue(undefined);
        const toggleAIShare = vi.fn().mockResolvedValue(undefined);
        const setActiveJournal = vi.fn();

        useParamsMock.mockReturnValue({ uuid: "j-9" });
        useAuthStoreMock.mockReturnValue({ token: "token", isAuthenticated: true });
        useJournalStoreMock.mockReturnValue({
            loadJournal,
            activeJournal: { uuid: "j-9", title: "Jurnal 9" },
            isLoading: false,
            deleteJournal,
            toggleAIShare,
            setActiveJournal,
        });

        const { unmount } = render(<JournalDetailPage />);

        await waitFor(() => {
            expect(screen.getByText("Detail Component")).toBeInTheDocument();
            expect(loadJournal).not.toHaveBeenCalled();
        });

        fireEvent.click(screen.getByRole("button", { name: "Toggle AI Share" }));
        await waitFor(() => {
            expect(toggleAIShare).toHaveBeenCalledWith("token", "j-9");
            expect(toastSuccess).toHaveBeenCalledWith("Status berbagi AI berhasil diubah");
        });

        fireEvent.click(screen.getByRole("button", { name: "Delete From Detail" }));
        fireEvent.click(screen.getByRole("button", { name: "Confirm Delete" }));

        await waitFor(() => {
            expect(deleteJournal).toHaveBeenCalledWith("token", "j-9");
            expect(toastSuccess).toHaveBeenCalledWith("Jurnal berhasil dihapus");
            expect(push).toHaveBeenCalledWith("/dashboard/journal");
        });

        unmount();
        expect(setActiveJournal).toHaveBeenCalledWith(null);
    });
});
