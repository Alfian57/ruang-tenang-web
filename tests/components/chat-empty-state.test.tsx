import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/app/dashboard/chat/_components/EmptyState";

describe("Chat EmptyState", () => {
    it("calls onCreateSession when clicking create button", () => {
        const onCreateSession = vi.fn();

        render(<EmptyState onCreateSession={onCreateSession} />);

        fireEvent.click(screen.getByRole("button", { name: /Buat Obrolan Baru/i }));
        expect(onCreateSession).toHaveBeenCalledTimes(1);
    });

    it("renders suggested prompts and handles click", () => {
        const onSuggestedPromptClick = vi.fn();

        render(
            <EmptyState
                onCreateSession={vi.fn()}
                onSuggestedPromptClick={onSuggestedPromptClick}
                suggestedPrompts={[
                    { text: "Saya merasa cemas", category: "mood" } as any,
                    { text: "Saya sulit fokus", category: "general" } as any,
                ]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Saya merasa cemas/i }));
        expect(onSuggestedPromptClick).toHaveBeenCalledWith("Saya merasa cemas");
    });
});
