import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JournalStatsCards } from "@/app/dashboard/journal/_components/JournalStatsCards";

describe("JournalStatsCards", () => {
    it("renders all journal metric cards", () => {
        render(
            <JournalStatsCards
                analytics={{
                    total_entries: 20,
                    entries_this_month: 7,
                    writing_streak: 4,
                    total_word_count: 2500,
                } as never}
            />
        );

        expect(screen.getByText("Total Jurnal")).toBeInTheDocument();
        expect(screen.getByText("Bulan Ini")).toBeInTheDocument();
        expect(screen.getByText("Streak Menulis")).toBeInTheDocument();
        expect(screen.getByText("Total Kata")).toBeInTheDocument();
        expect(screen.getByText("2,500")).toBeInTheDocument();
    });
});
