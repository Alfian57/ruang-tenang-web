import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JournalAIContextPreview } from "@/app/dashboard/journal/_components/JournalAIContextPreview";

describe("JournalAIContextPreview", () => {
    it("renders loading and null states", () => {
        const { rerender } = render(
            <JournalAIContextPreview context={null} isLoading />
        );
        expect(screen.getByText(/Memuat konteks/i)).toBeInTheDocument();

        rerender(<JournalAIContextPreview context={null} isLoading={false} />);
        expect(document.body.textContent).not.toContain("Yang AI Bisa Baca");
    });

    it("expands and shows entries", () => {
        render(
            <JournalAIContextPreview
                context={{
                    total_shared: 2,
                    entries: [
                        {
                            id: 1,
                            title: "Jurnal A",
                            content_preview: "Ringkas A",
                            created_at: "2026-01-01",
                            tags: ["fokus"],
                            mood_emoji: "😊",
                        },
                    ],
                } as never}
            />
        );

        fireEvent.click(screen.getByText("Yang AI Bisa Baca"));
        expect(screen.getByText("Jurnal A")).toBeInTheDocument();
        expect(screen.getByText("Ringkas A")).toBeInTheDocument();
    });
});
