import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChangePasswordModal } from "@/components/layout/dashboard/ChangePasswordModal";

const updatePassword = vi.fn();

vi.mock("@/components/providers/AuthProvider", () => ({
    useAuth: () => ({ token: "token-123" }),
}));

vi.mock("@/services/api", () => ({
    authService: {
        updatePassword: (...args: unknown[]) => updatePassword(...args),
    },
}));

describe("ChangePasswordModal", () => {
    it("shows validation error when confirm password mismatches", async () => {
        render(<ChangePasswordModal isOpen onClose={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Password Saat Ini"), { target: { value: "oldpass" } });
        fireEvent.change(screen.getByLabelText("Password Baru"), { target: { value: "newpass1" } });
        fireEvent.change(screen.getByLabelText("Konfirmasi Password Baru"), { target: { value: "newpass2" } });

        fireEvent.click(screen.getByRole("button", { name: "Simpan Password" }));

        expect(await screen.findByText("Password tidak cocok")).toBeInTheDocument();
        expect(updatePassword).not.toHaveBeenCalled();
    });

    it("submits password change", async () => {
        updatePassword.mockResolvedValue({});

        render(<ChangePasswordModal isOpen onClose={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Password Saat Ini"), { target: { value: "oldpass" } });
        fireEvent.change(screen.getByLabelText("Password Baru"), { target: { value: "newpass1" } });
        fireEvent.change(screen.getByLabelText("Konfirmasi Password Baru"), { target: { value: "newpass1" } });

        fireEvent.click(screen.getByRole("button", { name: "Simpan Password" }));

        await waitFor(() =>
            expect(updatePassword).toHaveBeenCalledWith("token-123", {
                old_password: "oldpass",
                new_password: "newpass1",
                new_password_confirmation: "newpass1",
            })
        );

        expect(screen.getByText("Password berhasil diubah!")).toBeInTheDocument();
    });
});
