import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JournalWeeklySummary } from "@/app/dashboard/journal/_components/JournalWeeklySummary";

describe("JournalWeeklySummary", () => {
    it("renders loading skeleton when loading", () => {
        const { container } = render(<JournalWeeklySummary summary={null} isLoading />);
        expect(container.querySelector(".animate-pulse")).toBeTruthy();
    });

    it("renders summary details and recommendations", () => {
        render(
            <JournalWeeklySummary
                summary={{
                    week_start: "2026-01-01",
                    week_end: "2026-01-07",
                    entry_count: 5,
                    total_words: 1300,
                    dominant_mood: "happy",
                    key_themes: ["fokus", "syukur"],
                    summary: "Minggu ini kamu lebih stabil.",
                    recommendations: ["Lanjutkan journaling pagi"],
                }}
            />
        );

        expect(screen.getByText("Ringkasan Mingguanmu")).toBeInTheDocument();
        expect(screen.getByText(/5 jurnal/)).toBeInTheDocument();
        expect(screen.getByText("fokus")).toBeInTheDocument();
        expect(screen.getByText("Lanjutkan journaling pagi")).toBeInTheDocument();
    });
});
