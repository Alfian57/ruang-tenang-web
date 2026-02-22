import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JournalAIAccessLogs } from "@/app/dashboard/journal/_components/JournalAIAccessLogs";

describe("JournalAIAccessLogs", () => {
    it("shows loading state", () => {
        render(<JournalAIAccessLogs logs={[]} isLoading />);
        expect(screen.getByText(/Memuat log akses/i)).toBeInTheDocument();
    });

    it("expands and renders log entries", () => {
        render(
            <JournalAIAccessLogs
                logs={[
                    {
                        id: 1,
                        journal_id: 7,
                        chat_session_id: 2,
                        context_type: "recent",
                        accessed_at: "2026-01-01T10:00:00Z",
                        journal: { id: 7, title: "Jurnal 7", created_at: "2026-01-01" },
                    },
                ]}
            />
        );

        fireEvent.click(screen.getByText("Log Akses AI"));
        expect(screen.getByText("Jurnal 7")).toBeInTheDocument();
        expect(screen.getByText(/Konteks: recent/i)).toBeInTheDocument();
    });
});
