import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EditProfileModal } from "@/components/layout/dashboard/EditProfileModal";

const refreshUser = vi.fn();
const updateProfile = vi.fn();
const uploadImage = vi.fn();

vi.mock("@/components/providers/AuthProvider", () => ({
    useAuth: () => ({
        user: { name: "Alfian", email: "alfian@mail.com", avatar: "avatar.jpg" },
        token: "token-123",
        refreshUser,
    }),
}));

vi.mock("@/services/api", () => ({
    authService: {
        updateProfile: (...args: unknown[]) => updateProfile(...args),
    },
    uploadService: {
        uploadImage: (...args: unknown[]) => uploadImage(...args),
    },
}));

vi.mock("@/services/http/upload-url", () => ({
    getUploadUrl: (path: string) => `https://cdn.local/${path}`,
}));

describe("EditProfileModal", () => {
    it("submits profile update and refreshes user", async () => {
        updateProfile.mockResolvedValue({});
        const onClose = vi.fn();

        render(<EditProfileModal isOpen onClose={onClose} />);

        fireEvent.change(screen.getByLabelText("Nama Lengkap"), { target: { value: "Alfi Updated" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alfi@ruangtenang.id" } });

        fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

        await waitFor(() =>
            expect(updateProfile).toHaveBeenCalledWith("token-123", {
                name: "Alfi Updated",
                email: "alfi@ruangtenang.id",
                avatar_url: "avatar.jpg",
            })
        );
        expect(refreshUser).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("shows max file size error", async () => {
        render(<EditProfileModal isOpen onClose={vi.fn()} />);

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const tooLargeFile = new File([new Uint8Array(6 * 1024 * 1024)], "avatar.png", { type: "image/png" });

        fireEvent.change(input, { target: { files: [tooLargeFile] } });

        expect(await screen.findByText("Ukuran file maksimal 5MB")).toBeInTheDocument();
        expect(uploadImage).not.toHaveBeenCalled();
    });
});
