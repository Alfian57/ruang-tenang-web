import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalPrivacySettings } from "@/app/dashboard/journal/_components/JournalPrivacySettings";

const settings = {
    id: 1,
    user_id: 1,
    allow_ai_access: true,
    ai_context_days: 7,
    ai_context_max_entries: 5,
    default_share_with_ai: false,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
};

describe("JournalPrivacySettings", () => {
    it("expands card and toggles ai access", () => {
        const onUpdate = vi.fn();

        render(
            <JournalPrivacySettings
                settings={settings}
                onUpdate={onUpdate}
            />
        );

        fireEvent.click(screen.getByText("Pengaturan Privasi AI"));
        expect(screen.getByText(/Izinkan AI Membaca Jurnal/i)).toBeInTheDocument();

        const toggles = document.querySelectorAll("button.h-6.w-11");
        fireEvent.click(toggles[0]);
        expect(onUpdate).toHaveBeenCalledWith({ allow_ai_access: false });
    });

    it("updates context days and max entries", () => {
        const onUpdate = vi.fn();

        render(
            <JournalPrivacySettings
                settings={settings}
                onUpdate={onUpdate}
            />
        );

        fireEvent.click(screen.getByText("Pengaturan Privasi AI"));

        const numberInputs = screen.getAllByRole("spinbutton");
        fireEvent.change(numberInputs[0], { target: { value: "10" } });
        fireEvent.change(numberInputs[1], { target: { value: "8" } });

        expect(onUpdate).toHaveBeenCalledWith({ ai_context_days: 10 });
        expect(onUpdate).toHaveBeenCalledWith({ ai_context_max_entries: 8 });
    });
});
