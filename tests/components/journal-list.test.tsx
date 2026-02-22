import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalList } from "@/app/dashboard/journal/_components/JournalList";

vi.mock("@/app/dashboard/journal/_components/JournalListItem", () => ({
    JournalListItem: ({ journal }: { journal: { title: string } }) => (
        <div>Item: {journal.title}</div>
    ),
}));

describe("JournalList", () => {
    it("renders loading skeleton", () => {
        const { container } = render(
            <JournalList
                journals={[]}
                onDelete={vi.fn()}
                onToggleAIShare={vi.fn()}
                isLoading
            />
        );

        expect(container.querySelector(".bg-gray-200")).toBeTruthy();
    });

    it("renders empty state and list items", () => {
        const { rerender } = render(
            <JournalList journals={[]} onDelete={vi.fn()} onToggleAIShare={vi.fn()} />
        );

        expect(screen.getByText("Belum ada jurnal")).toBeInTheDocument();

        rerender(
            <JournalList
                journals={[
                    {
                        id: 1,
                        title: "Jurnal Pagi",
                    },
                    {
                        id: 2,
                        title: "Jurnal Malam",
                    },
                ] as never}
                onDelete={vi.fn()}
                onToggleAIShare={vi.fn()}
            />
        );

        expect(screen.getByText("Item: Jurnal Pagi")).toBeInTheDocument();
        expect(screen.getByText("Item: Jurnal Malam")).toBeInTheDocument();
    });
});
