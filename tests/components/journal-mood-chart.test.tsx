import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalMoodChart } from "@/app/dashboard/journal/_components/JournalMoodChart";

vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: any }) => <div>{children}</div>,
    PieChart: ({ children }: { children: any }) => <div>{children}</div>,
    Pie: ({ children }: { children: any }) => <div>{children}</div>,
    Cell: () => <div>Cell</div>,
    Tooltip: () => <div>Tooltip</div>,
}));

describe("JournalMoodChart", () => {
    it("shows empty state when mood distribution is empty", () => {
        render(
            <JournalMoodChart analytics={{ mood_distribution: {} } as never} />
        );

        expect(screen.getByText("Belum ada data mood")).toBeInTheDocument();
    });

    it("renders mood labels and chart when data exists", () => {
        render(
            <JournalMoodChart
                analytics={{
                    mood_distribution: {
                        happy: 3,
                        sad: 1,
                    },
                } as never}
            />
        );

        expect(screen.getByText("Distribusi Mood")).toBeInTheDocument();
        expect(screen.getByText("Bahagia")).toBeInTheDocument();
        expect(screen.getByText("Sedih")).toBeInTheDocument();
        expect(screen.getByText("Tooltip")).toBeInTheDocument();
    });
});
