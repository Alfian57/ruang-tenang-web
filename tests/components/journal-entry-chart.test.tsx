import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalEntryChart } from "@/app/dashboard/journal/_components/JournalEntryChart";

vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Bar: () => <div>Bar</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    Tooltip: () => <div>Tooltip</div>,
}));

describe("JournalEntryChart", () => {
    it("renders empty message when no monthly data", () => {
        render(
            <JournalEntryChart
                analytics={{ entries_by_month: [] } as never}
            />
        );

        expect(screen.getByText("Belum ada data")).toBeInTheDocument();
    });

    it("renders chart components when data exists", () => {
        render(
            <JournalEntryChart
                analytics={{
                    entries_by_month: [{ month: "Jan", count: 3 }],
                } as never}
            />
        );

        expect(screen.getByText("Jurnal per Bulan")).toBeInTheDocument();
        expect(screen.getByText("Bar")).toBeInTheDocument();
    });
});
