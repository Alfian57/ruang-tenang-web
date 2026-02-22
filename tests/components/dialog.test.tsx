import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

describe("Dialog", () => {
    it("opens and closes dialog content", async () => {
        const user = userEvent.setup();

        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Buka Dialog</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Judul Dialog</DialogTitle>
                        <DialogDescription>Deskripsi dialog</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );

        await user.click(screen.getByRole("button", { name: "Buka Dialog" }));

        expect(screen.getByText("Judul Dialog")).toBeVisible();
        expect(screen.getByText("Deskripsi dialog")).toBeVisible();

        await user.click(screen.getByRole("button", { name: "Close" }));

        await waitFor(() => {
            expect(screen.queryByText("Judul Dialog")).not.toBeInTheDocument();
        });
    });

    it("calls onOpenChange when close button is clicked", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();

        render(
            <Dialog open onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dialog Selalu Buka</DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );

        await user.click(screen.getByRole("button", { name: "Close" }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
