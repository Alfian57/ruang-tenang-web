import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CreateJournalPage from "@/app/dashboard/journal/create/page";

const push = vi.fn();
const toastError = vi.fn();
const useAuthStoreMock = vi.fn();
const useJournalStoreMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: any; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: (...args: unknown[]) => toastError(...args),
    },
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => useAuthStoreMock(),
}));

vi.mock("@/store/journalStore", () => ({
    useJournalStore: () => useJournalStoreMock(),
}));

vi.mock("@/app/dashboard/journal/_components", () => ({
    JournalEditor: () => <div>Editor Mock</div>,
}));

describe("CreateJournalPage error branch", () => {
    it("shows toast error and clears error state", () => {
        const clearError = vi.fn();

        useAuthStoreMock.mockReturnValue({ token: "token", isAuthenticated: true });
        useJournalStoreMock.mockReturnValue({
            createJournal: vi.fn(),
            isSaving: false,
            settings: null,
            loadWritingPrompt: vi.fn(),
            weeklyPrompt: null,
            error: "Gagal menyimpan jurnal",
            clearError,
        });

        render(<CreateJournalPage />);

        expect(toastError).toHaveBeenCalledWith("Gagal menyimpan jurnal");
        expect(clearError).toHaveBeenCalledTimes(1);
        expect(push).not.toHaveBeenCalledWith("/login");
    });
});
