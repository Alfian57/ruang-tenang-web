import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CreateJournalPage from "@/app/dashboard/journal/create/page";

const push = vi.fn();
const toastSuccess = vi.fn();
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
        success: (...args: unknown[]) => toastSuccess(...args),
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
    JournalEditor: ({ onSave, onGeneratePrompt }: { onSave: (data: any) => Promise<void>; onGeneratePrompt?: () => Promise<void> }) => (
        <div>
            <button
                onClick={() =>
                    onSave({
                        title: "Judul Baru",
                        content: "Isi",
                        tags: ["refleksi"],
                        is_private: true,
                        share_with_ai: false,
                    })
                }
            >
                Save Journal
            </button>
            <button onClick={onGeneratePrompt}>Generate Prompt</button>
        </div>
    ),
}));

describe("CreateJournalPage", () => {
    it("redirects to login when unauthenticated", () => {
        useAuthStoreMock.mockReturnValue({ token: null, isAuthenticated: false });
        useJournalStoreMock.mockReturnValue({
            createJournal: vi.fn(),
            isSaving: false,
            settings: null,
            loadWritingPrompt: vi.fn(),
            weeklyPrompt: null,
            error: null,
            clearError: vi.fn(),
        });

        render(<CreateJournalPage />);
        expect(push).toHaveBeenCalledWith("/login");
    });

    it("creates journal and generates writing prompt", async () => {
        const createJournal = vi.fn().mockResolvedValue({ uuid: "j-1" });
        const loadWritingPrompt = vi.fn().mockResolvedValue(undefined);

        useAuthStoreMock.mockReturnValue({ token: "token-123", isAuthenticated: true });
        useJournalStoreMock.mockReturnValue({
            createJournal,
            isSaving: false,
            settings: { default_share_with_ai: true },
            loadWritingPrompt,
            weeklyPrompt: { prompt: "Apa yang kamu syukuri hari ini?" },
            error: null,
            clearError: vi.fn(),
        });

        render(<CreateJournalPage />);

        fireEvent.click(screen.getByRole("button", { name: "Save Journal" }));

        await waitFor(() => {
            expect(createJournal).toHaveBeenCalledTimes(1);
            expect(toastSuccess).toHaveBeenCalledWith("Jurnal berhasil disimpan!");
            expect(push).toHaveBeenCalledWith("/dashboard/journal");
        });

        fireEvent.click(screen.getByRole("button", { name: "Generate Prompt" }));
        await waitFor(() => {
            expect(loadWritingPrompt).toHaveBeenCalledWith("token-123");
            expect(toastSuccess).toHaveBeenCalledWith("Ide menulis berhasil dibuat!");
        });
    });
});
