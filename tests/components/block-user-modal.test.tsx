import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BlockUserModal } from "@/components/ui/block-user-modal";

describe("BlockUserModal", () => {
    it("submits reason and closes on success", async () => {
        const onClose = vi.fn();
        const onConfirm = vi.fn().mockResolvedValue(undefined);

        render(
            <BlockUserModal
                isOpen
                onClose={onClose}
                onConfirm={onConfirm}
                userName="Budi"
            />
        );

        fireEvent.change(screen.getByLabelText("Alasan (opsional)"), {
            target: { value: "Postingan mengganggu" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Blokir Pengguna" }));

        await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith("Postingan mengganggu");
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("shows error message when confirm fails", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn().mockRejectedValue(new Error("Gagal blokir"));

        render(
            <BlockUserModal
                isOpen
                onClose={vi.fn()}
                onConfirm={onConfirm}
                userName="Budi"
            />
        );

        await user.click(screen.getByRole("button", { name: "Blokir Pengguna" }));

        await waitFor(() => {
            expect(screen.getByText("Gagal blokir")).toBeVisible();
        });
    });
});
