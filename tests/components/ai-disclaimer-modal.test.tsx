import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AIDisclaimerModal } from "@/components/ui/ai-disclaimer-modal";

describe("AIDisclaimerModal", () => {
    it("calls onDecline when clicking back button", async () => {
        const user = userEvent.setup();
        const onDecline = vi.fn();

        render(
            <AIDisclaimerModal
                isOpen
                onAccept={vi.fn().mockResolvedValue(undefined)}
                onDecline={onDecline}
            />
        );

        await user.click(screen.getByRole("button", { name: "Kembali" }));
        expect(onDecline).toHaveBeenCalledTimes(1);
    });

    it("shows loading state while accepting", async () => {
        const user = userEvent.setup();
        let resolveAccept: (() => void) | undefined;
        const onAccept = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveAccept = resolve;
                })
        );

        render(<AIDisclaimerModal isOpen onAccept={onAccept} />);

        await user.click(screen.getByRole("button", { name: "Saya Mengerti & Setuju" }));

        expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled();

        resolveAccept?.();

        await waitFor(() => {
            expect(onAccept).toHaveBeenCalledTimes(1);
        });
    });
});
