import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

describe("DeleteConfirmationModal", () => {
    it("renders title, description, and action buttons when open", () => {
        render(
            <DeleteConfirmationModal
                isOpen
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Hapus Catatan"
                description="Data ini akan hilang permanen"
            />
        );

        expect(screen.getByText("Hapus Catatan")).toBeInTheDocument();
        expect(screen.getByText("Data ini akan hilang permanen")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Batal" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ya, Hapus" })).toBeInTheDocument();
    });

    it("calls onClose and onConfirm on button click", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onConfirm = vi.fn();

        render(
            <DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} />
        );

        await user.click(screen.getByRole("button", { name: "Batal" }));
        await user.click(screen.getByRole("button", { name: "Ya, Hapus" }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("shows loading state and disables buttons", () => {
        render(
            <DeleteConfirmationModal
                isOpen
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                isLoading
            />
        );

        expect(screen.getByRole("button", { name: "Batal" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Menghapus..." })).toBeDisabled();
    });
});
