import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalAnalytics } from "@/app/dashboard/journal/_components/JournalAnalytics";

vi.mock("@/app/dashboard/journal/_components/JournalStatsCards", () => ({
    JournalStatsCards: () => <div>Stats Mock</div>,
}));

vi.mock("@/app/dashboard/journal/_components/JournalMoodChart", () => ({
    JournalMoodChart: () => <div>Mood Chart Mock</div>,
}));

vi.mock("@/app/dashboard/journal/_components/JournalEntryChart", () => ({
    JournalEntryChart: () => <div>Entry Chart Mock</div>,
}));

vi.mock("@/app/dashboard/journal/_components/JournalTagsCard", () => ({
    JournalTagsCard: () => <div>Tags Card Mock</div>,
}));

describe("JournalAnalytics", () => {
    it("renders loading skeleton and empty state", () => {
        const { rerender, container } = render(
            <JournalAnalytics analytics={null} isLoading />
        );

        expect(container.querySelector(".animate-pulse")).toBeTruthy();

        rerender(<JournalAnalytics analytics={null} isLoading={false} />);
        expect(screen.getByText(/Belum ada data analitik/i)).toBeInTheDocument();
    });

    it("renders analytics sections", () => {
        render(
            <JournalAnalytics
                analytics={{ total_entries: 5 } as never}
            />
        );

        expect(screen.getByText("Stats Mock")).toBeInTheDocument();
        expect(screen.getByText("Mood Chart Mock")).toBeInTheDocument();
        expect(screen.getByText("Entry Chart Mock")).toBeInTheDocument();
        expect(screen.getByText("Tags Card Mock")).toBeInTheDocument();
    });
});
