import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import JournalDetailPage from "@/app/dashboard/journal/[uuid]/page";

const push = vi.fn();
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

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => useAuthStoreMock(),
}));

vi.mock("@/store/journalStore", () => ({
    useJournalStore: () => useJournalStoreMock(),
}));

describe("JournalDetailPage empty state", () => {
    it("renders not-found message when journal is missing", () => {
        useParamsMock.mockReturnValue({ uuid: "unknown" });
        useAuthStoreMock.mockReturnValue({ token: "token", isAuthenticated: true });
        useJournalStoreMock.mockReturnValue({
            loadJournal: vi.fn(),
            activeJournal: null,
            isLoading: false,
            deleteJournal: vi.fn(),
            toggleAIShare: vi.fn(),
            setActiveJournal: vi.fn(),
        });

        render(<JournalDetailPage />);

        expect(screen.getByText("Jurnal tidak ditemukan")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Kembali ke Daftar" })).toHaveAttribute(
            "href",
            "/dashboard/journal"
        );
    });
});
