import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReportModal } from "@/components/ui/report-modal";

describe("ReportModal", () => {
    it("disables submit button when reason is not selected", () => {
        render(
            <ReportModal
                isOpen
                onClose={vi.fn()}
                onSubmit={vi.fn().mockResolvedValue(undefined)}
                reportType="article"
                contentTitle="Artikel A"
            />
        );

        expect(screen.getByRole("button", { name: "Kirim Laporan" })).toBeDisabled();
    });

    it("submits selected reason and description", async () => {
        const onClose = vi.fn();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <ReportModal
                isOpen
                onClose={onClose}
                onSubmit={onSubmit}
                reportType="forum"
                contentId={99}
            />
        );

        fireEvent.click(screen.getByDisplayValue("spam"));
        fireEvent.change(screen.getByLabelText("Deskripsi Tambahan (opsional)"), {
            target: { value: "Konten promosi berulang" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Kirim Laporan" }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                report_type: "forum",
                content_id: 99,
                user_id: undefined,
                reason: "spam",
                description: "Konten promosi berulang",
            });
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("renders user target description when reporting a user", () => {
        render(
            <ReportModal
                isOpen
                onClose={vi.fn()}
                onSubmit={vi.fn().mockResolvedValue(undefined)}
                reportType="user"
                userId={7}
                userName="Nadia"
            />
        );

        expect(screen.getByText(/pengguna "Nadia"/i)).toBeInTheDocument();
    });

    it("shows API error message when submit fails", async () => {
        const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));

        render(
            <ReportModal
                isOpen
                onClose={vi.fn()}
                onSubmit={onSubmit}
                reportType="article"
                contentId={1}
            />
        );

        fireEvent.click(screen.getByDisplayValue("harmful"));
        fireEvent.click(screen.getByRole("button", { name: "Kirim Laporan" }));

        expect(await screen.findByText("Server error")).toBeInTheDocument();
    });

    it("resets selected reason and description when closed", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        const { rerender } = render(
            <ReportModal
                isOpen
                onClose={onClose}
                onSubmit={vi.fn().mockResolvedValue(undefined)}
                reportType="forum_post"
                contentId={11}
            />
        );

        fireEvent.click(screen.getByDisplayValue("spam"));
        fireEvent.change(screen.getByLabelText("Deskripsi Tambahan (opsional)"), {
            target: { value: "detail awal" },
        });

        await user.click(screen.getByRole("button", { name: "Batal" }));
        expect(onClose).toHaveBeenCalledTimes(1);

        rerender(
            <ReportModal
                isOpen
                onClose={onClose}
                onSubmit={vi.fn().mockResolvedValue(undefined)}
                reportType="forum_post"
                contentId={11}
            />
        );

        expect(screen.getByLabelText("Deskripsi Tambahan (opsional)")).toHaveValue("");
        expect(screen.getByDisplayValue("spam")).not.toBeChecked();
        expect(screen.getByRole("button", { name: "Kirim Laporan" })).toBeDisabled();
    });
});
