import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EditJournalPage from "@/app/dashboard/journal/[uuid]/edit/page";

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
    JournalEditor: ({ onSave, initialTitle }: { onSave: (data: any) => Promise<void>; initialTitle: string }) => (
        <div>
            <p>Editor Initial: {initialTitle}</p>
            <button
                onClick={() =>
                    onSave({
                        title: "Judul Update",
                        content: "Isi update",
                        tags: ["tag1"],
                        is_private: true,
                        share_with_ai: true,
                    })
                }
            >
                Save Update
            </button>
        </div>
    ),
}));

describe("EditJournalPage", () => {
    it("redirects to login when unauthenticated", () => {
        useParamsMock.mockReturnValue({ uuid: "j-2" });
        useAuthStoreMock.mockReturnValue({ token: null, isAuthenticated: false });
        useJournalStoreMock.mockReturnValue({
            loadJournal: vi.fn(),
            activeJournal: null,
            isLoading: false,
            updateJournal: vi.fn(),
            isSaving: false,
            settings: null,
            setActiveJournal: vi.fn(),
        });

        render(<EditJournalPage />);
        expect(push).toHaveBeenCalledWith("/login");
    });

    it("renders editor and saves update", async () => {
        const updateJournal = vi.fn().mockResolvedValue(undefined);
        const setActiveJournal = vi.fn();

        useParamsMock.mockReturnValue({ uuid: "j-10" });
        useAuthStoreMock.mockReturnValue({ token: "token", isAuthenticated: true });
        useJournalStoreMock.mockReturnValue({
            loadJournal: vi.fn(),
            activeJournal: {
                uuid: "j-10",
                title: "Judul Lama",
                content: "Isi Lama",
                mood_id: 2,
                tags: ["lama"],
                is_private: true,
                share_with_ai: false,
            },
            isLoading: false,
            updateJournal,
            isSaving: false,
            settings: { default_share_with_ai: false },
            setActiveJournal,
        });

        const { unmount } = render(<EditJournalPage />);

        expect(screen.getByText("Edit Jurnal")).toBeInTheDocument();
        expect(screen.getByText("Editor Initial: Judul Lama")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Save Update" }));

        await waitFor(() => {
            expect(updateJournal).toHaveBeenCalledWith(
                "token",
                "j-10",
                expect.objectContaining({ title: "Judul Update" })
            );
            expect(toastSuccess).toHaveBeenCalledWith("Jurnal berhasil diperbarui!");
            expect(push).toHaveBeenCalledWith("/dashboard/journal/j-10");
        });

        unmount();
        expect(setActiveJournal).toHaveBeenCalledWith(null);
    });
});
