import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalDetail } from "@/app/dashboard/journal/_components/JournalDetail";

vi.mock("@/utils/sanitize", () => ({
    sanitizeHtml: (html: string) => html,
}));

describe("JournalDetail", () => {
    const journal = {
        id: 3,
        title: "Jurnal Detail",
        content: "<p>Konten aman</p>",
        created_at: "2026-01-01T08:00:00Z",
        word_count: 88,
        tags: ["tenang", "fokus"],
        is_private: true,
        share_with_ai: false,
        mood_emoji: "🙂",
        mood_label: "Netral",
        ai_accessed_at: "2026-01-02T08:00:00Z",
    };

    it("renders journal content and metadata", () => {
        render(
            <JournalDetail
                journal={journal as never}
                onBack={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onToggleAIShare={vi.fn()}
            />
        );

        expect(screen.getByText("Jurnal Detail")).toBeInTheDocument();
        expect(screen.getByText("Konten aman")).toBeInTheDocument();
        expect(screen.getByText("#tenang")).toBeInTheDocument();
        expect(screen.getByText(/88 kata/)).toBeInTheDocument();
    });

    it("calls action callbacks", () => {
        const onBack = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();
        const onToggleAIShare = vi.fn();

        render(
            <JournalDetail
                journal={journal as never}
                onBack={onBack}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleAIShare={onToggleAIShare}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Kembali/i }));
        fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
        fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
        fireEvent.click(screen.getByRole("button", { name: /Bagikan ke AI/i }));

        expect(onBack).toHaveBeenCalledTimes(1);
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onToggleAIShare).toHaveBeenCalledTimes(1);
    });
});
