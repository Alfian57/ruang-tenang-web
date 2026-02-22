import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import { InputDialog, useInputDialog } from "@/components/ui/input-dialog";

beforeEach(() => {
    vi.useRealTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("InputDialog", () => {
    it("shows URL validation error for invalid URL", async () => {
        const onConfirm = vi.fn();

        render(
            <InputDialog
                isOpen
                onClose={vi.fn()}
                onConfirm={onConfirm}
                title="Tambah URL"
                variant="url"
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Masukkan nilai..."), {
            target: { value: "bukan-url" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

        expect(screen.getByText("URL tidak valid")).toBeVisible();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("submits valid value and closes dialog", async () => {
        const onConfirm = vi.fn();
        const onClose = vi.fn();

        render(
            <InputDialog
                isOpen
                onClose={onClose}
                onConfirm={onConfirm}
                title="Tambah URL"
                variant="url"
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Masukkan nilai..."), {
            target: { value: "https://example.com" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

        await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith("https://example.com");
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("uses custom validation and clears error on input change", async () => {
        render(
            <InputDialog
                isOpen
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Tambah Nilai"
                validation={(value) => (value.trim().length < 3 ? "Minimal 3 karakter" : null)}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Masukkan nilai..."), {
            target: { value: "ab" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
        expect(screen.getByText("Minimal 3 karakter")).toBeVisible();

        fireEvent.change(screen.getByPlaceholderText("Masukkan nilai..."), {
            target: { value: "abcd" },
        });
        expect(screen.queryByText("Minimal 3 karakter")).not.toBeInTheDocument();
    });

    it("submits with Enter key", async () => {
        const onConfirm = vi.fn();
        const onClose = vi.fn();

        render(
            <InputDialog
                isOpen
                onClose={onClose}
                onConfirm={onConfirm}
                title="Nama"
                variant="default"
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Masukkan nilai..."), {
            target: { value: "nilai enter" },
        });
        fireEvent.keyDown(screen.getByPlaceholderText("Masukkan nilai..."), { key: "Enter" });

        await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith("nilai enter");
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("resets to new defaultValue on reopen and supports image variant", async () => {
        const onClose = vi.fn();
        const { rerender } = render(
            <InputDialog
                isOpen
                onClose={onClose}
                onConfirm={vi.fn()}
                title="Gambar"
                variant="image"
                defaultValue="https://a.com/img.jpg"
            />
        );

        const input = screen.getByDisplayValue("https://a.com/img.jpg");
        expect(input).toHaveAttribute("type", "url");

        await userEvent.click(screen.getByRole("button", { name: "Batal" }));
        expect(onClose).toHaveBeenCalledTimes(1);

        rerender(
            <InputDialog
                isOpen
                onClose={onClose}
                onConfirm={vi.fn()}
                title="Gambar"
                variant="image"
                defaultValue="https://b.com/new.jpg"
            />
        );

        expect(screen.getByDisplayValue("https://b.com/new.jpg")).toBeInTheDocument();
    });
});

function InputDialogHookHarness() {
    const [result, setResult] = useState<string>("pending");
    const { prompt, InputDialog } = useInputDialog();

    return (
        <div>
            <button
                onClick={async () => {
                    const value = await prompt({
                        title: "Masukkan Link",
                        variant: "url",
                        defaultValue: "https://example.com",
                        confirmText: "OK",
                        cancelText: "Tutup",
                    });
                    setResult(value ?? "null");
                }}
            >
                open-prompt
            </button>
            <span data-testid="prompt-result">{result}</span>
            <InputDialog />
        </div>
    );
}

describe("useInputDialog", () => {
    it("resolves value on confirm", async () => {
        const user = userEvent.setup();
        render(<InputDialogHookHarness />);

        await user.click(screen.getByRole("button", { name: "open-prompt" }));
        await user.click(screen.getByRole("button", { name: "OK" }));

        await waitFor(() => {
            expect(screen.getByTestId("prompt-result")).toHaveTextContent("https://example.com");
        });
    });

    it("resolves null on cancel", async () => {
        const user = userEvent.setup();
        render(<InputDialogHookHarness />);

        await user.click(screen.getByRole("button", { name: "open-prompt" }));
        await user.click(screen.getByRole("button", { name: "Tutup" }));

        await waitFor(() => {
            expect(screen.getByTestId("prompt-result")).toHaveTextContent("null");
        });
    });
});
