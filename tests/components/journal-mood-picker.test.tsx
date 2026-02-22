import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalMoodPicker } from "@/app/dashboard/journal/_components/JournalMoodPicker";

const moods = [
    { id: 1, emoji: "😊", label: "Bahagia", color: "#22c55e" },
    { id: 2, emoji: "😔", label: "Sedih", color: "#6b7280" },
];

describe("JournalMoodPicker", () => {
    it("shows default trigger label", () => {
        render(
            <JournalMoodPicker
                moods={moods}
                isOpen={false}
                onToggle={vi.fn()}
                onSelectMood={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /Pilih Mood/i })).toBeInTheDocument();
    });

    it("selects mood from dropdown", () => {
        const onSelectMood = vi.fn();
        const onToggle = vi.fn();

        render(
            <JournalMoodPicker
                moods={moods}
                isOpen
                onToggle={onToggle}
                onSelectMood={onSelectMood}
            />
        );

        fireEvent.click(screen.getByText("Bahagia"));

        expect(onSelectMood).toHaveBeenCalledWith(1);
        expect(onToggle).toHaveBeenCalledTimes(1);
    });
});
