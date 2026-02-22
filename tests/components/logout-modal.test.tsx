import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LogoutModal } from "@/components/ui/logout-modal";

describe("LogoutModal", () => {
    it("renders text and action buttons", () => {
        render(<LogoutModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} />);

        expect(screen.getByText("Keluar dari Akun?")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Batal" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ya, Keluar" })).toBeInTheDocument();
    });

    it("calls onClose and onConfirm", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onConfirm = vi.fn();

        render(<LogoutModal isOpen onClose={onClose} onConfirm={onConfirm} />);

        await user.click(screen.getByRole("button", { name: "Batal" }));
        await user.click(screen.getByRole("button", { name: "Ya, Keluar" }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
