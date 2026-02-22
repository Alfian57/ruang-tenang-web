import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatSummaryPanel } from "@/app/dashboard/chat/_components/ChatSummaryPanel";

describe("ChatSummaryPanel", () => {
    it("shows generate button when no summary", () => {
        const onGenerate = vi.fn();
        render(
            <ChatSummaryPanel
                summary={null}
                isGenerating={false}
                onGenerate={onGenerate}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Buat Ringkasan/i }));
        expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it("renders summary content and topics", () => {
        render(
            <ChatSummaryPanel
                summary={{
                    summary: "Ringkasan percakapan",
                    main_topics: ["kecemasan", "tidur"],
                    sentiment: "tenang",
                } as any}
                isGenerating={false}
                onGenerate={vi.fn()}
            />
        );

        expect(screen.getByText("Ringkasan percakapan")).toBeInTheDocument();
        expect(screen.getByText("kecemasan")).toBeInTheDocument();
        expect(screen.getByText(/Mood:/i)).toBeInTheDocument();
    });
});
