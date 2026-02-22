import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";

describe("ConfirmDialog", () => {
    it("renders title and description when open", () => {
        render(
            <ConfirmDialog
                isOpen
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Hapus item"
                description="Aksi ini tidak bisa dibatalkan"
            />
        );

        expect(screen.getByText("Hapus item")).toBeInTheDocument();
        expect(screen.getByText("Aksi ini tidak bisa dibatalkan")).toBeInTheDocument();
    });

    it("calls onClose when cancel is clicked", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <ConfirmDialog
                isOpen
                onClose={onClose}
                onConfirm={vi.fn()}
                title="Keluar"
                description="Yakin ingin keluar?"
                cancelText="Batal"
            />
        );

        await user.click(screen.getByRole("button", { name: "Batal" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm and shows processing state", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn(
            () => new Promise<void>((resolve) => setTimeout(resolve, 20))
        );

        render(
            <ConfirmDialog
                isOpen
                onClose={vi.fn()}
                onConfirm={onConfirm}
                title="Konfirmasi"
                description="Lanjutkan aksi"
                confirmText="Ya, lanjutkan"
            />
        );

        await user.click(screen.getByRole("button", { name: "Ya, lanjutkan" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Ya, lanjutkan" })).toBeInTheDocument();
        });
    });

    it("renders warning variant style and custom icon", () => {
        render(
            <ConfirmDialog
                isOpen
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Peringatan"
                description="Periksa ulang"
                variant="warning"
                icon={<span data-testid="custom-icon">!</span>}
            />
        );

        expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Konfirmasi" })).toHaveClass("bg-yellow-600");
    });

    it("disables actions and prevents close while externally loading", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <ConfirmDialog
                isOpen
                onClose={onClose}
                onConfirm={vi.fn()}
                title="Memproses"
                description="Tunggu"
                isLoading
            />
        );

        expect(screen.getByRole("button", { name: "Batal" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "Batal" }));
        expect(onClose).not.toHaveBeenCalled();
    });
});

function ConfirmDialogHookHarness() {
    const [result, setResult] = useState<string>("pending");
    const { confirm, ConfirmDialog } = useConfirmDialog();

    return (
        <div>
            <button
                onClick={async () => {
                    const accepted = await confirm({
                        title: "Yakin?",
                        description: "Pilih tindakan",
                        confirmText: "Ya",
                        cancelText: "Tidak",
                        variant: "danger",
                    });
                    setResult(accepted ? "accepted" : "rejected");
                }}
            >
                open-hook
            </button>
            <span data-testid="result">{result}</span>
            <ConfirmDialog />
        </div>
    );
}

describe("useConfirmDialog", () => {
    it("resolves true on confirm", async () => {
        const user = userEvent.setup();
        render(<ConfirmDialogHookHarness />);

        await user.click(screen.getByRole("button", { name: "open-hook" }));
        await user.click(screen.getByRole("button", { name: "Ya" }));

        await waitFor(() => {
            expect(screen.getByTestId("result")).toHaveTextContent("accepted");
        });
    });

    it("resolves false on cancel", async () => {
        const user = userEvent.setup();
        render(<ConfirmDialogHookHarness />);

        await user.click(screen.getByRole("button", { name: "open-hook" }));
        await user.click(screen.getByRole("button", { name: "Tidak" }));

        await waitFor(() => {
            expect(screen.getByTestId("result")).toHaveTextContent("rejected");
        });
    });
});
